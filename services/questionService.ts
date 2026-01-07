import { supabase } from '../supabase/client';
import { Question } from '../types';

export const questionService = {
    /**
     * Fetch all published questions for a specific university (including global ones)
     */
    getQuestionsByUniversity: async (universityId: string): Promise<Question[]> => {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .or(`university_id.eq.${universityId},university_id.is.null`)
            .eq('status', 'PUBLISHED')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }

        return ((data || []) as any[]).map(row => ({
            id: row.id,
            universityId: row.university_id,
            subject: row.topic, // topic in DB is Subject in App
            topic: row.subtopic, // subtopic in DB is Topic in App
            text: row.stem,
            options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
            correctAnswer: parseInt(row.correct_answer),
            explanation: row.full_solution || row.short_rationale || ''
        }));
    },

    /**
     * Fetch published questions by topic and university (including global ones)
     */
    getQuestionsByTopic: async (universityId: string, topic: string): Promise<Question[]> => {
        const { data, error } = await (supabase
            .from('questions')
            .select('*')
            .or(`university_id.eq.${universityId},university_id.is.null`)
            .eq('subtopic', topic)
            .eq('status', 'PUBLISHED')
            .order('created_at', { ascending: false }) as any);

        if (error) {
            console.error('Error fetching questions by topic:', error);
            throw error;
        }

        return ((data || []) as any[]).map(row => ({
            id: row.id,
            universityId: row.university_id,
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
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all questions:', error);
            throw error;
        }

        return ((data || []) as any[]).map(row => ({
            id: row.id,
            universityId: row.university_id,
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
    getQuestionCurriculum: async (universityId: string): Promise<Record<string, string[]>> => {
        const { data, error } = await (supabase
            .from('questions')
            .select('topic, subtopic')
            .or(`university_id.eq.${universityId},university_id.is.null`)
            .eq('status', 'PUBLISHED') as any);

        if (error) {
            console.error('Error fetching curriculum:', error);
            throw error;
        }

        const curriculum: Record<string, Set<string>> = {};
        (data || []).forEach((row: any) => {
            if (!curriculum[row.topic]) curriculum[row.topic] = new Set();
            curriculum[row.topic].add(row.subtopic);
        });

        // Convert Sets back to arrays for the return type
        const result: Record<string, string[]> = {};
        for (const [subject, topics] of Object.entries(curriculum)) {
            result[subject] = Array.from(topics);
        }
        return result;
    },

    /**
     * Delete a question
     */
    deleteQuestion: async (id: string): Promise<void> => {
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
