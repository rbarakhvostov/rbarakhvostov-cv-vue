import { computed, ref } from 'vue';

import type { Theme } from '../types';

const STORAGE_KEY = 'rb-resume-theme';
const FALLBACK_THEME: Theme = 'dark';
const LIGHT_QUERY = '(prefers-color-scheme: light)';

const theme = ref<Theme>(FALLBACK_THEME);

// Живёт столько же, сколько приложение: initResumeTheme() вызывается в main.ts
// вне scope компонента, поэтому onScopeDispose тут неприменим. Подписка снимается
// явно — в setTheme (пользователь сделал свой выбор) и при повторном init.
let stopSystemThemeWatch: (() => void) | null = null;

const isTheme = (value: string | null): value is Theme => {
  return value === 'light' || value === 'dark';
};

const readStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (isTheme(stored)) {
      return stored;
    }
  } catch {
    // private mode / blocked storage
  }

  return null;
};

const persistTheme = (next: Theme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode / blocked storage
  }
};

const matchLightQuery = (): MediaQueryList | null => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return null;
  }

  return window.matchMedia(LIGHT_QUERY);
};

const getSystemTheme = (): Theme => {
  return matchLightQuery()?.matches ? 'light' : FALLBACK_THEME;
};

const applyTheme = (next: Theme): void => {
  theme.value = next;
  document.documentElement.dataset.theme = next;
};

const unwatchSystemTheme = (): void => {
  stopSystemThemeWatch?.();
  stopSystemThemeWatch = null;
};

const watchSystemTheme = (): void => {
  unwatchSystemTheme();

  const query = matchLightQuery();

  if (!query) {
    return;
  }

  const onChange = (event: MediaQueryListEvent): void => {
    applyTheme(event.matches ? 'light' : FALLBACK_THEME);
  };

  query.addEventListener('change', onChange);
  stopSystemThemeWatch = () => query.removeEventListener('change', onChange);
};

export const initResumeTheme = (): void => {
  const stored = readStoredTheme();

  if (stored) {
    unwatchSystemTheme();
    applyTheme(stored);

    return;
  }

  applyTheme(getSystemTheme());
  watchSystemTheme();
};

export const useResumeTheme = () => {
  const setTheme = (next: Theme): void => {
    unwatchSystemTheme();
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
