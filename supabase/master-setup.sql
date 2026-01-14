-- =====================================================
-- MASTER SETUP SCRIPT FOR APTIVO
-- Run this entire script in your new Supabase Project's SQL Editor.
-- This handles everything: Tables, Security, and Super Admin Setup.
-- =====================================================

-- 1. CLEANUP (For fresh starts)
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP TABLE IF EXISTS mistake_log CASCADE;
DROP TABLE IF EXISTS attempts CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS set_questions CASCADE;
DROP TABLE IF EXISTS apply_sets CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS mcqs CASCADE; -- Cleanup legacy table
DROP TABLE IF EXISTS study_materials CASCADE;
DROP TABLE IF EXISTS daily_activity CASCADE;
DROP TABLE IF EXISTS user_streaks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS institutes CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS content_status CASCADE;
DROP TYPE IF EXISTS question_format CASCADE;
DROP TYPE IF EXISTS difficulty_level CASCADE;
DROP TYPE IF EXISTS mistake_type CASCADE;

-- 2. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. CREATE ENUMS
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STUDENT');
CREATE TYPE content_status AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE question_format AS ENUM ('MCQ', 'SHORT_ANSWER');
CREATE TYPE difficulty_level AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE mistake_type AS ENUM ('CONCEPT', 'CALCULATION', 'SPEED');

-- 4. CREATE TABLES

-- 4.1 INSTITUTES
CREATE TABLE institutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    domain TEXT UNIQUE,           -- For email matching (e.g. 'harvard.edu')
    official_email TEXT,          -- Contact email
    status TEXT DEFAULT 'PENDING',-- PENDING, APPROVED, REJECTED
    admin_id UUID,               -- Link to the ADMIN user
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'STUDENT',
    institute_id UUID REFERENCES institutes(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Constraint: Students don't need an institute immediately, but Admins do.
    CONSTRAINT valid_relations CHECK (
        (role = 'SUPER_ADMIN' AND institute_id IS NULL) OR
        (role = 'ADMIN' AND institute_id IS NOT NULL) OR
        (role = 'STUDENT') -- Flexible for students
    )
);

-- 4.3 QUESTIONS
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mode TEXT NOT NULL DEFAULT 'APPLY' CHECK (mode = 'APPLY'),
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    format question_format NOT NULL,
    stem TEXT NOT NULL,
    options JSONB, -- Array of strings for MCQ
    correct_answer TEXT NOT NULL, -- Index for MCQ or text for Short Answer
    hint TEXT CHECK (hint IS NULL OR char_length(hint) <= 150),
    short_rationale TEXT,
    full_solution TEXT,
    difficulty difficulty_level NOT NULL DEFAULT 'MEDIUM',
    tags TEXT[] DEFAULT '{}',
    status content_status NOT NULL DEFAULT 'DRAFT',
    created_by UUID NOT NULL REFERENCES profiles(id),
    university_id UUID REFERENCES institutes(id) ON DELETE SET NULL, -- Aligned with institutes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 STUDY MATERIALS (Understand Mode)
CREATE TABLE study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    topic TEXT NOT NULL, -- Subject in App
    subtopic TEXT NOT NULL, -- Topic in App
    title TEXT NOT NULL,
    content TEXT, -- HTML/Markdown content
    summary TEXT,
    status content_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 APPLY SETS (Quizzes/Tests)
CREATE TABLE apply_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    topic TEXT NOT NULL,
    is_timed BOOLEAN NOT NULL DEFAULT FALSE,
    duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    scoring_policy JSONB NOT NULL DEFAULT '{"per_question": 1, "negative_marking": 0}',
    hint_policy JSONB NOT NULL DEFAULT '{"max_hints": 1, "kind": "step_unblock"}',
    status content_status NOT NULL DEFAULT 'DRAFT',
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.5 SET_QUESTIONS (Join Table)
CREATE TABLE set_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    set_id UUID NOT NULL REFERENCES apply_sets(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(set_id, question_id)
);

