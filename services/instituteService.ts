import { supabase } from '../supabase/client';
import { Institution } from '../types';

export const instituteService = {
    /**
     * Fetch all approved institutes for university selection.
     */
    async getAllInstitutes(): Promise<Institution[]> {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('institutes')
            .select('*')
            .eq('status', 'APPROVED')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching institutes:', error);
            return [];
        }

        return (data || []).map(row => ({
            id: row.id,
            name: row.name,
            officialEmail: row.official_email,
            domain: row.domain,
            contactPerson: row.contact_person,
            phone: row.phone,
            status: row.status as any,
            adminId: row.admin_id
        }));
    },

    /**
     * Fetch a single institute by ID.
     */
    async getInstituteById(id: string): Promise<Institution | undefined> {
        if (!supabase) return undefined;

        const { data, error } = await (supabase
            .from('institutes')
            .select('*')
            .eq('id', id)
            .single() as any);

        if (error || !data) {
            console.error('Error fetching institute:', error);
            return undefined;
        }

        return {
            id: data.id,
            name: data.name,
            officialEmail: data.official_email,
            domain: data.domain,
            contactPerson: data.contact_person,
            phone: data.phone,
            status: data.status as any,
            adminId: data.admin_id
        };
    },

    async createInstitute(name: string, domain?: string, officialEmail?: string): Promise<{ data: any; error: any }> {
        if (!supabase) return { data: null, error: new Error('Supabase not initialized') };

        const { data, error } = await (supabase
            .from('institutes')
            .insert([
                {
                    name,
                    domain: domain || null,
                    official_email: officialEmail || null,
                    status: 'APPROVED'
                }
            ] as any)
            .select()
            .single() as any);

        return { data, error };
    },

    async deleteInstitute(id: string): Promise<{ error: any }> {
        if (!supabase) return { error: new Error('Supabase not initialized') };

        const { error } = await supabase
            .from('institutes')
            .delete()
            .eq('id', id);

        return { error };
    }
};
