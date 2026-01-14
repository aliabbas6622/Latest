import { supabase } from '../supabase/client';
import { UserRole } from '../types';

export interface AdminProfile {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    can_upload: boolean;
    institution_name?: string;
}

export const profileService = {
    /**
     * Fetch all users with administrative roles (SUPER_ADMIN or INSTITUTION_ADMIN)
     * Includes join with institutes to show institution name for branch admins
     */
    getAdmins: async (): Promise<AdminProfile[]> => {
        const { data, error } = await (supabase
            .from('profiles')
            .select(`
                id,
                email,
                name,
                role,
                can_upload,
                institutes (
                    name
                )
            `)
            .in('role', [UserRole.SUPER_ADMIN, UserRole.ADMIN])
            .order('role', { ascending: false }) as any);

        if (error) {
            console.error('Error fetching admins:', error);
            throw error;
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role as UserRole,
            can_upload: row.can_upload,
            institution_name: row.institutes?.name
        }));
    },

    /**
     * Update the upload permission for a specific user
     */
    updateUploadPermission: async (userId: string, canUpload: boolean): Promise<void> => {
        const { error } = await (supabase
            .from('profiles') as any)
            .update({ can_upload: canUpload })
            .eq('id', userId);

        if (error) {
            console.error('Error updating upload permission:', error);
            throw error;
        }
    },

    /**
     * Search for admins by name or email
     */
    searchAdmins: async (query: string): Promise<AdminProfile[]> => {
        const { data, error } = await (supabase
            .from('profiles')
            .select(`
                id,
                email,
                name,
                role,
                can_upload,
                institutes (
                    name
                )
            `)
            .in('role', [UserRole.SUPER_ADMIN, UserRole.ADMIN])
            .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
            .order('role', { ascending: false }) as any);

        if (error) {
            console.error('Error searching admins:', error);
            throw error;
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role as UserRole,
            can_upload: row.can_upload,
            institution_name: row.institutes?.name
        }));
    }
};
