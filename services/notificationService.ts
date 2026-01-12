import { supabase } from '../supabase/client';

export interface Notification {
    id: string;
    created_at: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'urgent';
    target_role: 'STUDENT' | 'ADMIN' | 'ALL';
    created_by?: string;
    is_read?: boolean;
}

export const notificationService = {
    /**
     * Fetch latest notifications for the current user with read status
     */
    async getNotifications(userId?: string): Promise<Notification[]> {
        const { data: notifs, error: notifError } = await (supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10) as any);

        if (notifError) {
            console.error('Error fetching notifications:', notifError);
            return [];
        }

        if (!userId) return notifs as Notification[];

        const { data: readStatus, error: readError } = await (supabase
            .from('user_notifications')
            .select('notification_id')
            .eq('user_id', userId)
            .in('notification_id', notifs.map(n => n.id)) as any);

        if (readError) {
            console.error('Error fetching read status:', readError);
            return notifs as Notification[];
        }

        const readIds = new Set(readStatus.map((r: any) => r.notification_id));

        return notifs.map(n => ({
            ...n,
            is_read: readIds.has(n.id)
        })) as Notification[];
    },

    /**
     * Mark a single notification as read
     */
    async markAsRead(userId: string, notificationId: string): Promise<void> {
        const { error } = await (supabase
            .from('user_notifications')
            .upsert({ user_id: userId, notification_id: notificationId } as any) as any);

        if (error) {
            console.error('Error marking as read:', error);
            throw error;
        }
    },

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        const { data: notifs } = await (supabase
            .from('notifications')
            .select('id') as any);

        if (!notifs) return;

        const readStatus = notifs.map(n => ({
            user_id: userId,
            notification_id: n.id
        }));

        const { error } = await (supabase
            .from('user_notifications')
            .upsert(readStatus as any) as any);

        if (error) {
            console.error('Error marking all as read:', error);
            throw error;
        }
    },

    /**
     * Send a new broadcast (Super Admin only)
     */
    async createBroadcast(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<void> {
        const { error } = await (supabase
            .from('notifications')
            .insert([notification] as any) as any);

        if (error) {
            console.error('Error creating broadcast:', error);
            throw error;
        }
    }
};
