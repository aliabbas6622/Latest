import { supabase } from '../supabase/client';
import { StudyMaterial } from '../types';

/**
 * Service for managing study materials.
 * Adheres to "Understand Mode" philosophy: Conceptual clarity and calm reading.
 */
export const materialService = {
    /**
     * Fetch all materials (Super Admin view)
     */
    getAllMaterials: async (): Promise<StudyMaterial[]> => {
        if (!supabase) throw new Error('Supabase not configured');

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
            topicId: row.topic_id,
            universityId: row.university_id,
            subject: row.topic,
            topic: row.subtopic,
            title: row.title,
            content: row.content || '',
            summary: row.summary || ''
        }));
    },

    /**
     * Get published materials for a specific university and subject
     */
    getMaterialsForStudent: async (universityId: string, subject?: string): Promise<StudyMaterial[]> => {
        if (!supabase) throw new Error('Supabase not configured');

        let query = supabase
            .from('study_materials')
            .select('*')
            .eq('status', 'PUBLISHED')
            .eq('university_id', universityId);

        if (subject) {
            query = query.eq('topic', subject);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching materials for student:', error);
            throw error;
        }

        return (data as any[] || []).map(row => ({
            id: row.id,
            topicId: row.topic_id,
            universityId: row.university_id,
            subject: row.topic,
            topic: row.subtopic,
            title: row.title,
            content: row.content || '',
            summary: row.summary || ''
        }));
    },

    /**
     * Get a single material by ID
     */
    getMaterialById: async (id: string): Promise<StudyMaterial | null> => {
        if (!supabase) throw new Error('Supabase not configured');

        const { data, error } = await supabase
            .from('study_materials')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        const row = data as any;
        return {
            id: row.id,
            topicId: row.topic_id,
            universityId: row.university_id,
            subject: row.topic,
            topic: row.subtopic,
            title: row.title,
            content: row.content || '',
            summary: row.summary || ''
        };
    },

    /**
     * Create a new study material
     */
    createMaterial: async (material: Omit<StudyMaterial, 'id'>): Promise<StudyMaterial> => {
        if (!supabase) throw new Error('Supabase not configured');

        // Adhere to "One Topic = one content source" by using upsert on topic_id
        const { data, error } = await (supabase as any)
            .from('study_materials')
            .upsert({
                university_id: material.universityId,
                topic_id: material.topicId,
                topic: material.subject, // Legacy support
                subtopic: material.topic, // Legacy support
                title: material.title,
                content: material.content,
                summary: material.summary,
                status: 'PUBLISHED'
            }, { onConflict: 'topic_id' })
            .select()
            .single();

        if (error) throw error;

        const row = data as any;
        return {
            id: row.id,
            topicId: row.topic_id,
            universityId: row.university_id,
            subject: row.topic,
            topic: row.subtopic,
            title: row.title,
            content: row.content || '',
            summary: row.summary || ''
        };
    },

    /**
     * Bulk create study materials
     */
    bulkCreateMaterials: async (materials: Omit<StudyMaterial, 'id'>[]): Promise<void> => {
        if (!supabase) throw new Error('Supabase not configured');

        const { error } = await (supabase as any)
            .from('study_materials')
            .upsert(materials.map(m => ({
                university_id: m.universityId,
                topic_id: m.topicId,
                topic: m.subject,
                subtopic: m.topic,
                title: m.title,
                content: m.content,
                summary: m.summary,
                status: 'PUBLISHED'
            })), { onConflict: 'topic_id' });

        if (error) {
            console.error('Error bulk creating materials:', error);
            throw error;
        }
    },

    /**
     * Update an existing material
     */
    updateMaterial: async (id: string, updates: Partial<StudyMaterial>): Promise<void> => {
        if (!supabase) throw new Error('Supabase not configured');

        const dbUpdates: any = {};
        if (updates.subject) dbUpdates.topic = updates.subject;
        if (updates.topic) dbUpdates.subtopic = updates.topic;
        if (updates.topicId) dbUpdates.topic_id = updates.topicId;
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.content) dbUpdates.content = updates.content;
        if (updates.summary) dbUpdates.summary = updates.summary;
        if (updates.universityId) dbUpdates.university_id = updates.universityId;

        const { error } = await (supabase as any)
            .from('study_materials')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Delete a material
     */
    deleteMaterial: async (id: string): Promise<void> => {
        if (!supabase) throw new Error('Supabase not configured');

        const { error } = await supabase
            .from('study_materials')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
