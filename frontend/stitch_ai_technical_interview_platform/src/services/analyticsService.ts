// src/services/analyticsService.ts
import { apiRequest } from './api';
import { Branch } from '../types/prepai';
import { BackendInterviewSession } from './interviewService';

export interface DashboardPayload {
  academicInfo: {
    fullName: string;
    email: string;
    institution: string | null;
    degree: string;
    branch: Branch | null;
    branchName: string | null;
    academicYear: number | null;
    semester: number | null;
    cgpa: number | null;
  };
  summaryMetrics: {
    totalInterviews: number;
    completedInterviews: number;
    averageInterviewScore: number;
    solvedProblemsCount: number;
    totalProblemsCount: number;
    totalSubmissions: number;
    bookmarkCount: number;
    streakDays: number;
  };
  recentInterviews: BackendInterviewSession[];
  recentActivity: {
    id: string;
    type: 'INTERVIEW' | 'CODING';
    title: string;
    status: string;
    score: number | null;
    timestamp: string;
  }[];
  recommendedTopics: string[];
}

export interface AnalyticsPayload {
  completedInterviewsCount: number;
  evaluatedAnswersCount: number;
  scoreTrend: {
    sessionId: string;
    title: string;
    date: string;
    overallScore: number;
    interviewType: string;
  }[];
  dimensionAverages: {
    technical: number;
    conceptual: number;
    clarity: number;
    communication: number;
    completeness: number;
    problemSolving: number;
  } | null;
  topicBreakdown: {
    topic: string;
    averageScore: number;
    attempts: number;
  }[];
  strengths: { topic: string; averageScore: number; attempts: number }[];
  weaknesses: { topic: string; averageScore: number; attempts: number }[];
  codingStats: {
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
    uniqueSolvedCount: number;
    totalProblems: number;
    completionRate: number;
    solvedByDifficulty: { EASY: number; MEDIUM: number; HARD: number };
  };
}

export interface BackendProfileResponse {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  profile: {
    fullName: string;
    phone?: string | null;
    bio?: string | null;
    targetRoles: string[];
    targetCompanies: string[];
    targetCompensation?: string | null;
    skillsLanguages?: { name: string; level: string }[] | null;
    skillsSystems: string[];
    skillsTheory: string[];
  } | null;
  academicDetails: {
    institution: string;
    degree: string;
    rollNumber?: string | null;
    academicYear: number;
    graduationYear?: number | null;
    cgpa?: number | null;
    branch: { code: Branch; name: string };
    semester: { number: number; label: string };
  } | null;
}

export interface BackendSettings {
  id: string;
  emailNotifications: boolean;
  interviewReminders: boolean;
  interviewReportNotifications: boolean;
  preparationReminders: boolean;
  platformAnnouncements: boolean;
  preferredCodingLang: string;
  preferredInterviewType: string;
  defaultDifficulty: string;
  preferredTopics: string[];
  resumePersonalization: boolean;
  strictInterviewRubric: boolean;
  theme: string;
}

export interface ActiveSessionInfo {
  id: string;
  createdAt: string;
  expiresAt: string;
}

export const analyticsService = {
  getDashboard: async (): Promise<DashboardPayload> => {
    return apiRequest<DashboardPayload>('/dashboard');
  },

  getAnalytics: async (): Promise<AnalyticsPayload> => {
    return apiRequest<AnalyticsPayload>('/analytics');
  },

  getProfile: async (): Promise<BackendProfileResponse> => {
    const res = await apiRequest<{ user: BackendProfileResponse }>('/profile');
    return res.user;
  },

  updateProfile: async (
    payload: Record<string, unknown>
  ): Promise<BackendProfileResponse> => {
    const res = await apiRequest<{ user: BackendProfileResponse }>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.user;
  },

  getSettings: async (): Promise<BackendSettings> => {
    const res = await apiRequest<{ settings: BackendSettings }>('/settings');
    return res.settings;
  },

  updateSettings: async (
    payload: Partial<BackendSettings>
  ): Promise<BackendSettings> => {
    const res = await apiRequest<{ settings: BackendSettings }>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.settings;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest<{ message: string }>('/settings/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  listSessions: async (): Promise<ActiveSessionInfo[]> => {
    const res = await apiRequest<{ sessions: ActiveSessionInfo[] }>('/settings/sessions');
    return res.sessions;
  },

  logoutAllDevices: async () => {
    return apiRequest<{ message: string; revokedCount: number }>('/settings/logout-all', {
      method: 'POST',
    });
  },

  deleteAccount: async (password: string) => {
    return apiRequest<{ message: string }>('/settings/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  },
};
