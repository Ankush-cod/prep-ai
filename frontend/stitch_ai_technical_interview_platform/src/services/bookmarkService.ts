// src/services/bookmarkService.ts
import { apiRequest } from './api';
import { Branch } from '../types/prepai';

export type BookmarkTargetType =
  | 'CODING_PROBLEM'
  | 'COMPANY_QUESTION'
  | 'PREPARATION_RESOURCE';

export interface BackendBookmark {
  id: string;
  targetId: string;
  targetType: BookmarkTargetType;
  category: 'Coding Practice' | 'Company Questions' | 'Preparation Resources';
  title: string;
  branch: Branch | 'Cross-Track';
  difficulty?: string;
  tags: string[];
  targetCompany?: string;
  createdAt: string;
}

export const bookmarkService = {
  listBookmarks: async (): Promise<BackendBookmark[]> => {
    const res = await apiRequest<{ bookmarks: BackendBookmark[] }>('/bookmarks');
    return res.bookmarks;
  },

  toggleBookmark: async (
    targetType: BookmarkTargetType,
    targetId: string
  ): Promise<{ bookmarked: boolean }> => {
    return apiRequest<{ bookmarked: boolean }>('/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId }),
    });
  },

  removeBookmark: async (bookmarkId: string): Promise<void> => {
    await apiRequest(`/bookmarks/${bookmarkId}`, { method: 'DELETE' });
  },
};
