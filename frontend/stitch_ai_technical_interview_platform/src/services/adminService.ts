// src/services/adminService.ts
import { apiRequest } from './api';

export interface AdminOverviewResponse {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalSessions: number;
    completedSessions: number;
    totalResources: number;
    totalCodingProblems: number;
    totalCompanyQuestions: number;
    pendingResourceRequests: number;
    openReviewFlags: number;
  };
  integrations: {
    hasGemini: boolean;
    hasOpenAi: boolean;
    hasCloudinary: boolean;
    hasOnlineCompiler: boolean;
    hasSmtp: boolean;
  };
  recentUsers: {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
    isEmailVerified: boolean;
    createdAt: string;
    profile: { fullName: string } | null;
    academicDetails: {
      branch: { code: string };
      semester: { number: number };
    } | null;
  }[];
}

export interface AdminUserItem {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  profile: { fullName: string } | null;
  academicDetails: {
    institution: string;
    branch: { code: string };
    semester: { number: number };
  } | null;
  _count: { interviewSessions: number; codingSubmissions: number };
}

export interface AdminResourceRequestItem {
  id: string;
  title: string;
  subject: string;
  topic?: string | null;
  notes?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string | null;
  createdAt: string;
  branch: { code: string; name: string };
  user: {
    id: string;
    email: string;
    profile: { fullName: string } | null;
  };
}

export interface AdminAiReviewFlagItem {
  id: string;
  reason: string;
  details?: string | null;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  session: {
    id: string;
    title: string;
    interviewType: string;
    overallScore?: number | null;
  };
  reporter: {
    email: string;
    profile: { fullName: string } | null;
  } | null;
}

export interface AdminCodingProblemItem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  tags: string[];
  description: string;
  inputFormat?: string | null;
  outputFormat?: string | null;
  constraints?: string | null;
  starterTemplates?: Record<string, string> | null;
  testCases?: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>;
  externalUrl?: string | null;
  contestNumber?: number | null;
  problemLetter?: string | null;
  rating?: number | null;
  orderIndex: number;
  _count?: { userProgress: number; submissions: number };
}

export interface AdminInterviewSessionItem {
  id: string;
  title: string;
  interviewType: string;
  status: string;
  overallScore?: number | null;
  createdAt: string;
  completedAt?: string | null;
  user: {
    id: string;
    email: string;
    profile: { fullName: string } | null;
    academicDetails: {
      branch: { code: string };
      semester: { number: number };
    } | null;
  };
}

export const adminService = {
  getOverview: async (): Promise<AdminOverviewResponse> => {
    return apiRequest<AdminOverviewResponse>('/admin/overview');
  },

  listUsers: async (search?: string): Promise<AdminUserItem[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await apiRequest<{ users: AdminUserItem[] }>(`/admin/users${query}`);
    return res.users;
  },

  updateUser: async (
    id: string,
    payload: { role?: 'USER' | 'ADMIN'; isActive?: boolean }
  ) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  listResourceRequests: async (): Promise<AdminResourceRequestItem[]> => {
    const res = await apiRequest<{ requests: AdminResourceRequestItem[] }>(
      '/admin/resource-requests'
    );
    return res.requests;
  },

  updateResourceRequest: async (
    id: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    adminNote?: string
  ) => {
    return apiRequest(`/admin/resource-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNote }),
    });
  },

  listAiReviews: async (): Promise<AdminAiReviewFlagItem[]> => {
    const res = await apiRequest<{ flags: AdminAiReviewFlagItem[] }>('/admin/ai-reviews');
    return res.flags;
  },

  resolveAiReview: async (
    id: string,
    status: 'OPEN' | 'RESOLVED' | 'DISMISSED',
    resolution?: string
  ) => {
    return apiRequest(`/admin/ai-reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolution }),
    });
  },

  getPlatformAnalytics: async () => {
    return apiRequest<{
      branchDistribution: {
        code: string;
        name: string;
        studentsCount: number;
        interviewsCount: number;
        resourcesCount: number;
      }[];
      averageInterviewScore: number;
      completedInterviewsCount: number;
      codingSubmissions: { total: number; accepted: number };
    }>('/admin/analytics');
  },

  listCodingProblems: async (params?: { topic?: string; difficulty?: string; search?: string }): Promise<AdminCodingProblemItem[]> => {
    const q = new URLSearchParams();
    if (params?.topic) q.set('topic', params.topic);
    if (params?.difficulty) q.set('difficulty', params.difficulty);
    if (params?.search) q.set('search', params.search);
    const res = await apiRequest<{ problems: AdminCodingProblemItem[] }>(`/admin/coding-problems?${q.toString()}`);
    return res.problems;
  },

  createCodingProblem: async (payload: Partial<AdminCodingProblemItem>): Promise<AdminCodingProblemItem> => {
    const res = await apiRequest<{ problem: AdminCodingProblemItem }>('/admin/coding-problems', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.problem;
  },

  updateCodingProblem: async (id: string, payload: Partial<AdminCodingProblemItem>): Promise<AdminCodingProblemItem> => {
    const res = await apiRequest<{ problem: AdminCodingProblemItem }>(`/admin/coding-problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.problem;
  },

  deleteCodingProblem: async (id: string): Promise<void> => {
    await apiRequest(`/admin/coding-problems/${id}`, { method: 'DELETE' });
  },

  listInterviews: async (params?: { status?: string; search?: string }): Promise<AdminInterviewSessionItem[]> => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const res = await apiRequest<{ sessions: AdminInterviewSessionItem[] }>(`/admin/interviews?${q.toString()}`);
    return res.sessions;
  },
};
