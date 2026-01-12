-- =====================================================
-- MIGRATION: LEARNING STREAK SYSTEM
-- =====================================================

-- 1. EXTEND PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- 2. CREATE DAILY ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS daily_activity (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    is_streak_day BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, activity_date)
);

-- 3. CREATE USER STREAKS TABLE
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_streak_date DATE,
    grace_days INTEGER NOT NULL DEFAULT 0,
    total_streak_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ENABLE RLS
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
-- Students can only see their own streak data
CREATE POLICY "View own daily activity" ON daily_activity FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "View own streaks" ON user_streaks FOR SELECT USING (user_id = auth.uid());

-- 6. TRIGGER: UPDATE DAILY ACTIVITY on ATTEMPT
CREATE OR REPLACE FUNCTION fn_update_daily_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_timezone TEXT;
    v_local_date DATE;
    v_threshold INTEGER := 5; -- Set streak threshold to 5
BEGIN
    -- Get user timezone
    SELECT timezone INTO v_timezone FROM profiles WHERE id = NEW.user_id;
    IF v_timezone IS NULL THEN v_timezone := 'UTC'; END IF;

    -- Calculate local date based on timezone
    v_local_date := (NEW.submitted_at AT TIME ZONE v_timezone)::DATE;

    -- Upsert daily_activity
    INSERT INTO daily_activity (user_id, activity_date, attempt_count, is_streak_day)
    VALUES (NEW.user_id, v_local_date, 1, FALSE)
    ON CONFLICT (user_id, activity_date) DO UPDATE
    SET attempt_count = daily_activity.attempt_count + 1,
        is_streak_day = (daily_activity.attempt_count + 1 >= v_threshold);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_update_daily_activity
AFTER INSERT ON attempts
FOR EACH ROW EXECUTE FUNCTION fn_update_daily_activity();

-- 7. TRIGGER: UPDATE STREAK on STREAK DAY MET
CREATE OR REPLACE FUNCTION fn_update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    v_streak_record RECORD;
    v_prev_date DATE;
BEGIN
    -- Only proceed if it just became a streak day
    IF NEW.is_streak_day = TRUE AND (OLD.is_streak_day = FALSE OR OLD.is_streak_day IS NULL) THEN
        
        -- Get or create streak record
        SELECT * INTO v_streak_record FROM user_streaks WHERE user_id = NEW.user_id;
        
        IF NOT FOUND THEN
            INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_streak_date, total_streak_days)
            VALUES (NEW.user_id, 1, 1, NEW.activity_date, 1);
        ELSE
            -- Check if it's a continuation, a skip, or already handled
            -- Continuation: last_streak_date = yesterday
            -- Skip: last_streak_date < yesterday (reset or use grace day)
            v_prev_date := NEW.activity_date - INTERVAL '1 day';
            
            IF v_streak_record.last_streak_date = NEW.activity_date THEN
                -- Already updated for today, do nothing
                RETURN NEW;
            ELSIF v_streak_record.last_streak_date = v_prev_date THEN
                -- Continuation
                UPDATE user_streaks
                SET current_streak = current_streak + 1,
                    longest_streak = GREATEST(longest_streak, current_streak + 1),
                    last_streak_date = NEW.activity_date,
                    total_streak_days = total_streak_days + 1,
                    grace_days = grace_days + (CASE WHEN (total_streak_days + 1) % 7 = 0 THEN 1 ELSE 0 END),
                    updated_at = NOW()
                WHERE user_id = NEW.user_id;
            ELSE
                -- Missed a day or more
                IF v_streak_record.grace_days > 0 AND v_streak_record.last_streak_date = (v_prev_date - INTERVAL '1 day') THEN
                    -- Use grace day for exactly 1 missed day
                    UPDATE user_streaks
                    SET current_streak = current_streak + 1, -- The missed day is "graced", and today is +1
                        longest_streak = GREATEST(longest_streak, current_streak + 1),
                        last_streak_date = NEW.activity_date,
                        total_streak_days = total_streak_days + 1,
                        grace_days = grace_days - 1, -- Consume grace day
                        updated_at = NOW()
                    WHERE user_id = NEW.user_id;
                ELSE
                    -- Reset streak
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_update_user_streak
AFTER UPDATE ON daily_activity
FOR EACH ROW EXECUTE FUNCTION fn_update_user_streak();
