import { supabase } from '../supabase/client';

export const analysisService = {
    /**
     * Get analytics for a specific institution
     */
    async getInstitutionAnalytics(instituteId: string) {
        // 1. Get all students linked to this institute
        const { data: profiles, error: profileError } = await (supabase
            .from('profiles')
            .select('id, full_name')
            .eq('institute_id', instituteId) as any);

        if (profileError) throw profileError;

        const studentIds = (profiles || []).map(p => p.id);
        if (studentIds.length === 0) {
            return {
                totalStudents: 0,
                averageAccuracy: 0,
                totalAttempts: 0,
                strugglingTopics: [],
                engagementTrend: []
            };
        }

        // 2. Get all attempts for these students
        const { data: attempts, error: attemptError } = await (supabase
            .from('attempts')
            .select('is_correct, question_id, user_id, submitted_at, questions(topic)')
            .in('user_id', studentIds) as any);

        if (attemptError) throw attemptError;

        const totalAttempts = attempts.length;
        const correctOnes = attempts.filter((a: any) => a.is_correct).length;
        const accuracy = totalAttempts > 0 ? Math.round((correctOnes / totalAttempts) * 100) : 0;

        // 3. Group by topic to find struggles
        const topicStats: Record<string, { total: number; correct: number }> = {};
        attempts.forEach((a: any) => {
            const topic = a.questions?.topic || 'General';
            if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
            topicStats[topic].total++;
            if (a.is_correct) topicStats[topic].correct++;
        });

        const strugglingTopics = Object.entries(topicStats)
            .map(([name, stats]) => ({
                name,
                accuracy: Math.round((stats.correct / stats.total) * 100),
                count: stats.total
            }))
            .filter(t => t.accuracy < 60)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5);

        // 7-day Engagement Trend
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                name: days[d.getDay()],
                dateStr: d.toISOString().split('T')[0],
                attempts: 0
            };
        });

        attempts.forEach((a: any) => {
            const date = new Date(a.submitted_at).toISOString().split('T')[0];
            const bucket = last7Days.find(d => d.dateStr === date);
            if (bucket) bucket.attempts++;
        });

        return {
            totalStudents: studentIds.length,
            averageAccuracy: accuracy,
            totalAttempts,
            strugglingTopics,
            engagementTrend: last7Days.map(d => ({ name: d.name, attempts: d.attempts })),
            recentAttempts: [...attempts].reverse().slice(0, 10)
        };
    },

    /**
     * Get global analytics for Super Admin
     */
    async getGlobalAnalytics() {
        const { count: instituteCount } = await (supabase.from('institutes').select('*', { count: 'exact', head: true }) as any);
        const { count: questionCount } = await (supabase.from('questions').select('*', { count: 'exact', head: true }) as any);
        const { count: studentCount } = await (supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT') as any);

        const { data: attempts, error: aError } = await (supabase
            .from('attempts')
            .select('is_correct, submitted_at') as any);

        const totalAttempts = attempts?.length || 0;
        const correct = attempts?.filter((a: any) => a.is_correct).length || 0;
        const globalAccuracy = totalAttempts > 0 ? Math.round((correct / totalAttempts) * 100) : 0;

        // System Traffic (Last 24 Hours)
        const hourlyTraffic = Array.from({ length: 24 }, (_, i) => {
            return { name: `${i}:00`, hits: 0, hour: i };
        });

        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        attempts?.forEach((a: any) => {
            const date = new Date(a.submitted_at);
            if (date > yesterday) {
                const hour = date.getHours();
                const bucket = hourlyTraffic.find(h => h.hour === hour);
                if (bucket) bucket.hits++;
            }
        });

        return {
            instituteCount: instituteCount || 0,
            questionCount: questionCount || 0,
            studentCount: studentCount || 0,
            totalAttempts,
            globalAccuracy,
            hitData: hourlyTraffic.map(({ name, hits }) => ({ name, hits }))
        };
    }
};
