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
  topicId: row.topic_id,
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
  topic_id: mcq.topicId,
  image_url: mcq.image_url,
  explanation_image_url: mcq.explanation_image_url,
  // Default values for required fields
  university_id: (mcq.university_id === 'all' || !mcq.university_id) ? null : mcq.university_id,
  correct_answer: mcq.options.findIndex(o => o.is_correct).toString(), // Store index
  format: 'MCQ',
  mode: 'APPLY',
  status: 'PUBLISHED'
});

export const dbService = {
  // Curriculum fetching
  getCurriculum: async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, topics(id, name)')
      .order('name');
    if (error) throw error;
    return data;
  },

  // Fetch paginated questions from Supabase with optional filters
  getPaginatedQuestions: async (
    page: number,
    limit: number,
    filters?: { search?: string; subject?: string; topicId?: string }
  ): Promise<{ data: MCQ[]; count: number | null }> => {
    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (filters?.subject && filters.subject !== 'All') {
      query = query.eq('topic', filters.subject);
    }

    if (filters?.topicId && filters.topicId !== 'All') {
      query = query.eq('topic_id', filters.topicId);
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
    filters?: { search?: string; subject?: string; topicId?: string }
  ): Promise<MCQ[]> => {
    let query = supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.subject && filters.subject !== 'All') {
      query = query.eq('topic', filters.subject);
    }

    if (filters?.topicId && filters.topicId !== 'All') {
      query = query.eq('topic_id', filters.topicId);
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

    const row = mapToRow(question) as any;
    row.created_by = user.id;

    const { data, error } = await (supabase
      .from('questions') as any)
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
    const rowUpdates: any = {};
    if (updates.question) rowUpdates.stem = updates.question;
    if (updates.options) {
      rowUpdates.options = updates.options;
      rowUpdates.correct_answer = updates.options.findIndex(o => o.is_correct).toString();
    }
    if (updates.explanation) rowUpdates.full_solution = updates.explanation;
    if (updates.subject) rowUpdates.topic = updates.subject;
    if (updates.topic) rowUpdates.subtopic = updates.topic;
    if (updates.topicId) rowUpdates.topic_id = updates.topicId;
    if (updates.image_url !== undefined) rowUpdates.image_url = updates.image_url;
    if (updates.explanation_image_url !== undefined) rowUpdates.explanation_image_url = updates.explanation_image_url;

    const { error } = await (supabase
      .from('questions') as any)
      .update(rowUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Bulk insert questions
  bulkInsertQuestions: async (questions: Omit<MCQ, 'id' | 'created_at'>[]): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User must be logged in to import questions.");
    }

    const rows = questions.map(q => {
      const row = mapToRow(q) as any;
      row.created_by = user.id;
      return row;
    });

    const { data, error } = await (supabase
      .from('questions') as any)
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
      .select('topic');

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

  // Notification methods
  getNotifications: async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  createNotification: async (title: string, message: string, targetRole: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Auth required");
    return await supabase
      .from('notifications')
      .insert({
        title,
        message,
        target_role: targetRole,
        created_by: user.id
      });
  }
};