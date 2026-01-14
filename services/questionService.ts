import { supabase } from '../supabase/client';
import { Question } from '../types';
import type { Database } from '../supabase/database.types';

type DBQuestion = Database['public']['Tables']['questions']['Row'];

/**
 * Service for managing question-related data.
 * Adheres to "Apply Mode" philosophy: Execution, Speed, and Accuracy.
 */
export const questionService = {
    /**
     * Fetch all published questions for a specific university (including global ones)
     * Note: Does not return answers/solutions to students
     */
    getQuestionsByUniversity: async (universityId: string): Promise<Omit<Question, 'correctAnswer' | 'explanation'>[]> => {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase
            .from('questions')
            .select('id, university_id, topic, subtopic, topic_id, stem, options, hint, difficulty, tags')
            .or(`university_id.eq.${universityId},university_id.is.null`)
            .eq('status', 'PUBLISHED')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }

        return (data as any[] || []).map(row => ({
            id: row.id,
            topicId: row.topic_id,
            universityId: row.university_id,
            subject: row.topic,
            topic: row.subtopic,
            text: row.stem,
            options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
            difficulty: row.difficulty as any,
            tags: row.tags
        }));
    },

    /**
     * Fetch published questions by topic and university (including global ones)
     */
    getQuestionsByTopic: async (universityId: string, topic: string): Promise<Omit<Question, 'correctAnswer' | 'explanation'>[]> => {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase
            .from('questions')
            .select('id, university_id, topic, subtopic, topic_id, stem, options, hint, difficulty, tags')
            .or(`university_id.eq.${universityId},university_id.is.null`)
            .eq('subtopic', topic)
            .eq('status', 'PUBLISHED')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching questions by topic:', error);
            throw error;
        }

        return (data as any[] || []).map(row => ({
            id: row.id,
            topicId: row.topic_id,
            universityId: row.university_id,
            subject: row.topic,
            topic: row.subtopic,
            text: row.stem,
            options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
            difficulty: row.difficulty as any,
            tags: row.tags
        }));
    },

    /**
     * Fetch questions by exact topicId
     */
    getQuestionsByTopicId: async (topicId: string, universityId?: string): Promise<Question[]> => {
        if (!supabase) throw new Error('Supabase not configured');

        let query = supabase
            .from('questions')
            .select('*')
            .eq('topic_id', topicId)
            .eq('status', 'PUBLISHED');

        if (universityId) {
            query = query.or(`university_id.eq.${universityId},university_id.is.null`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return (data as any[] || []).map(row => ({
            id: row.id,
            topicId: row.topic_id,
            universityId: row.university_id || '',
            subject: row.topic,
            topic: row.subtopic,
            text: row.stem,
            options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
            correctAnswer: parseInt(row.correct_answer),
            explanation: row.full_solution || row.short_rationale || ''
        }));
    },

    /**
     * Fetch all questions (Super Admin view)
     */
    getAllQuestions: async (): Promise<Question[]> => {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all questions:', error);
            throw error;
        }

        return (data as any[] || []).map(row => ({
            id: row.id,
            topicId: row.topic_id,
            universityId: row.university_id || '',
            subject: row.topic,
            topic: row.subtopic,
            text: row.stem,
            options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
            correctAnswer: parseInt(row.correct_answer),
            explanation: row.full_solution || row.short_rationale || ''
        }));
    },

    /**
     * Get curriculum structure (subjects and topics) with question availability
     */
    getQuestionCurriculum: async (universityId: string): Promise<Record<string, { id: string, name: string }[]>> => {
        if (!supabase) throw new Error('Supabase not configured');

        // Fetch subjects and topics directly for structured curriculum
        const { data, error } = await supabase
            .from('subjects')
            .select(`
                name,
                topics (id, name)
            `)
            .order('name');

        if (error) {
            console.error('Error fetching curriculum:', error);
            throw error;
        }

        const result: Record<string, { id: string, name: string }[]> = {};
        (data as any[] || []).forEach(subject => {
            result[subject.name] = subject.topics.map((t: any) => ({
                id: t.id,
                name: t.name
            }));
        });

        return result;
    },

    getGatedQuestion: async (questionId: string) => {
        if (!supabase) throw new Error('Supabase not configured');

        // Cast to avoid incorrect 'never' inference on RPC arguments
        const { data, error } = await (supabase as any)
            .rpc('get_question_for_student', { p_question_id: questionId });

        if (error) {
            console.error('Error fetching gated question:', error);
            throw error;
        }

        const row = (data as any)?.[0];
        if (!row) return null;

        return {
            id: row.id,
            topicId: row.topic_id,
            subject: row.topic,
            topic: row.subtopic,
            text: row.stem,
            options: row.options,
            hint: row.hint,
            difficulty: row.difficulty,
            correctAnswer: row.correct_answer ? parseInt(row.correct_answer) : undefined,
            explanation: row.full_solution || row.short_rationale || '',
            hasAttempted: row.has_attempted
        };
    },

    /**
     * Delete a question
     */
    deleteQuestion: async (id: string): Promise<void> => {
        if (!supabase) throw new Error('Supabase not configured');

        const { error } = await supabase
            .from('questions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting question:', error);
            throw error;
        }
    }
};
