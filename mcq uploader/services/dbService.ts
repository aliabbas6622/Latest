import { MCQ, Stats, Option } from '../types';
import { supabase } from '../src/lib/supabaseClient';

export const dbService = {
  // Fetch all questions from Supabase
  getQuestions: async (): Promise<MCQ[]> => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    return (data || []).map(row => ({
      id: row.id,
      question: row.stem,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : (row.options || []),
      explanation: row.full_solution || row.short_rationale || '',
      subject: row.topic,
      topic: row.subtopic,
      image_url: row.image_url || undefined,
      explanation_image_url: row.explanation_image_url || undefined,
      created_at: row.created_at,
      university_id: row.university_id
    }));
  },

  // Paginated fetch with filters
  getPaginatedQuestions: async (
    page: number,
    limit: number,
    filters?: { search?: string; subject?: string; topic?: string }
  ): Promise<{ data: MCQ[]; count: number }> => {
    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' });

    if (filters) {
      if (filters.subject && filters.subject !== 'All') {
        query = query.eq('topic', filters.subject);
      }
      if (filters.topic && filters.topic !== 'All') {
        query = query.eq('subtopic', filters.topic);
      }
      if (filters.search) {
        query = query.ilike('stem', `%${filters.search}%`);
      }
    }

    const start = page * limit;
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);

    if (error) {
      console.error('Error fetching paginated questions:', error);
      throw error;
    }

    const mappedData = (data || []).map(row => ({
      id: row.id,
      question: row.stem,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : (row.options || []),
      explanation: row.full_solution || row.short_rationale || '',
      subject: row.topic,
      topic: row.subtopic,
      image_url: row.image_url || undefined,
      explanation_image_url: row.explanation_image_url || undefined,
      created_at: row.created_at,
      university_id: row.university_id
    }));

    return { data: mappedData, count: count || 0 };
  },

  // Get single question by ID
  getQuestion: async (id: string): Promise<MCQ | undefined> => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error fetching question:', error);
      throw error;
    }

    return {
      id: data.id,
      question: data.stem,
      options: typeof data.options === 'string' ? JSON.parse(data.options) : (data.options || []),
      explanation: data.full_solution || data.short_rationale || '',
      subject: data.topic,
      topic: data.subtopic,
      image_url: data.image_url || undefined,
      explanation_image_url: data.explanation_image_url || undefined,
      created_at: data.created_at,
      university_id: data.university_id
    };
  },

  // Insert a single question
  insertQuestion: async (question: Omit<MCQ, 'id' | 'created_at'>): Promise<MCQ> => {
    const dbRow = {
      stem: question.question,
      options: question.options, // Options are already Option[] objects with IDs
      full_solution: question.explanation,
      topic: question.subject,
      subtopic: question.topic,
      image_url: question.image_url,
      explanation_image_url: question.explanation_image_url,
      university_id: question.university_id,
      format: 'MCQ',
      status: 'PUBLISHED',
      difficulty: 'MEDIUM', // Default
      mode: 'PRACTICE', // Default
      created_by: (await supabase.auth.getUser()).data.user?.id || 'anonymous'
    };

    const { data, error } = await supabase
      .from('questions')
      .insert([dbRow])
      .select()
      .single();

    if (error) {
      console.error('Error inserting question:', error);
      throw error;
    }

    return {
      id: data.id,
      question: data.stem,
      options: typeof data.options === 'string' ? JSON.parse(data.options) : (data.options || []),
      explanation: data.full_solution || data.short_rationale || '',
      subject: data.topic,
      topic: data.subtopic,
      image_url: data.image_url || undefined,
      explanation_image_url: data.explanation_image_url || undefined,
      created_at: data.created_at,
      university_id: data.university_id
    };
  },

  // Update existing question
  updateQuestion: async (id: string, updates: Partial<Omit<MCQ, 'id' | 'created_at'>>): Promise<void> => {
    const dbUpdates: any = {};
    if (updates.question) dbUpdates.stem = updates.question;
    if (updates.options) dbUpdates.options = updates.options;
    if (updates.explanation) dbUpdates.full_solution = updates.explanation;
    if (updates.subject) dbUpdates.topic = updates.subject;
    if (updates.topic) dbUpdates.subtopic = updates.topic;
    if (updates.image_url) dbUpdates.image_url = updates.image_url;
    if (updates.explanation_image_url) dbUpdates.explanation_image_url = updates.explanation_image_url;
    if (updates.university_id) dbUpdates.university_id = updates.university_id;

    const { error } = await supabase
      .from('questions')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Bulk insert questions
  bulkInsertQuestions: async (questions: Omit<MCQ, 'id' | 'created_at'>[]): Promise<number> => {
    const userId = (await supabase.auth.getUser()).data.user?.id || 'anonymous';

    const dbRows = questions.map(q => ({
      stem: q.question,
      options: q.options,
      full_solution: q.explanation,
      topic: q.subject,
      subtopic: q.topic,
      image_url: q.image_url,
      explanation_image_url: q.explanation_image_url,
      university_id: q.university_id,
      format: 'MCQ',
      status: 'PUBLISHED',
      difficulty: 'MEDIUM',
      mode: 'PRACTICE',
      created_by: userId
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(dbRows)
      .select();

    if (error) {
      console.error('Error bulk inserting questions:', error);
      throw error;
    }

    return data?.length || 0;
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
    // For stats, we might want to aggregate by topic (which is Subject in our UI)
    const { data, error } = await supabase
      .from('questions')
      .select('topic');

    if (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }

    const bySubject: Record<string, number> = {};
    (data || []).forEach(q => {
      const subject = q.topic || 'Uncategorized';
      bySubject[subject] = (bySubject[subject] || 0) + 1;
    });

    return {
      total: data?.length || 0,
      bySubject,
    };
  },

  // System Settings (Role-based configuration)
  getSystemSettings: async (id: string): Promise<any> => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching system setting ${id}:`, error);
      return null;
    }
    return data.value;
  },

  updateSystemSettings: async (id: string, value: any): Promise<void> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { error } = await supabase
      .from('system_settings')
      .upsert({ id, value, updated_by: userId, updated_at: new Date().toISOString() });

    if (error) {
      console.error(`Error updating system setting ${id}:`, error);
      throw error;
    }
  },

  // Get current user role
  getUserRole: async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) return null;
    return data.role;
  },

  // Get all institutions
  getInstitutes: async (): Promise<{ id: string, name: string }[]> => {
    const { data, error } = await supabase
      .from('institutes')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching institutions:', error);
      return [];
    }
    return data || [];
  }
};