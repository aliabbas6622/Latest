export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
}

export enum InstitutionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId?: string; // For Inst Admin and Student
  password?: string;
  canUpload?: boolean; // New: Permission for Admins
}

export interface Institution {
  id: string;
  name: string;
  officialEmail: string;
  domain: string; // e.g., @stanford.edu
  contactPerson: string;
  phone: string;
  status: InstitutionStatus;
  adminId?: string;
}

export interface University {
  id: string;
  name: string;
  location: string;
  unlockedForIds: string[];
}

export interface StudyMaterial {
  id: string;
  topicId: string; // Link to the canonical Topic
  universityId: string;
  subject: string;
  topic: string;
  title: string;
  content: string; // HTML for the concept explanation
  summary?: string; // Quick review points
}

export interface Question {
  id: string;
  topicId: string; // Link to the canonical Topic
  universityId: string;
  subject: string;
  topic: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string; // Short explanation for Apply mode feedback
}

export interface StudentAttempt {
  id: string;
  studentId: string;
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timestamp: number;
  topic: string;
}