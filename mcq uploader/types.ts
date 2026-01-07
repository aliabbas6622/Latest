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