import { computed, ref } from 'vue';

import { getResumeCopy } from '../locales';
import type { Locale } from '../types';

const STORAGE_KEY = 'rb-resume-lang';
const FALLBACK_LOCALE: Locale = 'en';
const RU_PREFIX = '/ru';

const locale = ref<Locale>(FALLBACK_LOCALE);

export const setResumeLocale = (next: Locale): void => {
  locale.value = next;
};

export const localeFromPath = (pathname: string): Locale => {
  return pathname === RU_PREFIX || pathname.startsWith(`${RU_PREFIX}/`)
    ? 'ru'
    : FALLBACK_LOCALE;
};

export const rememberLocale = (next: Locale): void => {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode / blocked storage
  }
};

export const initResumeLocale = (): void => {
  setResumeLocale(localeFromPath(window.location.pathname));
};

export const useResumeLocale = () => {
  const copy = computed(() => getResumeCopy(locale.value));

  return {
    locale,
    copy,
    isEn: computed(() => locale.value === 'en'),
    isRu: computed(() => locale.value === 'ru'),
  };
};
