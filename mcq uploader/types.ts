export interface Option {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface MCQ {
  id: string;
  question: string;
  options: Option[];
  explanation: string;
  subject: string;
  topic: string;
  topicId: string; // Link to canonical topic
  image_url?: string;
  explanation_image_url?: string;
  created_at: string;
  university_id?: string;
}

export interface SubjectOption {
  value: string;
  label: string;
  topics: string[];
}

export interface Stats {
  total: number;
  bySubject: Record<string, number>;
}

export interface StudyMaterial {
  id: string;
  universityId: string;
  topicId: string; // Link to canonical topic
  subject: string;
  topic: string;
  title: string;
  content: string;
  summary: string;
  status?: string;
}