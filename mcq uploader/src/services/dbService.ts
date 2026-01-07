import { supabase } from '../lib/supabaseClient';
import { MCQ, Stats } from '../../types';

// Helper to map DB row to App Type
const mapToMCQ = (row: any): MCQ => ({
  id: row.id,
  question: row.stem,
  options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
  explanation: row.full_solution || '',
  subject: row.topic,
  topic: row.subtopic,
  image_url: row.image_url,
  explanation_image_url: row.explanation_image_url,
  created_at: row.created_at,
  university_id: row.university_id
});

// Helper to map App Type to DB Row
const mapToRow = (mcq: Omit<MCQ, 'id' | 'created_at'>) => ({
  stem: mcq.question,
  options: mcq.options,
  full_solution: mcq.explanation,
  topic: mcq.subject,
  subtopic: mcq.topic,
  image_url: mcq.image_url,
  explanation_image_url: mcq.explanation_image_url,
  // Default values for required fields
  university_id: (mcq.university_id === 'all' || !mcq.university_id) ? null : mcq.university_id,
  correct_answer: mcq.options.findIndex(o => o.is_correct).toString(), // Store index
  format: 'MCQ',
  mode: 'APPLY',
  created_by: '00000000-0000-0000-0000-000000000000', // Default system UUID, should be replaced by auth.uid() in RLS
  status: 'PUBLISHED'
});

export const dbService = {
  // Fetch paginated questions from Supabase with optional filters
  getPaginatedQuestions: async (
    page: number,
    limit: number,
    filters?: { search?: string; subject?: string; topic?: string }
  ): Promise<{ data: MCQ[]; count: number | null }> => {
    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (filters?.subject && filters.subject !== 'All') {
      query = query.eq('topic', filters.subject); // Subject maps to topic column
    }

    if (filters?.topic && filters.topic !== 'All') {
      query = query.eq('subtopic', filters.topic); // Topic maps to subtopic column
    }

    if (filters?.search) {
      query = query.ilike('stem', `%${filters.search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching paginated questions:', error);
      throw error;
    }
    return { data: (data || []).map(mapToMCQ), count };
  },

  // Fetch ALL questions for export (respecting filters)
  getAllQuestions: async (
    filters?: { search?: string; subject?: string; topic?: string }
  ): Promise<MCQ[]> => {
    let query = supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.subject && filters.subject !== 'All') {
      query = query.eq('topic', filters.subject);
    }

    if (filters?.topic && filters.topic !== 'All') {
      query = query.eq('subtopic', filters.topic);
    }

    if (filters?.search) {
      query = query.ilike('stem', `%${filters.search}%`);
    }

    const { data, error } = await query.limit(5000);

    if (error) {
      console.error('Error fetching all questions for export:', error);
      throw error;
    }
    return (data || []).map(mapToMCQ);
  },

  // Get single question by ID
  getQuestion: async (id: string): Promise<MCQ | undefined> => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching question:', error);
      return undefined;
    }
    return mapToMCQ(data);
  },

  // Insert a single question
  insertQuestion: async (question: Omit<MCQ, 'id' | 'created_at'>): Promise<MCQ> => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User must be logged in to create questions.");
    }

    const row = mapToRow(question);
    row.created_by = user.id; // Override hardcoded default

    const { data, error } = await supabase
      .from('questions')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Error inserting question:', error);
      throw error;
    }
    return mapToMCQ(data);
  },

  // Update existing question
  updateQuestion: async (id: string, updates: Partial<Omit<MCQ, 'id' | 'created_at'>>): Promise<void> => {
    // Partial mapping logic
    const rowUpdates: any = {};
    if (updates.question) rowUpdates.stem = updates.question;
    if (updates.options) {
      rowUpdates.options = updates.options;
      rowUpdates.correct_answer = updates.options.findIndex(o => o.is_correct).toString();
    }
    if (updates.explanation) rowUpdates.full_solution = updates.explanation;
    if (updates.subject) rowUpdates.topic = updates.subject;
    if (updates.topic) rowUpdates.subtopic = updates.topic;
    if (updates.image_url !== undefined) rowUpdates.image_url = updates.image_url;
    if (updates.explanation_image_url !== undefined) rowUpdates.explanation_image_url = updates.explanation_image_url;

    const { error } = await supabase
      .from('questions')
      .update(rowUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Bulk insert questions
  bulkInsertQuestions: async (questions: Omit<MCQ, 'id' | 'created_at'>[]): Promise<number> => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User must be logged in to import questions.");
    }

    const rows = questions.map(q => {
      const row = mapToRow(q);
      row.created_by = user.id;
      return row;
    });

    const { data, error } = await supabase
      .from('questions')
      .insert(rows)
      .select();

    if (error) {
      console.error('Error bulk inserting questions:', error);
      throw error;
    }
    return data ? data.length : 0;
  },

  // Delete question
  deleteQuestion: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // Get Stats
  getStats: async (): Promise<Stats> => {
    const { data, error } = await supabase
      .from('questions')
      .select('topic'); // 'topic' in DB is Subject in App

    if (error) {
      console.error('Error fetching stats:', error);
      return { total: 0, bySubject: {} };
    }

    const bySubject: Record<string, number> = {};

    data?.forEach((row: { topic: string }) => {
      bySubject[row.topic] = (bySubject[row.topic] || 0) + 1;
    });

    return {
      total: data?.length || 0,
      bySubject,
    };
  },

  // Fetch all approved institutes for university selection
  getInstitutes: async (): Promise<{ id: string; name: string }[]> => {
    const { data, error } = await supabase
      .from('institutes')
      .select('id, name')
      .eq('status', 'APPROVED')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching institutes:', error);
      return [];
    }

    return data || [];
  },

  // Fetch full institute details for management
  getAllInstitutesFull: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('institutes')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching all institutes:', error);
      return [];
    }

    return data || [];
  },

  createInstitute: async (name: string, domain?: string, officialEmail?: string): Promise<{ data: any; error: any }> => {
    const { data, error } = await supabase
      .from('institutes')
      .insert([
        {
          name,
          domain: domain || null,
          official_email: officialEmail || null,
          status: 'APPROVED'
        }
      ])
      .select()
      .single();

    return { data, error };
  },

  deleteInstitute: async (id: string): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('institutes')
      .delete()
      .eq('id', id);

    return { error };
  },

  updateCurriculum: async (id: string, curriculum: any): Promise<{ error: any }> => {
    const { error } = await supabase
      .from('institutes')
      .update({ curriculum })
      .eq('id', id);
    return { error };
  },

  getNotifications: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
    return data || [];
  },

  createNotification: async (title: string, message: string, targetRole: string = 'STUDENT'): Promise<{ error: any }> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          title,
          message,
          target_role: targetRole,
          sender_id: user?.id
        }
      ]);
    return { error };
  }
};