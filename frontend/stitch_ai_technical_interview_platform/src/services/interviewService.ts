// src/services/interviewService.ts
import { apiDownloadBlob, apiRequest } from './api';

export interface BackendInterviewAnswer {
  id: string;
  questionId: string;
  answerText: string;
  technicalScore: number;
  conceptualScore: number;
  clarityScore: number;
  communicationScore: number;
  completenessScore: number;
  problemSolvingScore: number;
  overallQuestionScore: number;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  examinerFeedback: string;
  createdAt: string;
}

export interface BackendInterviewQuestion {
  id: string;
  sessionId: string;
  orderIndex: number;
  prompt: string;
  topic?: string | null;
  expectedConcepts: string[];
  hint?: string | null;
  isFollowUp: boolean;
  answer?: BackendInterviewAnswer | null;
}

export interface BackendInterviewFeedback {
  id: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  suggestedTopics: string[];
  preparationRoadmap: {
    phase: string;
    focusTopic: string;
    actionItems: string[];
    estimatedHours?: number;
  }[];
  polishedReport?: string | null;
  reportProvider: string;
  categoryScores?: Record<string, number> | null;
  studyNotes?: StudyNotesData | null;
}

export interface PersonalizedRecommendation {
  id: string;
  topic: string;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedHours: number;
  resources: {
    id: string;
    title: string;
    subject: string;
    format: string;
    difficulty: string;
    isGatePyq: boolean;
    contentUrl: string | null;
  }[];
  practiceProblems: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    topic: string;
    collection: string;
    rating: number | null;
  }[];
  companyQuestions: {
    id: string;
    title: string;
    companyName: string;
    difficulty: string;
    topic: string;
  }[];
}

export interface StudyNotesData {
  title: string;
  generatedAt: string;
  executiveSummary: string;
  keyDefinitions: { term: string; definition: string; keyTakeaway: string }[];
  coreConcepts: {
    concept: string;
    detailedExplanation: string;
    practicalExample: string;
    edgeCases?: string;
  }[];
  algorithmsAndPatterns: {
    name: string;
    description: string;
    complexity: string;
    codeSnippet: string;
    language: string;
  }[];
  criticalInterviewQuestions: {
    question: string;
    idealAnswer: string;
    commonPitfalls: string;
  }[];
  practiceProblems: { problemName: string; difficulty: string; pattern: string; hint: string }[];
  revisionChecklist: string[];
}

export interface BackendInterviewSession {
  id: string;
  title: string;
  companyName?: string | null;
  interviewType: 'TECHNICAL' | 'BEHAVIORAL' | 'HR' | 'SYSTEM_DESIGN';
  difficulty: string;
  topic: string;
  questionCount: number;
  durationMinutes: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  overallScore?: number | null;
  technicalScore?: number | null;
  conceptualScore?: number | null;
  clarityScore?: number | null;
  communicationScore?: number | null;
  completenessScore?: number | null;
  problemSolvingScore?: number | null;
  startedAt: string;
  completedAt?: string | null;
  createdAt: string;
  mode?: string | null;
  branch?: { code: 'CSE' | 'ECE' | 'EE' | 'ME'; name: string } | null;
  semester?: { number: number; label: string } | null;
  questions: BackendInterviewQuestion[];
  feedback?: BackendInterviewFeedback | null;
}

export interface CreateInterviewSessionInput {
  branch: 'CSE' | 'ECE' | 'EE' | 'ME';
  semester: number;
  interviewType: 'TECHNICAL' | 'BEHAVIORAL' | 'HR' | 'SYSTEM_DESIGN';
  difficulty: string;
  topic: string;
  companyName?: string | null;
  questionCount: number;
  durationMinutes: number;
  resumeId?: string | null;
  interviewMode?: string | null;
  mode?: 'RESUME_BASED' | 'TOPIC_BASED' | 'COMPREHENSIVE' | string;
  categoryDistribution?: {
    dsa?: number;
    projects?: number;
    coreCs?: number;
    programming?: number;
    technologies?: number;
  };
  subjects?: string[];
  topics?: string[];
}

export const interviewService = {
  listSessions: async (): Promise<BackendInterviewSession[]> => {
    const res = await apiRequest<{ sessions: BackendInterviewSession[] }>(
      '/interviews/sessions'
    );
    return res.sessions;
  },

  getSessionById: async (id: string): Promise<BackendInterviewSession> => {
    const res = await apiRequest<{ session: BackendInterviewSession }>(
      `/interviews/sessions/${id}`
    );
    return res.session;
  },

  createSession: async (
    payload: CreateInterviewSessionInput
  ): Promise<BackendInterviewSession> => {
    const res = await apiRequest<{ session: BackendInterviewSession }>(
      '/interviews/sessions',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.session;
  },

  submitAnswer: async (
    sessionId: string,
    questionId: string,
    answerText: string
  ): Promise<{
    evaluation: BackendInterviewAnswer;
    followUpQuestion: BackendInterviewQuestion | null;
    session: BackendInterviewSession;
  }> => {
    return apiRequest(`/interviews/sessions/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answerText }),
    });
  },

  completeSession: async (sessionId: string): Promise<BackendInterviewSession> => {
    const res = await apiRequest<{ session: BackendInterviewSession }>(
      `/interviews/sessions/${sessionId}/complete`,
      { method: 'POST' }
    );
    return res.session;
  },

  // Alias for backward compatibility with components calling completeInterview
  completeInterview: async (sessionId: string): Promise<BackendInterviewSession> => {
    const res = await apiRequest<{ session: BackendInterviewSession }>(
      `/interviews/sessions/${sessionId}/complete`,
      { method: 'POST' }
    );
    return res.session;
  },

  getRecommendations: async (sessionId: string): Promise<PersonalizedRecommendation[]> => {
    const res = await apiRequest<{ recommendations: PersonalizedRecommendation[] }>(
      `/interviews/sessions/${sessionId}/recommendations`
    );
    return res.recommendations;
  },

  generateStudyNotes: async (
    sessionId: string,
    regenerate = false
  ): Promise<StudyNotesData> => {
    const res = await apiRequest<{ notes: StudyNotesData }>(
      `/interviews/sessions/${sessionId}/study-notes`,
      {
        method: 'POST',
        body: JSON.stringify({ regenerate }),
      }
    );
    return res.notes;
  },

  getStudyNotes: async (sessionId: string): Promise<StudyNotesData | null> => {
    const res = await apiRequest<{ notes: StudyNotesData | null }>(
      `/interviews/sessions/${sessionId}/study-notes`
    );
    return res.notes;
  },

  downloadStudyNotesPdf: async (sessionId: string): Promise<void> => {
    const blob = await apiDownloadBlob(`/interviews/sessions/${sessionId}/study-notes/pdf`);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prepai-study-notes-${sessionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  downloadPdfReport: async (sessionId: string): Promise<void> => {
    const blob = await apiDownloadBlob(`/interviews/sessions/${sessionId}/report/pdf`);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prepai-interview-report-${sessionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  flagSession: async (sessionId: string, reason: string, details?: string) => {
    return apiRequest(`/interviews/sessions/${sessionId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason, details }),
    });
  },
};
