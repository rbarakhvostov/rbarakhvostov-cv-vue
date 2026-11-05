import { computed, ref } from 'vue';

import type { Theme } from '../types';

const STORAGE_KEY = 'rb-resume-theme';
const DEFAULT_THEME: Theme = 'dark';

const theme = ref<Theme>(DEFAULT_THEME);

const isTheme = (value: string | null): value is Theme => {
  return value === 'light' || value === 'dark';
};

const readStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (isTheme(stored)) {
      return stored;
    }
  } catch {
    // private mode / blocked storage
  }

  return DEFAULT_THEME;
};

const persistTheme = (next: Theme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode / blocked storage
  }
};

const applyTheme = (next: Theme): void => {
  theme.value = next;
  document.documentElement.dataset.theme = next;
};

export const initResumeTheme = (): void => {
  applyTheme(readStoredTheme());
};

export const useResumeTheme = () => {
  const setTheme = (next: Theme): void => {
    applyTheme(next);
    persistTheme(next);
  };

  return {
    theme,
    setTheme,
    isLight: computed(() => theme.value === 'light'),
    isDark: computed(() => theme.value === 'dark'),
  };
};
