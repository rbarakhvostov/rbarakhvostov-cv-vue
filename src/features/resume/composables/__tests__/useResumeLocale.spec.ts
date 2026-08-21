import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getResumeCopy } from '../../locales';
import { initResumeLocale, useResumeLocale } from '../useResumeLocale';

const STORAGE_KEY = 'rb-resume-lang';

function resetLocaleState(): void {
  localStorage.clear();
  document.documentElement.removeAttribute('lang');
  document.title = '';
  useResumeLocale().setLocale('en');
  localStorage.clear();
}

describe('useResumeLocale', () => {
  beforeEach(() => {
    resetLocaleState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetLocaleState();
  });

  it('initResumeLocale applies a stored locale', () => {
    localStorage.setItem(STORAGE_KEY, 'ru');

    initResumeLocale();

    const { locale, isRu, isEn, copy } = useResumeLocale();
    expect(locale.value).toBe('ru');
    expect(isRu.value).toBe(true);
    expect(isEn.value).toBe(false);
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe(getResumeCopy('ru').name);
    expect(copy.value.name).toBe(getResumeCopy('ru').name);
  });

  it('falls back to en when stored value is invalid', () => {
    localStorage.setItem(STORAGE_KEY, 'de');

    initResumeLocale();

    const { locale } = useResumeLocale();
    expect(locale.value).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe(getResumeCopy('en').name);
  });

  it('setLocale applies the locale, title, and persists it', () => {
    const { setLocale, locale, isRu } = useResumeLocale();

    setLocale('ru');

    expect(locale.value).toBe('ru');
    expect(isRu.value).toBe(true);
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe(getResumeCopy('ru').name);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('ru');
  });

  it('falls back to en when reading storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    initResumeLocale();

    expect(useResumeLocale().locale.value).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('still applies the locale when writing storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    const { setLocale, locale } = useResumeLocale();
    setLocale('ru');

    expect(locale.value).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe(getResumeCopy('ru').name);
  });
});
