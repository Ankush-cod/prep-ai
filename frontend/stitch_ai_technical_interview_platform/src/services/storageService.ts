// src/services/storageService.ts
export const storageService = {
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(`prepai_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(`prepai_${key}`, JSON.stringify(value));
    } catch {
      // Storage unavailable or disabled
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(`prepai_${key}`);
    } catch {
      // Ignore
    }
  },
};
