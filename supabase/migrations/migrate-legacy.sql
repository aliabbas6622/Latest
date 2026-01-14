-- Legacy Migration Script: Associating questions and study materials with canonical topic IDs

-- 1. Migrate Questions
-- First, normalize capitalization to increase match success
UPDATE questions
SET topic_id = t.id
FROM topics t
JOIN subjects s ON t.subject_id = s.id
WHERE 
    LOWER(questions.subject) = LOWER(s.name) AND 
    LOWER(questions.topic) = LOWER(t.name) AND
    questions.topic_id IS NULL;

-- 2. Migrate Study Materials
UPDATE study_materials
SET topic_id = t.id
FROM topics t
JOIN subjects s ON t.subject_id = s.id
WHERE 
    LOWER(study_materials.subject) = LOWER(s.name) AND 
    LOWER(study_materials.topic) = LOWER(t.name) AND
    study_materials.topic_id IS NULL;

-- 3. Reporting (Optional check for unmapped content)
/*
SELECT subject, topic, COUNT(*) 
FROM questions 
WHERE topic_id IS NULL 
GROUP BY subject, topic;

SELECT subject, topic, COUNT(*) 
FROM study_materials 
WHERE topic_id IS NULL 
GROUP BY subject, topic;
*/
