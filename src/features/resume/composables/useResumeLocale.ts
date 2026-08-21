import { computed, ref } from 'vue'

import { getResumeCopy } from '../locales'
import type { Locale } from '../types'

const STORAGE_KEY = 'rb-resume-lang'
const DEFAULT_LOCALE: Locale = 'en'

const locale = ref<Locale>(DEFAULT_LOCALE)

function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'ru'
}

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLocale(stored)) {
      return stored
    }
  } catch {
    // private mode / blocked storage
  }

  return DEFAULT_LOCALE
}

function persistLocale(next: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // private mode / blocked storage
  }
}

function applyLocale(next: Locale): void {
  locale.value = next
  document.documentElement.lang = next
  document.title = getResumeCopy(next).name
}

export function initResumeLocale(): void {
  applyLocale(readStoredLocale())
}

export function useResumeLocale() {
  const copy = computed(() => getResumeCopy(locale.value))

  function setLocale(next: Locale): void {
    applyLocale(next)
    persistLocale(next)
  }

  return {
    locale,
    setLocale,
    copy,
    isEn: computed(() => locale.value === 'en'),
    isRu: computed(() => locale.value === 'ru'),
  }
}
