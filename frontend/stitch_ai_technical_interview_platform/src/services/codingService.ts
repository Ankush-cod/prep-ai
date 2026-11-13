// src/services/codingService.ts
import { apiRequest } from './api';

export type CodingLanguage = 'cpp' | 'python' | 'java' | 'javascript' | 'go';

export interface BackendCodingProblem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  track: string;
  step?: string | null;
  collection?: 'STRIVER_A2Z' | 'CP_31' | null;
  problemIdentifier?: string | null;
  contestNumber?: number | null;
  rating?: number | null;
  externalUrl?: string | null;
  orderIndex?: number | null;
  tags: string[];
  description: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: Record<CodingLanguage, string>;
  testCases: { input: string; expectedOutput: string }[];
  company?: { id: string; name: string; slug: string } | null;
  solved?: boolean;
  isBookmarked?: boolean;
}

export interface BackendCodingSubmission {
  id: string;
  problemId: string;
  language: string;
  status: string;
  stdout?: string | null;
  stderr?: string | null;
  compileOutput?: string | null;
  runtimeMs?: number | null;
  memoryKb?: number | null;
  passedCount: number;
  totalCount: number;
  createdAt: string;
  problem?: { id: string; title: string; difficulty: string; topic?: string };
}

export const codingService = {
  getLanguages: async () => {
    const res = await apiRequest<{
      languages: { id: CodingLanguage; compilerId: string; available: boolean }[];
    }>('/coding/languages');
    return res.languages;
  },

  listProblems: async (filters?: {
    collection?: 'STRIVER_A2Z' | 'CP_31' | 'ALL';
    difficulty?: string;
    topic?: string;
    company?: string;
    rating?: number;
    status?: 'all' | 'solved' | 'unsolved';
    search?: string;
  }): Promise<{
    problems: BackendCodingProblem[];
    stats: {
      total: number;
      solved: number;
      striverTotal: number;
      striverSolved: number;
      cp31Total: number;
      cp31Solved: number;
    };
  }> => {
    const params = new URLSearchParams();
    if (filters?.collection && filters.collection !== 'ALL') {
      params.set('collection', filters.collection);
    }
    if (filters?.difficulty && filters.difficulty !== 'All') {
      params.set('difficulty', filters.difficulty.toUpperCase());
    }
    if (filters?.topic && filters.topic !== 'All') params.set('topic', filters.topic);
    if (filters?.company && filters.company !== 'All') {
      params.set('company', filters.company);
    }
    if (filters?.rating) params.set('rating', String(filters.rating));
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    const res = await apiRequest<{
      problems: BackendCodingProblem[];
      stats: {
        total: number;
        solved: number;
        striverTotal: number;
        striverSolved: number;
        cp31Total: number;
        cp31Solved: number;
      };
    }>(`/coding/problems${query ? `?${query}` : ''}`);
    return res;
  },

  getProblem: async (id: string) => {
    const res = await apiRequest<{
      problem: BackendCodingProblem & { recentSubmissions: BackendCodingSubmission[] };
    }>(`/coding/problems/${id}`);
    return res.problem;
  },

  runSample: async (
    problemId: string,
    payload: { language: CodingLanguage; sourceCode: string; customInput?: string }
  ) => {
    const res = await apiRequest<{
      result: {
        mode: 'sample' | 'custom';
        passed?: boolean;
        status: string;
        stdout: string;
        expectedOutput?: string;
        stderr: string;
        compileOutput: string;
        runtimeMs: number | null;
        memoryKb: number | null;
      };
    }>(`/coding/problems/${problemId}/run`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.result;
  },

  submitSolution: async (
    problemId: string,
    payload: { language: CodingLanguage; sourceCode: string }
  ): Promise<BackendCodingSubmission> => {
    const res = await apiRequest<{ submission: BackendCodingSubmission }>(
      `/coding/problems/${problemId}/submit`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.submission;
  },

  listSubmissions: async (problemId?: string): Promise<BackendCodingSubmission[]> => {
    const query = problemId ? `?problemId=${encodeURIComponent(problemId)}` : '';
    const res = await apiRequest<{ submissions: BackendCodingSubmission[] }>(
      `/coding/submissions${query}`
    );
    return res.submissions;
  },
};
