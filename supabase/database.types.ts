// Generated types from Supabase schema
// These types match the database schema defined in schema.sql

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STUDENT';
export type ContentStatus = 'DRAFT' | 'PUBLISHED';
export type QuestionFormat = 'MCQ' | 'SHORT_ANSWER';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type MistakeType = 'CONCEPT' | 'CALCULATION' | 'SPEED';

export interface Database {
    public: {
        Tables: {
            institutes: {
                Row: {
                    id: string;
                    name: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    created_at?: string;
                };
            };
            profiles: {
                Row: {
                    id: string;
                    role: UserRole;
                    institute_id: string | null;
                    full_name: string;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    role?: UserRole;
                    institute_id?: string | null;
                    full_name: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    role?: UserRole;
                    institute_id?: string | null;
                    full_name?: string;
                    created_at?: string;
                };
            };
            questions: {
                Row: {
                    id: string;
                    mode: string;
                    topic: string;
                    subtopic: string;
                    format: QuestionFormat;
                    stem: string;
                    options: string[] | null;
                    correct_answer: string;
                    hint: string | null;
                    short_rationale: string | null;
                    full_solution: string | null;
                    difficulty: DifficultyLevel;
                    tags: string[];
                    status: ContentStatus;
                    created_by: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    mode?: string;
                    topic: string;
                    subtopic: string;
                    format: QuestionFormat;
                    stem: string;
                    options?: string[] | null;
                    correct_answer: string;
                    hint?: string | null;
                    short_rationale?: string | null;
                    full_solution?: string | null;
                    difficulty?: DifficultyLevel;
                    tags?: string[];
                    status?: ContentStatus;
                    created_by: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    mode?: string;
                    topic?: string;
                    subtopic?: string;
                    format?: QuestionFormat;
                    stem?: string;
                    options?: string[] | null;
                    correct_answer?: string;
                    hint?: string | null;
                    short_rationale?: string | null;
                    full_solution?: string | null;
                    difficulty?: DifficultyLevel;
                    tags?: string[];
                    status?: ContentStatus;
                    created_by?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            apply_sets: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    topic: string;
                    is_timed: boolean;
                    duration_minutes: number | null;
                    scoring_policy: { per_question: number; negative_marking: number };
                    hint_policy: { max_hints: number; kind: string };
                    status: ContentStatus;
                    created_by: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    topic: string;
                    is_timed?: boolean;
                    duration_minutes?: number | null;
                    scoring_policy?: { per_question: number; negative_marking: number };
                    hint_policy?: { max_hints: number; kind: string };
                    status?: ContentStatus;
                    created_by: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    topic?: string;
                    is_timed?: boolean;
                    duration_minutes?: number | null;
                    scoring_policy?: { per_question: number; negative_marking: number };
                    hint_policy?: { max_hints: number; kind: string };
                    status?: ContentStatus;
                    created_by?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            set_questions: {
                Row: {
                    id: string;
                    set_id: string;
                    question_id: string;
                    order_index: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    set_id: string;
                    question_id: string;
                    order_index?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    set_id?: string;
                    question_id?: string;
                    order_index?: number;
                    created_at?: string;
                };
            };
            assignments: {
                Row: {
                    id: string;
                    set_id: string;
                    assigned_by: string;
                    institute_id: string | null;
                    student_id: string | null;
                    due_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    set_id: string;
                    assigned_by: string;
                    institute_id?: string | null;
                    student_id?: string | null;
                    due_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    set_id?: string;
                    assigned_by?: string;
                    institute_id?: string | null;
                    student_id?: string | null;
                    due_at?: string | null;
                    created_at?: string;
                };
            };
            attempts: {
                Row: {
                    id: string;
                    user_id: string;
                    question_id: string;
                    set_id: string | null;
                    user_answer: string;
                    is_correct: boolean;
                    time_taken_ms: number;
                    hints_used: number;
                    submitted_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    question_id: string;
                    set_id?: string | null;
                    user_answer: string;
                    is_correct: boolean;
                    time_taken_ms?: number;
                    hints_used?: number;
                    submitted_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    question_id?: string;
                    set_id?: string | null;
                    user_answer?: string;
                    is_correct?: boolean;
                    time_taken_ms?: number;
                    hints_used?: number;
                    submitted_at?: string;
                };
            };
            mistake_log: {
                Row: {
                    id: string;
                    attempt_id: string;
                    topic: string;
                    subtopic: string;
                    mistake_type: MistakeType;
                    note: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    attempt_id: string;
                    topic: string;
                    subtopic: string;
                    mistake_type: MistakeType;
                    note?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    attempt_id?: string;
                    topic?: string;
                    subtopic?: string;
                    mistake_type?: MistakeType;
                    note?: string | null;
                    created_at?: string;
                };
            };
        };
        Functions: {
            get_my_role: {
                Args: Record<string, never>;
                Returns: UserRole;
            };
            get_my_institute: {
                Args: Record<string, never>;
                Returns: string | null;
            };
            is_super_admin: {
                Args: Record<string, never>;
                Returns: boolean;
            };
            get_question_for_student: {
                Args: { p_question_id: string };
                Returns: {
                    id: string;
                    topic: string;
                    subtopic: string;
                    format: QuestionFormat;
                    stem: string;
                    options: string[] | null;
                    hint: string | null;
                    difficulty: DifficultyLevel;
                    correct_answer: string | null;
                    short_rationale: string | null;
                    full_solution: string | null;
                    has_attempted: boolean;
                }[];
            };
        };
        Enums: {
            user_role: UserRole;
            content_status: ContentStatus;
            question_format: QuestionFormat;
            difficulty_level: DifficultyLevel;
            mistake_type: MistakeType;
        };
    };
}

// Convenience type exports
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type ApplySet = Database['public']['Tables']['apply_sets']['Row'];
export type Assignment = Database['public']['Tables']['assignments']['Row'];
export type Attempt = Database['public']['Tables']['attempts']['Row'];
export type MistakeLogEntry = Database['public']['Tables']['mistake_log']['Row'];
export type Institute = Database['public']['Tables']['institutes']['Row'];

// Gated question type (from get_question_for_student function)
export type GatedQuestion = Database['public']['Functions']['get_question_for_student']['Returns'][0];
