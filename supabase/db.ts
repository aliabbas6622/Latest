// Supabase Database Service Layer
// Provides typed access to all Apply mode operations with solution gating

import { supabase, isSupabaseConfigured } from './client';
import type {
    Profile,
    Question,
    ApplySet,
    Assignment,
    Attempt,
    MistakeLogEntry,
    Institute,
    GatedQuestion,
    UserRole,
    ContentStatus,
    QuestionFormat,
    DifficultyLevel,
    MistakeType,
} from './database.types';

// Re-export types for convenience
export type {
    Profile,
    Question,
    ApplySet,
    Assignment,
    Attempt,
    MistakeLogEntry,
    Institute,
    GatedQuestion,
    UserRole,
    ContentStatus,
    QuestionFormat,
    DifficultyLevel,
    MistakeType,
};

// ===== AUTH FUNCTIONS =====

export async function signUp(email: string, password: string, fullName: string, role: string = 'STUDENT') {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role
            }
        }
    });

    if (error) throw error;
    return data;
}

export async function signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function signOut() {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getCurrentSession() {
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// ===== PROFILE FUNCTIONS =====

export async function getMyProfile(): Promise<Profile | null> {
    if (!supabase) return null;

    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) throw error;
    return data;
}

export async function updateMyProfile(updates: Partial<Pick<Profile, 'full_name'>>) {
    if (!supabase) throw new Error('Supabase not configured');

    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ===== INSTITUTE FUNCTIONS =====

export async function getInstitutes(): Promise<Institute[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .order('name');

    if (error) throw error;
    return data || [];
}

// ===== QUESTION FUNCTIONS =====

export async function getPublishedQuestions(filters?: {
    topic?: string;
    subtopic?: string;
    difficulty?: DifficultyLevel;
}): Promise<Question[]> {
    if (!supabase) return [];

    let query = supabase
        .from('questions')
        .select('*')
        .eq('status', 'PUBLISHED');

    if (filters?.topic) query = query.eq('topic', filters.topic);
    if (filters?.subtopic) query = query.eq('subtopic', filters.subtopic);
    if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

// GATED: Use this for student practice - hides solution until attempted
export async function getQuestionForStudent(questionId: string): Promise<GatedQuestion | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .rpc('get_question_for_student', { p_question_id: questionId });

    if (error) throw error;
    return data?.[0] || null;
}

// Super Admin only: Get all questions including drafts
export async function getAllQuestions(): Promise<Question[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

// Super Admin only: Create question
export async function createQuestion(question: Omit<Question, 'id' | 'created_at' | 'updated_at' | 'mode'>): Promise<Question> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('questions')
        .insert({ ...question, mode: 'APPLY' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Super Admin only: Update question
export async function updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Super Admin only: Delete question
export async function deleteQuestion(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ===== APPLY SET FUNCTIONS =====

export async function getPublishedSets(topic?: string): Promise<ApplySet[]> {
    if (!supabase) return [];

    let query = supabase
        .from('apply_sets')
        .select('*')
        .eq('status', 'PUBLISHED');

    if (topic) query = query.eq('topic', topic);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getSetBySlug(slug: string): Promise<ApplySet | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('apply_sets')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'PUBLISHED')
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
}

export async function getSetQuestions(setId: string): Promise<Question[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('set_questions')
        .select('question_id, order_index, questions(*)')
        .eq('set_id', setId)
        .order('order_index');

    if (error) throw error;

    return (data || [])
        .map(sq => sq.questions as unknown as Question)
        .filter(Boolean);
}

// Super Admin only: Create set
export async function createApplySet(set: Omit<ApplySet, 'id' | 'created_at' | 'updated_at'>): Promise<ApplySet> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('apply_sets')
        .insert(set)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Super Admin only: Add question to set
export async function addQuestionToSet(setId: string, questionId: string, orderIndex: number): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
        .from('set_questions')
        .insert({ set_id: setId, question_id: questionId, order_index: orderIndex });

    if (error) throw error;
}

// ===== ASSIGNMENT FUNCTIONS =====

export async function getMyAssignments(): Promise<(Assignment & { apply_sets: ApplySet })[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('assignments')
        .select('*, apply_sets(*)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as (Assignment & { apply_sets: ApplySet })[];
}

// Admin: Create assignment
export async function createAssignment(assignment: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('assignments')
        .insert(assignment)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ===== ATTEMPT FUNCTIONS =====

export async function submitAttempt(attempt: {
    questionId: string;
    setId?: string;
    userAnswer: string;
    isCorrect: boolean;
    timeTakenMs: number;
    hintsUsed: number;
}): Promise<Attempt> {
    if (!supabase) throw new Error('Supabase not configured');

    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('attempts')
        .insert({
            user_id: user.id,
            question_id: attempt.questionId,
            set_id: attempt.setId || null,
            user_answer: attempt.userAnswer,
            is_correct: attempt.isCorrect,
            time_taken_ms: attempt.timeTakenMs,
            hints_used: attempt.hintsUsed,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getMyAttempts(filters?: {
    questionId?: string;
    setId?: string;
}): Promise<Attempt[]> {
    if (!supabase) return [];

    const user = await getCurrentUser();
    if (!user) return [];

    let query = supabase
        .from('attempts')
        .select('*')
        .eq('user_id', user.id);

    if (filters?.questionId) query = query.eq('question_id', filters.questionId);
    if (filters?.setId) query = query.eq('set_id', filters.setId);

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function hasAttemptedQuestion(questionId: string): Promise<boolean> {
    if (!supabase) return false;

    const user = await getCurrentUser();
    if (!user) return false;

    const { count, error } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('question_id', questionId);

    if (error) throw error;
    return (count || 0) > 0;
}

// ===== MISTAKE LOG FUNCTIONS =====

export async function logMistake(entry: {
    attemptId: string;
    topic: string;
    subtopic: string;
    mistakeType: MistakeType;
    note?: string;
}): Promise<MistakeLogEntry> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('mistake_log')
        .insert({
            attempt_id: entry.attemptId,
            topic: entry.topic,
            subtopic: entry.subtopic,
            mistake_type: entry.mistakeType,
            note: entry.note || null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getMyMistakes(): Promise<(MistakeLogEntry & { attempts: Attempt })[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('mistake_log')
        .select('*, attempts(*)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as (MistakeLogEntry & { attempts: Attempt })[];
}

export async function updateMistakeNote(id: string, note: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
        .from('mistake_log')
        .update({ note })
        .eq('id', id);

    if (error) throw error;
}

// ===== STATISTICS FUNCTIONS =====

export async function getMyStats(): Promise<{
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
    totalMistakes: number;
    topicBreakdown: { topic: string; correct: number; total: number }[];
}> {
    if (!supabase) {
        return { totalAttempts: 0, correctAttempts: 0, accuracy: 0, totalMistakes: 0, topicBreakdown: [] };
    }

    const user = await getCurrentUser();
    if (!user) {
        return { totalAttempts: 0, correctAttempts: 0, accuracy: 0, totalMistakes: 0, topicBreakdown: [] };
    }

    const { data: attempts, error } = await supabase
        .from('attempts')
        .select('is_correct, questions(topic)')
        .eq('user_id', user.id);

    if (error) throw error;

    const total = attempts?.length || 0;
    const correct = attempts?.filter(a => a.is_correct).length || 0;

    // Group by topic
    const topicMap = new Map<string, { correct: number; total: number }>();
    attempts?.forEach(a => {
        const topic = (a.questions as any)?.topic || 'Unknown';
        const existing = topicMap.get(topic) || { correct: 0, total: 0 };
        existing.total++;
        if (a.is_correct) existing.correct++;
        topicMap.set(topic, existing);
    });

    return {
        totalAttempts: total,
        correctAttempts: correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        totalMistakes: total - correct,
        topicBreakdown: Array.from(topicMap.entries()).map(([topic, stats]) => ({
            topic,
            ...stats
        }))
    };
}

// Export utility
export { isSupabaseConfigured };
