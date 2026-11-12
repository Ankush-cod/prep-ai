// src/types/prepai.ts

export type Branch = 'CSE' | 'ECE' | 'EE' | 'ME';

export interface StudentProfile {
  id: string;
  fullName: string;
  initials: string;
  rollNumber: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  institution: string;
  degree: string;
  branch: Branch;
  academicYear: number;
  semester: number;
  graduationYear: number;
  cgpa: number;
  mfaActive: boolean;
  streakDays: number;
  readinessIndex: number;
  targetRoles: string[];
  targetCompanies: string[];
  targetCompensation: string;
  skills: {
    languages: { name: string; level: 'Expert' | 'Advanced' | 'Proficient' | 'Working' }[];
    systems: string[];
    theory: string[];
  };
}

export interface InterviewSession {
  id: string;
  title: string;
  company: string;
  role: string;
  roundType: string;
  difficulty: 'Medium' | 'Hard' | 'Hard (L4+)' | 'Hard (L5 CORE)' | 'Staff (L6)';
  date: string;
  durationMinutes: number;
  overallScore: number;
  technicalScore: number;
  structureScore: number;
  completenessScore: number;
  clarityScore: number;
  status: 'Completed' | 'In Progress' | 'Evaluating';
  feedbackSummary: string;
  questions: {
    prompt: string;
    score: number;
    candidateAnswer: string;
    examinerNote: string;
  }[];
}

export interface BookmarkItem {
  id: string;
  title: string;
  category: 'Coding Practice' | 'Company Questions' | 'Preparation Resources';
  branch: Branch | 'Cross-Track';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  targetCompany?: string;
  savedDate: string;
  type: 'code' | 'doc' | 'video' | 'compendium';
}

export interface CompanyQuestion {
  id: string;
  company: string;
  role: string;
  title: string;
  difficulty: 'Medium' | 'Hard';
  category: string;
  tags: string[];
  frequency: 'Very High' | 'High' | 'Moderate';
  lastAsked: string;
  provenance: 'Verified Historical' | 'Candidate Reported' | 'AI Calibrated';
  solutionSummary: string;
  keyConcepts: string[];
  acceptanceRate: string;
  isBookmarked?: boolean;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: string;
  branch: Branch;
  semester: number;
  subject: string;
  format: 'PDF' | 'Compendium' | 'Cheatsheet' | 'Notes' | 'GATE PYQs';
  pages?: number;
  fileSize: string;
  author: string;
  upvotes: number;
  downloads: number;
  isVerified: boolean;
  description: string;
  isBookmarked?: boolean;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  track: "Striver's A2Z" | 'CP-31 Ladder';
  step?: string;
  category: string;
  tags: string[];
  acceptanceRate: string;
  solved: boolean;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    cpp: string;
    python: string;
    go: string;
    java: string;
  };
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
}

export interface InterviewSetupConfig {
  type: 'technical' | 'behavioral' | 'hr' | 'system_design';
  company: string;
  branch: Branch;
  difficulty: string;
  duration: number;
  questionCount: number;
  monacoEnabled: boolean;
  voiceSynthesis: boolean;
  resumeContext: boolean;
  strictRubric: boolean;
}
