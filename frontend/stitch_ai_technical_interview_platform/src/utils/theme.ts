// src/utils/theme.ts
export type ThemePreference = 'dark' | 'light' | 'system';

const THEME_STORAGE_KEY = 'prepai_theme';

export function getStoredTheme(): ThemePreference {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light' || saved === 'system') {
    return saved;
  }
  return 'dark';
}

export function resolveTheme(preference: ThemePreference): 'dark' | 'light' {
  if (preference === 'system') {
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }
  return preference;
}

export function applyTheme(preference: ThemePreference): void {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.classList.remove('theme-dark', 'theme-light', 'dark');
  if (resolved === 'light') {
    root.classList.add('theme-light');
  } else {
    root.classList.add('theme-dark', 'dark');
  }
}

export function initTheme(): () => void {
  const pref = getStoredTheme();
  applyTheme(pref);

  const mediaQuery = window.matchMedia?.('(prefers-color-scheme: light)');
  const onSystemChange = () => {
    if (getStoredTheme() === 'system') {
      applyTheme('system');
    }
  };

  mediaQuery?.addEventListener?.('change', onSystemChange);
  return () => mediaQuery?.removeEventListener?.('change', onSystemChange);
}
