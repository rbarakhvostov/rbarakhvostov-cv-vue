import { computed, ref } from 'vue';

import { getResumeCopy } from '../locales';
import type { Locale } from '../types';

const STORAGE_KEY = 'rb-resume-lang';
const FALLBACK_LOCALE: Locale = 'en';

const locale = ref<Locale>(FALLBACK_LOCALE);

const isLocale = (value: string | null): value is Locale => {
  return value === 'en' || value === 'ru';
};

const readStoredLocale = (): Locale | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (isLocale(stored)) {
      return stored;
    }
  } catch {
    // private mode / blocked storage
  }

  return null;
};

const getSystemLocale = (): Locale => {
  if (typeof navigator === 'undefined') {
    return FALLBACK_LOCALE;
  }

  const tags = navigator.languages ?? [navigator.language];

  // Побеждает первый тег, язык которого мы поддерживаем ('ru-RU' → 'ru').
  for (const tag of tags) {
    const language = tag?.split('-')[0]?.toLowerCase() ?? null;

    if (isLocale(language)) {
      return language;
    }
  }

  return FALLBACK_LOCALE;
};

const persistLocale = (next: Locale): void => {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode / blocked storage
  }
};

const applyLocale = (next: Locale): void => {
  locale.value = next;
  document.documentElement.lang = next;
  document.title = getResumeCopy(next).name;
};

export const initResumeLocale = (): void => {
  applyLocale(readStoredLocale() ?? getSystemLocale());
};

export const useResumeLocale = () => {
  const copy = computed(() => getResumeCopy(locale.value));

  const setLocale = (next: Locale): void => {
    applyLocale(next);
    persistLocale(next);
  };

  return {
    locale,
    setLocale,
    copy,
    isEn: computed(() => locale.value === 'en'),
    isRu: computed(() => locale.value === 'ru'),
  };
};
