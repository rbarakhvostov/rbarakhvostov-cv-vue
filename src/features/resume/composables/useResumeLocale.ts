import { computed, ref } from 'vue';

import { getResumeCopy } from '../locales';
import type { Locale } from '../types';

const STORAGE_KEY = 'rb-resume-lang';
const FALLBACK_LOCALE: Locale = 'en';
const RU_PREFIX = '/ru';

const locale = ref<Locale>(FALLBACK_LOCALE);

/**
 * Чистая запись состояния, без обращений к DOM — её вызывает пререндер
 * в Node перед каждым рендером.
 */
export const setResumeLocale = (next: Locale): void => {
  locale.value = next;
};

/** URL — источник истины: `/ru` и `/ru/...` → ru, всё остальное → en. */
export const localeFromPath = (pathname: string): Locale => {
  return pathname === RU_PREFIX || pathname.startsWith(`${RU_PREFIX}/`)
    ? 'ru'
    : FALLBACK_LOCALE;
};

/**
 * Запоминает ЯВНЫЙ выбор языка — только клик по переключателю, не факт
 * открытия страницы. Инлайн-скрипт в index.html читает это значение, чтобы
 * увести с `/` на `/ru/`, поэтому записывать сюда локаль просто потому, что
 * её открыли, нельзя: заход на `/ru/` навсегда заблокировал бы возврат на
 * английскую версию — редирект срабатывал бы раньше, чем отложенный main.ts
 * успел бы записать `en`.
 */
export const rememberLocale = (next: Locale): void => {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode / blocked storage
  }
};

/** Клиентский bootstrap: локаль целиком определяется адресом страницы. */
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
