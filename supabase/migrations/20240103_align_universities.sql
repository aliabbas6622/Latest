-- Migration: Align questions.university_id with institutes table
-- This replaces hardcoded strings like 'univ-1' with real UUIDs and enforces data integrity.

-- Step 1: Ensure initial universities exist in the institutes table
INSERT INTO public.institutes (id, name, domain, status)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Harvard University', 'harvard.edu', 'APPROVED'),
    ('00000000-0000-0000-0000-000000000002', 'Stanford University', 'stanford.edu', 'APPROVED'),
    ('00000000-0000-0000-0000-000000000003', 'MIT', 'mit.edu', 'APPROVED'),
    ('00000000-0000-0000-0000-000000000004', 'Caltech', 'caltech.edu', 'APPROVED'),
    ('00000000-0000-0000-0000-000000000005', 'Oxford University', 'ox.ac.uk', 'APPROVED'),
    ('00000000-0000-0000-0000-000000000006', 'Cambridge University', 'cam.ac.uk', 'APPROVED')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Map old hardcoded IDs to new UUIDs in questions table
UPDATE public.questions SET university_id = '00000000-0000-0000-0000-000000000001' WHERE university_id = 'univ-1';
UPDATE public.questions SET university_id = '00000000-0000-0000-0000-000000000002' WHERE university_id = 'univ-2';
UPDATE public.questions SET university_id = '00000000-0000-0000-0000-000000000003' WHERE university_id = 'univ-3';
UPDATE public.questions SET university_id = '00000000-0000-0000-0000-000000000004' WHERE university_id = 'univ-4';
UPDATE public.questions SET university_id = '00000000-0000-0000-0000-000000000005' WHERE university_id = 'univ-5';
UPDATE public.questions SET university_id = '00000000-0000-0000-0000-000000000006' WHERE university_id = 'univ-6';

-- Step 3: Handle any remaining non-UUID values (set to a default or null)
UPDATE public.questions 
SET university_id = '00000000-0000-0000-0000-000000000001' 
WHERE university_id IS NOT NULL AND university_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

-- Step 4: Convert column to UUID and add Foreign Key constraint
ALTER TABLE public.questions 
ALTER COLUMN university_id TYPE UUID USING university_id::UUID;

ALTER TABLE public.questions
ADD CONSTRAINT fk_university
FOREIGN KEY (university_id) REFERENCES public.institutes(id);

-- Step 5: Update RLS to allow reading institutes
CREATE POLICY "Enable read access for all users" ON public.institutes FOR SELECT USING (true);
