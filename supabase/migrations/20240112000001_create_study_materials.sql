-- Create Study Materials Table
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    university_id UUID NOT NULL,
    topic TEXT NOT NULL, -- Subject in App
    subtopic TEXT NOT NULL, -- Topic in App
    title TEXT NOT NULL,
    content TEXT, -- Markdown Content
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED'))
);

-- Indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_materials_univ_topic ON study_materials(university_id, topic, subtopic);
CREATE INDEX IF NOT EXISTS idx_materials_status ON study_materials(status);
