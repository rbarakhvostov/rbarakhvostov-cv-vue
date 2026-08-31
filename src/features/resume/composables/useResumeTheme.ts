import { computed, ref } from 'vue';

import type { Theme } from '../types';

const STORAGE_KEY = 'rb-resume-theme';
const DEFAULT_THEME: Theme = 'dark';

const theme = ref<Theme>(DEFAULT_THEME);

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) {
      return stored;
    }
  } catch {
    // private mode / blocked storage
  }

  return DEFAULT_THEME;
}

function persistTheme(next: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode / blocked storage
  }
}

function applyTheme(next: Theme): void {
  theme.value = next;
  document.documentElement.dataset.theme = next;
}

export function initResumeTheme(): void {
  applyTheme(readStoredTheme());
}

export function useResumeTheme() {
  function setTheme(next: Theme): void {
    applyTheme(next);
    persistTheme(next);
  }

  return {
    theme,
    setTheme,
    isLight: computed(() => theme.value === 'light'),
    isDark: computed(() => theme.value === 'dark'),
  };
}
