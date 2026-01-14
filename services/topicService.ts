import { supabase } from '../supabase/client';

export interface Subject {
    id: string;
    name: string;
    institute_id: string | null;
    created_at: string;
}

export interface Topic {
    id: string;
    name: string;
    subject_id: string;
    created_at: string;
}

export const topicService = {
    async getAllSubjects(): Promise<Subject[]> {
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .order('name');
        if (error) throw error;
        return data || [];
    },

    async getTopicsBySubject(subjectId: string): Promise<Topic[]> {
        const { data, error } = await supabase
            .from('topics')
            .select('*')
            .eq('subject_id', subjectId)
            .order('name');
        if (error) throw error;
        return data || [];
    },

    async createSubject(name: string, instituteId: string | null = null): Promise<Subject> {
        const { data, error } = await (supabase as any)
            .from('subjects')
            .insert({ name, institute_id: instituteId })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async createTopic(name: string, subjectId: string): Promise<Topic> {
        const { data, error } = await (supabase as any)
            .from('topics')
            .insert({ name, subject_id: subjectId })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteTopic(id: string): Promise<void> {
        const { error } = await supabase
            .from('topics')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async deleteSubject(id: string): Promise<void> {
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
