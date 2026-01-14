import { supabase } from '../lib/supabaseClient';
import { StudyMaterial } from '../../types';

export const materialService = {
    getAllMaterials: async (): Promise<StudyMaterial[]> => {
        const { data, error } = await supabase
            .from('study_materials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching materials:', error);
            throw error;
        }

        return (data as any[] || []).map(row => ({
            id: row.id,
            universityId: row.university_id,
            subject: row.topic,
            topic: row.subtopic,
            title: row.title,
            content: row.content,
            summary: row.summary
        }));
    },

    getMaterialById: async (id: string): Promise<StudyMaterial | null> => {
        const { data, error } = await supabase
            .from('study_materials')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        const row = data as any;
        return {
            id: row.id,
            universityId: row.university_id,
            subject: row.topic,
            topic: row.subtopic,
            title: row.title,
            content: row.content,
            summary: row.summary
        };
    },

    createMaterial: async (material: Omit<StudyMaterial, 'id'>): Promise<StudyMaterial> => {
        const { data, error } = await supabase
            .from('study_materials')
            .insert({
                university_id: material.universityId,
                topic: material.subject,
                subtopic: material.topic,
                title: material.title,
                content: material.content,
                summary: material.summary,
                status: 'PUBLISHED'
            } as any)
            .select()
            .single();

        if (error) throw error;

        const row = data as any;
        return {
            id: row.id,
            universityId: row.university_id,
            subject: row.topic,
            topic: row.subtopic,
            title: row.title,
            content: row.content,
            summary: row.summary
        };
    },

    updateMaterial: async (id: string, updates: Partial<StudyMaterial>): Promise<void> => {
        const dbUpdates: any = {};
        if (updates.subject) dbUpdates.topic = updates.subject;
        if (updates.topic) dbUpdates.subtopic = updates.topic;
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.content) dbUpdates.content = updates.content;
        if (updates.summary) dbUpdates.summary = updates.summary;
        if (updates.universityId) dbUpdates.university_id = updates.universityId;

        const { error } = await supabase
            .from('study_materials')
            .update(dbUpdates as any)
            .eq('id', id);

        if (error) throw error;
    },

    deleteMaterial: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('study_materials')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
