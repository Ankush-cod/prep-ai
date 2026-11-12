// src/services/resourceService.ts
import { apiRequest } from './api';
import { Branch } from '../types/prepai';

export interface BackendResource {
  id: string;
  title: string;
  subject: string;
  topic: string;
  format: 'PDF' | 'COMPENDIUM' | 'CHEATSHEET' | 'NOTES' | 'GATE_PYQS' | 'LINK';
  description: string;
  contentUrl?: string | null;
  contentBody?: string | null;
  fileSize?: string | null;
  pages?: number | null;
  author: string;
  upvotes: number;
  downloads: number;
  isVerified: boolean;
  isGatePyq: boolean;
  isBookmarked?: boolean;
  branch: { id: string; code: Branch; name: string };
  semester: { id: string; number: number; label: string };
}

export interface BackendCompany {
  id: string;
  name: string;
  slug: string;
  industry?: string | null;
  description?: string | null;
  questionCount: number;
  codingProblemCount: number;
}

export interface BackendCompanyQuestion {
  id: string;
  role: string;
  title: string;
  questionText: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  frequency: string;
  lastAsked?: string | null;
  provenance: string;
  solutionSummary: string;
  keyConcepts: string[];
  acceptanceRate?: string | null;
  isBookmarked?: boolean;
  company: { id: string; name: string; slug: string };
}

export const resourceService = {
  listResources: async (filters?: {
    branch?: Branch;
    semester?: number | 'All';
    subject?: string;
    topic?: string;
    format?: string;
    isGatePyq?: boolean;
    search?: string;
  }): Promise<BackendResource[]> => {
    const params = new URLSearchParams();
    if (filters?.branch) params.set('branch', filters.branch);
    if (filters?.semester && filters.semester !== 'All') {
      params.set('semester', String(filters.semester));
    }
    if (filters?.subject) params.set('subject', filters.subject);
    if (filters?.topic) params.set('topic', filters.topic);
    if (filters?.format) params.set('format', filters.format);
    if (filters?.isGatePyq !== undefined) {
      params.set('isGatePyq', String(filters.isGatePyq));
    }
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    const res = await apiRequest<{ resources: BackendResource[] }>(
      `/resources${query ? `?${query}` : ''}`
    );
    return res.resources;
  },

  upvoteResource: async (id: string): Promise<BackendResource> => {
    const res = await apiRequest<{ resource: BackendResource }>(
      `/resources/${id}/upvote`,
      { method: 'POST' }
    );
    return res.resource;
  },

  trackDownload: async (id: string): Promise<BackendResource> => {
    const res = await apiRequest<{ resource: BackendResource }>(
      `/resources/${id}/download`,
      { method: 'POST' }
    );
    return res.resource;
  },

  submitResourceRequest: async (payload: {
    branch: Branch;
    title: string;
    subject: string;
    topic?: string;
    notes?: string;
  }) => {
    return apiRequest('/resources/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  listCompanies: async (): Promise<BackendCompany[]> => {
    const res = await apiRequest<{ companies: BackendCompany[] }>(
      '/company-questions/companies'
    );
    return res.companies;
  },

  listCompanyQuestions: async (filters?: {
    company?: string;
    topic?: string;
    difficulty?: string;
    search?: string;
  }): Promise<BackendCompanyQuestion[]> => {
    const params = new URLSearchParams();
    if (filters?.company && filters.company !== 'All') {
      params.set('company', filters.company);
    }
    if (filters?.topic && filters.topic !== 'All') params.set('topic', filters.topic);
    if (filters?.difficulty && filters.difficulty !== 'All') {
      params.set('difficulty', filters.difficulty.toUpperCase());
    }
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    const res = await apiRequest<{ questions: BackendCompanyQuestion[] }>(
      `/company-questions${query ? `?${query}` : ''}`
    );
    return res.questions;
  },

  // Admin CRUD
  createResource: async (payload: Record<string, unknown>) => {
    return apiRequest<{ resource: BackendResource }>('/resources', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteResource: async (id: string) => {
    return apiRequest(`/resources/${id}`, { method: 'DELETE' });
  },

  createCompanyQuestion: async (payload: Record<string, unknown>) => {
    return apiRequest<{ question: BackendCompanyQuestion }>('/company-questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteCompanyQuestion: async (id: string) => {
    return apiRequest(`/company-questions/${id}`, { method: 'DELETE' });
  },
};
