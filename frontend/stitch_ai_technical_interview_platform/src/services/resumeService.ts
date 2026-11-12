// src/services/resumeService.ts
import { apiRequest } from './api';

export interface BackendResumeAnalysis {
  id: string;
  education: { degree: string; institution: string; year: string; details?: string }[];
  skills: string[];
  technologies: string[];
  projects: { name: string; description: string; technologies: string[] }[];
  experience: {
    role: string;
    organization: string;
    period: string;
    highlights: string;
  }[];
  certifications: string[];
  summary?: string | null;
  generatedQuestions: { domain: string; prompt: string; difficulty: string }[];
  followUpQuestions: { parentTopic: string; prompt: string }[];
  aiProvider: string;
}

export interface BackendResume {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageUrl?: string | null;
  createdAt: string;
  analysis?: BackendResumeAnalysis | null;
}

export const resumeService = {
  uploadAndAnalyze: async (file: File): Promise<BackendResume> => {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await apiRequest<{ resume: BackendResume }>('/resumes/analyze', {
      method: 'POST',
      body: formData,
    });
    return res.resume;
  },

  listResumes: async (): Promise<BackendResume[]> => {
    const res = await apiRequest<{ resumes: BackendResume[] }>('/resumes');
    return res.resumes;
  },

  getLatestResume: async (): Promise<BackendResume | null> => {
    const res = await apiRequest<{ resume: BackendResume | null }>('/resumes/latest');
    return res.resume;
  },

  deleteResume: async (id: string): Promise<void> => {
    await apiRequest(`/resumes/${id}`, { method: 'DELETE' });
  },
};
