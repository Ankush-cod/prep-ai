// src/hooks/useBookmarks.ts
import { useApp } from '../context/AppContext';

export const useBookmarks = () => {
  const { bookmarks, toggleBookmark, removeBookmark, isBookmarked } = useApp();
  return {
    bookmarks,
    toggleBookmark,
    removeBookmark,
    isBookmarked,
  };
};
