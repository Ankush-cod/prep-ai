// src/context/AppContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  StudentProfile,
  BookmarkItem,
  InterviewSetupConfig,
} from '../types/prepai';
import { useAuth } from './AuthContext';
import { analyticsService } from '../services/analyticsService';
import { bookmarkService } from '../services/bookmarkService';

interface ToastState {
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface AppContextType {
  profile: StudentProfile;
  refreshProfile: () => Promise<void>;
  updateProfile: (updated: Partial<StudentProfile>) => Promise<void>;
  bookmarks: BookmarkItem[];
  refreshBookmarks: () => Promise<void>;
  toggleBookmark: (
    item: Omit<BookmarkItem, 'savedDate'> & {
      savedDate?: string;
      targetType?: 'CODING_PROBLEM' | 'COMPANY_QUESTION' | 'PREPARATION_RESOURCE';
    }
  ) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isBookmarked: (id: string) => boolean;
  activeInterviewConfig: InterviewSetupConfig;
  setActiveInterviewConfig: React.Dispatch<React.SetStateAction<InterviewSetupConfig>>;
  quickFindOpen: boolean;
  setQuickFindOpen: (open: boolean) => void;
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  hideToast: () => void;
}

const emptyProfile: StudentProfile = {
  id: '',
  fullName: 'Student',
  initials: 'ST',
  rollNumber: '',
  email: '',
  phone: '',
  institution: '',
  degree: 'B.Tech',
  branch: 'CSE',
  academicYear: 1,
  semester: 1,
  graduationYear: new Date().getFullYear() + 4,
  cgpa: 0,
  mfaActive: false,
  streakDays: 0,
  readinessIndex: 0,
  targetRoles: [],
  targetCompanies: [],
  targetCompensation: '',
  skills: {
    languages: [],
    systems: [],
    theory: [],
  },
};

const defaultInterviewConfig: InterviewSetupConfig = {
  type: 'technical',
  company: 'Google',
  branch: 'CSE',
  difficulty: 'Medium',
  duration: 45,
  questionCount: 4,
  monacoEnabled: true,
  voiceSynthesis: false,
  resumeContext: true,
  strictRubric: true,
};

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ST';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<StudentProfile>(emptyProfile);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [activeInterviewConfig, setActiveInterviewConfig] = useState<InterviewSetupConfig>(
    defaultInterviewConfig
  );
  const [quickFindOpen, setQuickFindOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
      setToast({ message, type });
      setTimeout(() => {
        setToast(null);
      }, 3200);
    },
    []
  );

  const hideToast = () => setToast(null);

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(emptyProfile);
      return;
    }

    try {
      const [profRes, dashRes] = await Promise.all([
        analyticsService.getProfile(),
        analyticsService.getDashboard().catch(() => null),
      ]);

      const fullName = profRes.profile?.fullName || profRes.email.split('@')[0];
      const branch = profRes.academicDetails?.branch.code || 'CSE';
      const skillsLanguages = Array.isArray(profRes.profile?.skillsLanguages)
        ? (profRes.profile!.skillsLanguages as {
            name: string;
            level: 'Expert' | 'Advanced' | 'Proficient' | 'Working';
          }[])
        : [];

      setProfile({
        id: profRes.id,
        fullName,
        initials: computeInitials(fullName),
        rollNumber: profRes.academicDetails?.rollNumber || '',
        email: profRes.email,
        phone: profRes.profile?.phone || '',
        institution: profRes.academicDetails?.institution || '',
        degree: profRes.academicDetails?.degree || 'B.Tech',
        branch,
        academicYear: profRes.academicDetails?.academicYear || 1,
        semester: profRes.academicDetails?.semester.number || 1,
        graduationYear:
          profRes.academicDetails?.graduationYear || new Date().getFullYear() + 1,
        cgpa: profRes.academicDetails?.cgpa ?? 0,
        mfaActive: false,
        streakDays: dashRes?.summaryMetrics.streakDays ?? 0,
        readinessIndex: dashRes?.summaryMetrics.averageInterviewScore ?? 0,
        targetRoles: profRes.profile?.targetRoles || [],
        targetCompanies: profRes.profile?.targetCompanies || [],
        targetCompensation: profRes.profile?.targetCompensation || '',
        skills: {
          languages: skillsLanguages,
          systems: profRes.profile?.skillsSystems || [],
          theory: profRes.profile?.skillsTheory || [],
        },
      });

      setActiveInterviewConfig((prev) => ({
        ...prev,
        branch,
      }));
    } catch {
      if (user) {
        setProfile({
          ...emptyProfile,
          id: user.id,
          fullName: user.fullName,
          initials: computeInitials(user.fullName),
          email: user.email,
          branch: user.branch || 'CSE',
          academicYear: user.academicYear || 1,
          semester: user.semester || 1,
          institution: user.institution || '',
        });
      }
    }
  }, [isAuthenticated, user]);

  const refreshBookmarks = useCallback(async () => {
    if (!isAuthenticated) {
      setBookmarks([]);
      return;
    }
    try {
      const items = await bookmarkService.listBookmarks();
      setBookmarks(
        items.map((b) => ({
          id: b.targetId || b.id,
          bookmarkRecordId: b.id,
          title: b.title,
          category: b.category,
          branch: b.branch,
          difficulty:
            b.difficulty === 'EASY'
              ? 'Easy'
              : b.difficulty === 'HARD'
              ? 'Hard'
              : b.difficulty === 'MEDIUM'
              ? 'Medium'
              : undefined,
          tags: b.tags,
          targetCompany: b.targetCompany,
          savedDate: new Date(b.createdAt).toLocaleDateString(),
          type:
            b.category === 'Coding Practice'
              ? 'code'
              : b.category === 'Company Questions'
              ? 'doc'
              : 'compendium',
        })) as BookmarkItem[]
      );
    } catch {
      // Keep current state on transient failure
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
      refreshBookmarks();
    } else {
      setProfile(emptyProfile);
      setBookmarks([]);
    }
  }, [isAuthenticated, refreshProfile, refreshBookmarks]);

  const updateProfile = async (updated: Partial<StudentProfile>) => {
    try {
      await analyticsService.updateProfile({
        fullName: updated.fullName,
        phone: updated.phone,
        institution: updated.institution,
        rollNumber: updated.rollNumber,
        branch: updated.branch,
        academicYear: updated.academicYear,
        semester: updated.semester,
        graduationYear: updated.graduationYear,
        cgpa: updated.cgpa,
        targetRoles: updated.targetRoles,
        targetCompanies: updated.targetCompanies,
        targetCompensation: updated.targetCompensation,
        skillsLanguages: updated.skills?.languages,
        skillsSystems: updated.skills?.systems,
        skillsTheory: updated.skills?.theory,
      });
      await refreshProfile();
      showToast('Profile saved to database');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save profile changes',
        'warning'
      );
      throw err;
    }
  };

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  const toggleBookmark = async (
    item: Omit<BookmarkItem, 'savedDate'> & {
      savedDate?: string;
      targetType?: 'CODING_PROBLEM' | 'COMPANY_QUESTION' | 'PREPARATION_RESOURCE';
    }
  ) => {
    const inferredTargetType =
      item.targetType ||
      (item.category === 'Coding Practice'
        ? 'CODING_PROBLEM'
        : item.category === 'Company Questions'
        ? 'COMPANY_QUESTION'
        : 'PREPARATION_RESOURCE');

    try {
      const res = await bookmarkService.toggleBookmark(inferredTargetType, item.id);
      await refreshBookmarks();
      showToast(res.bookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Unable to update bookmark',
        'warning'
      );
    }
  };

  const removeBookmark = async (id: string) => {
    const match = bookmarks.find((b) => b.id === id) as
      | (BookmarkItem & { bookmarkRecordId?: string })
      | undefined;
    const recordId = match?.bookmarkRecordId || id;
    try {
      await bookmarkService.removeBookmark(recordId);
      await refreshBookmarks();
      showToast('Bookmark removed');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Unable to remove bookmark',
        'warning'
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        refreshProfile,
        updateProfile,
        bookmarks,
        refreshBookmarks,
        toggleBookmark,
        removeBookmark,
        isBookmarked,
        activeInterviewConfig,
        setActiveInterviewConfig,
        quickFindOpen,
        setQuickFindOpen,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