-- 4.6 ASSIGNMENTS
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    set_id UUID NOT NULL REFERENCES apply_sets(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES profiles(id),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.7 ATTEMPTS
CREATE TABLE attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    set_id UUID REFERENCES apply_sets(id) ON DELETE SET NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_ms INTEGER NOT NULL DEFAULT 0,
    hints_used INTEGER NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.8 MISTAKE LOG
CREATE TABLE mistake_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    mistake_type mistake_type NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.9 STREAK SYSTEM
CREATE TABLE daily_activity (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    is_streak_day BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, activity_date)
);

CREATE TABLE user_streaks (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_streak_date DATE,
    grace_days INTEGER NOT NULL DEFAULT 0,
    total_streak_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FUNCTION: SOLUTION GATING
-- This prevents students from seeing answers by querying the table directly.
CREATE OR REPLACE FUNCTION get_question_for_student(p_question_id UUID)
RETURNS TABLE (
    id UUID,
    topic TEXT,
    subtopic TEXT,
    format question_format,
    stem TEXT,
    options JSONB,
    hint TEXT,
    difficulty difficulty_level,
    correct_answer TEXT,
    short_rationale TEXT,
    full_solution TEXT,
    has_attempted BOOLEAN
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_has_attempt BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM attempts 
        WHERE attempts.user_id = auth.uid() 
        AND attempts.question_id = p_question_id
    ) INTO v_has_attempt;
    
    RETURN QUERY
    SELECT 
        q.id,
        q.topic,
        q.subtopic,
        q.format,
        q.stem,
        q.options,
        q.hint,
        q.difficulty,
        CASE WHEN v_has_attempt THEN q.correct_answer ELSE NULL END,
        CASE WHEN v_has_attempt THEN q.short_rationale ELSE NULL END,
        CASE WHEN v_has_attempt THEN q.full_solution ELSE NULL END,
        v_has_attempt
    FROM questions q
    WHERE q.id = p_question_id
    AND q.status = 'PUBLISHED';
END;
$$;

-- 6. ENABLE RLS
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE apply_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistake_log ENABLE ROW LEVEL SECURITY;

-- 7. RECURSION-FREE RLS POLICIES
-- We use auth.jwt() -> 'user_metadata' to check roles, avoiding table lookups.

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Institutes
CREATE POLICY "Institutes viewable by everyone" ON institutes FOR SELECT USING (true);
CREATE POLICY "Super Admins manage institutes" ON institutes FOR ALL 
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'SUPER_ADMIN');

-- Questions
CREATE POLICY "Questions viewable if published" ON questions FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Super Admins manage questions" ON questions FOR ALL 
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'SUPER_ADMIN');

-- Study Materials
CREATE POLICY "Public materials viewable if published" ON study_materials FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Super Admins manage study_materials" ON study_materials FOR ALL 
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'SUPER_ADMIN');

-- Apply Sets
CREATE POLICY "Sets viewable if published" ON apply_sets FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Super Admins manage sets" ON apply_sets FOR ALL 
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'SUPER_ADMIN');

-- Set Questions
CREATE POLICY "Set contents viewable by everyone" ON set_questions FOR SELECT USING (true);
CREATE POLICY "Super Admins manage set contents" ON set_questions FOR ALL 
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'SUPER_ADMIN');

-- Assignments
CREATE POLICY "View own assignments" ON assignments FOR SELECT 
    USING (student_id = auth.uid() OR institute_id = (auth.jwt() -> 'app_metadata' ->> 'institute_id')::UUID);
CREATE POLICY "Admins manage assignments" ON assignments FOR ALL 
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

-- Attempts
CREATE POLICY "View own attempts" ON attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Create own attempts" ON attempts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins view institute attempts" ON attempts FOR SELECT 
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN');

-- Mistake Log
CREATE POLICY "Manage own mistakes" ON mistake_log FOR ALL 
    USING (EXISTS (SELECT 1 FROM attempts WHERE attempts.id = mistake_log.attempt_id AND attempts.user_id = auth.uid()));

-- Streak System
CREATE POLICY "View own daily activity" ON daily_activity FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "View own streaks" ON user_streaks FOR SELECT USING (user_id = auth.uid());

-- 8. AUTOMATION TRIGGERS

-- 8.1 Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER study_materials_updated_at BEFORE UPDATE ON study_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER apply_sets_updated_at BEFORE UPDATE ON apply_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_streaks_updated_at BEFORE UPDATE ON user_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8.2 HANDLE NEW USERS & SYNC METADATA
-- This function does two things:
-- 1. Creates the profile entry.
-- 2. Updates the Auth Metadata so RLS can read it instantly without querying the table.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_role user_role;
    v_institute_id UUID;
