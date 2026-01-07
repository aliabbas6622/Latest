import { supabase } from '../supabase/client';
import { Question, StudentAttempt } from '../types';

export const studentService = {
    /**
     * Record a question attempt and log as mistake if incorrect
     */
    recordAttempt: async (
        userId: string,
        questionId: string,
        selectedOption: number,
        isCorrect: boolean,
        topic: string,
        subtopic: string
    ): Promise<void> => {
        // 1. Insert into attempts
        const { data: attempt, error: attemptError } = await (supabase
            .from('attempts')
            .insert({
                user_id: userId,
                question_id: questionId,
                user_answer: selectedOption.toString(),
                is_correct: isCorrect,
                time_taken_ms: 0, // Placeholder
                hints_used: 0
            } as any)
            .select('id')
            .single() as any);

        if (attemptError) {
            console.error('Error recording attempt:', attemptError);
            throw attemptError;
        }

        // 2. If incorrect, insert into mistake_log
        if (!isCorrect && attempt) {
            const { error: mistakeError } = await (supabase
                .from('mistake_log')
                .insert({
                    attempt_id: attempt.id,
                    topic: topic,
                    subtopic: subtopic,
                    mistake_type: 'CONCEPT' // Default type
                } as any) as any);

            if (mistakeError) {
                console.error('Error logging mistake:', mistakeError);
                // We don't throw here to avoid blocking the user flow if just the log fails
            }
        }
    },

    async getMistakes(userId: string): Promise<{ attempt: StudentAttempt; question: Question }[]> {
        // We fetch attempts that are NOT correct joined with questions
        const { data, error } = await (supabase
            .from('attempts')
            .select(`
                *,
                questions (*)
            `)
            .eq('user_id', userId)
            .eq('is_correct', false)
            .order('submitted_at', { ascending: false }) as any);

        if (error) {
            console.error('Error fetching mistakes:', error);
            throw error;
        }

        return (data || []).map((row: any) => ({
            attempt: {
                id: row.id,
                studentId: row.user_id,
                questionId: row.question_id,
                selectedOption: parseInt(row.user_answer),
                isCorrect: row.is_correct,
                topic: row.questions.topic,
                timestamp: row.submitted_at
            },
            question: {
                id: row.questions.id,
                universityId: row.questions.university_id,
                subject: row.questions.topic,
                topic: row.questions.subtopic,
                text: row.questions.stem,
                options: typeof row.questions.options === 'string' ? JSON.parse(row.questions.options) : row.questions.options,
                correctAnswer: parseInt(row.questions.correct_answer),
                explanation: row.questions.full_solution || row.questions.short_rationale || ''
            }
        }));
    },

    async getStudentAnalytics(userId: string) {
        const { data: attempts, error } = await (supabase
            .from('attempts')
            .select('is_correct, submitted_at, questions(topic)')
            .eq('user_id', userId) as any);

        if (error) throw error;

        const total = attempts.length;
        const correct = attempts.filter((a: any) => a.is_correct).length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        // Topic wise
        const topicStats: Record<string, { total: number; correct: number }> = {};
        attempts.forEach((a: any) => {
            const topic = a.questions?.topic || 'Unknown';
            if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
            topicStats[topic].total++;
            if (a.is_correct) topicStats[topic].correct++;
        });

        // 7-day Trend Data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                name: days[d.getDay()],
                dateStr: d.toISOString().split('T')[0],
                total: 0,
                correct: 0
            };
        });

        attempts.forEach((a: any) => {
            const attemptDate = new Date(a.submitted_at).toISOString().split('T')[0];
            const dayBucket = last7Days.find(d => d.dateStr === attemptDate);
            if (dayBucket) {
                dayBucket.total++;
                if (a.is_correct) dayBucket.correct++;
            }
        });

        const trendData = last7Days.map(d => ({
            name: d.name,
            accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
        }));

        return {
            totalAttempts: total,
            correctAttempts: correct,
            accuracy,
            trendData,
            topics: Object.entries(topicStats).map(([name, stats]) => ({
                name,
                accuracy: Math.round((stats.correct / stats.total) * 100),
                total: stats.total
            })),
            recentAttempts: [...attempts].reverse().slice(0, 10).map((a: any) => ({
                id: a.id,
                isCorrect: a.is_correct,
                topic: a.questions?.topic || 'Unknown',
                timestamp: a.submitted_at
            }))
        };
    },

    async getActiveNotifications(): Promise<any[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .or('target_role.eq.STUDENT,target_role.eq.ALL')
            .order('created_at', { ascending: false })
            .limit(5);
        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
        return data || [];
    },

    async getUniversityDetails(universityId: string): Promise<any> {
        const { data, error } = await supabase
            .from('institutes')
            .select('*')
            .eq('id', universityId)
            .single();
        if (error) {
            console.error('Error fetching university details:', error);
            return null;
        }
        return data;
    }
};
