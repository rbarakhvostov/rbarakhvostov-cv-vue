import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getResumeCopy } from '../../locales';
import { initResumeLocale, useResumeLocale } from '../useResumeLocale';

const STORAGE_KEY = 'rb-resume-lang';

/** jsdom отдаёт языки окружения — фиксируем их, чтобы тесты не зависели от машины. */
const stubSystemLanguages = (
  languages: readonly string[] | undefined,
): void => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(
    languages as readonly string[],
  );
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(
    languages?.[0] ?? 'en',
  );
};

const resetLocaleState = (): void => {
  localStorage.clear();
  document.documentElement.removeAttribute('lang');
  document.title = '';
  useResumeLocale().setLocale('en');
  localStorage.clear();
};

describe('useResumeLocale', () => {
  beforeEach(() => {
    resetLocaleState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetLocaleState();
  });

  it('uses the system locale when nothing is stored', () => {
    stubSystemLanguages(['ru-RU', 'en-US']);

    initResumeLocale();

    const { locale, isRu, copy } = useResumeLocale();
    expect(locale.value).toBe('ru');
    expect(isRu.value).toBe(true);
    expect(document.documentElement.lang).toBe('ru');
    expect(copy.value.name).toBe(getResumeCopy('ru').name);
  });

  it('uses en when the system language is english', () => {
    stubSystemLanguages(['en-US']);

    initResumeLocale();

    expect(useResumeLocale().locale.value).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('picks the first supported system language', () => {
    stubSystemLanguages(['de-DE', 'ru']);

    initResumeLocale();

    expect(useResumeLocale().locale.value).toBe('ru');
  });

  it('falls back to en when no system language is supported', () => {
    stubSystemLanguages(['de-DE', 'fr']);

    initResumeLocale();

    expect(useResumeLocale().locale.value).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('falls back to navigator.language when languages is unavailable', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(
      undefined as unknown as readonly string[],
    );
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ru-RU');

    initResumeLocale();

    expect(useResumeLocale().locale.value).toBe('ru');
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

  it('prefers the stored locale over the system one', () => {
    stubSystemLanguages(['ru-RU']);
    localStorage.setItem(STORAGE_KEY, 'en');

    initResumeLocale();

    expect(useResumeLocale().locale.value).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('falls back to the system locale when the stored value is invalid', () => {
    stubSystemLanguages(['ru-RU']);
    localStorage.setItem(STORAGE_KEY, 'de');

    initResumeLocale();

    const { locale } = useResumeLocale();
    expect(locale.value).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe(getResumeCopy('ru').name);
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

  it('falls back to the system locale when reading storage throws', () => {
    stubSystemLanguages(['en-US']);
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