BEGIN
    -- Determine role based on email (Hardcoded Super Admin)
    IF NEW.email = 'super@aptivo.com' THEN
        v_role := 'SUPER_ADMIN';
    ELSE
        v_role := 'STUDENT';
    END IF;

    -- Create Profile
    INSERT INTO public.profiles (id, full_name, role, institute_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        v_role,
        NULL
    );

    -- Sync Metadata back to Auth (Using raw_app_meta_data for security)
    UPDATE auth.users 
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', v_role, 'institute_id', NULL),
    raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', v_role, 'institute_id', NULL)
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created 
    AFTER INSERT ON auth.users 
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8.3 STREAK SYSTEM AUTOMATION
CREATE OR REPLACE FUNCTION fn_update_daily_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_timezone TEXT;
    v_local_date DATE;
    v_threshold INTEGER := 5; -- Set streak threshold
BEGIN
    SELECT timezone INTO v_timezone FROM profiles WHERE id = NEW.user_id;
    IF v_timezone IS NULL THEN v_timezone := 'UTC'; END IF;
    v_local_date := (NEW.submitted_at AT TIME ZONE v_timezone)::DATE;

    INSERT INTO daily_activity (user_id, activity_date, attempt_count, is_streak_day)
    VALUES (NEW.user_id, v_local_date, 1, FALSE)
    ON CONFLICT (user_id, activity_date) DO UPDATE
    SET attempt_count = daily_activity.attempt_count + 1,
        is_streak_day = (daily_activity.attempt_count + 1 >= v_threshold);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER tr_update_daily_activity
AFTER INSERT ON attempts
FOR EACH ROW EXECUTE FUNCTION fn_update_daily_activity();

CREATE OR REPLACE FUNCTION fn_update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    v_streak_record RECORD;
    v_prev_date DATE;
BEGIN
    IF NEW.is_streak_day = TRUE AND (OLD.is_streak_day = FALSE OR OLD.is_streak_day IS NULL) THEN
        SELECT * INTO v_streak_record FROM user_streaks WHERE user_id = NEW.user_id;
        IF NOT FOUND THEN
            INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_streak_date, total_streak_days)
            VALUES (NEW.user_id, 1, 1, NEW.activity_date, 1);
        ELSE
            v_prev_date := NEW.activity_date - INTERVAL '1 day';
            IF v_streak_record.last_streak_date = NEW.activity_date THEN
                RETURN NEW;
            ELSIF v_streak_record.last_streak_date = v_prev_date THEN
                UPDATE user_streaks
                SET current_streak = current_streak + 1,
                    longest_streak = GREATEST(longest_streak, current_streak + 1),
                    last_streak_date = NEW.activity_date,
                    total_streak_days = total_streak_days + 1,
                    grace_days = grace_days + (CASE WHEN (total_streak_days + 1) % 7 = 0 THEN 1 ELSE 0 END),
                    updated_at = NOW()
                WHERE user_id = NEW.user_id;
            ELSE
                IF v_streak_record.grace_days > 0 AND v_streak_record.last_streak_date = (v_prev_date - INTERVAL '1 day') THEN
                    UPDATE user_streaks
                    SET current_streak = current_streak + 1,
                        longest_streak = GREATEST(longest_streak, current_streak + 1),
                        last_streak_date = NEW.activity_date,
                        total_streak_days = total_streak_days + 1,
                        grace_days = grace_days - 1,
                        updated_at = NOW()
                    WHERE user_id = NEW.user_id;
                ELSE
                    UPDATE user_streaks
                    SET current_streak = 1,
                        last_streak_date = NEW.activity_date,
                        total_streak_days = total_streak_days + 1,
                        updated_at = NOW()
                    WHERE user_id = NEW.user_id;
                END IF;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER tr_update_user_streak
AFTER UPDATE ON daily_activity
FOR EACH ROW EXECUTE FUNCTION fn_update_user_streak();

-- 9. (Optional) SEED DATA
INSERT INTO institutes (name, domain, status) VALUES 
('Demo University', 'demo.edu', 'APPROVED');
