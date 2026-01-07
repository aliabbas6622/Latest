import { supabase } from '../supabase/client';

export interface Notification {
    id: string;
    created_at: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'urgent';
    target_role: 'STUDENT' | 'ADMIN' | 'ALL';
    created_by?: string;
}

export const notificationService = {
    /**
     * Fetch latest notifications for the current user's role
     */
    async getNotifications(): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }

        return data as Notification[];
    },

    /**
     * Send a new broadcast (Super Admin only)
     */
    async createBroadcast(notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .insert([notification]);

        if (error) {
            console.error('Error creating broadcast:', error);
            throw error;
        }
    }
};
