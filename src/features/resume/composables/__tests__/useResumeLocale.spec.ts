import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getResumeCopy } from '../../locales';
import {
  initResumeLocale,
  localeFromPath,
  rememberLocale,
  setResumeLocale,
  useResumeLocale,
} from '../useResumeLocale';

const STORAGE_KEY = 'rb-resume-lang';

const visit = (pathname: string): void => {
  window.history.replaceState({}, '', pathname);
};

const resetLocaleState = (): void => {
  localStorage.clear();
  document.documentElement.removeAttribute('lang');
  document.title = '';
  setResumeLocale('en');
  visit('/');
};

describe('localeFromPath', () => {
  it('maps the root to en', () => {
    expect(localeFromPath('/')).toBe('en');
  });

  it('maps the ru prefix to ru, with or without a trailing slash', () => {
    expect(localeFromPath('/ru')).toBe('ru');
    expect(localeFromPath('/ru/')).toBe('ru');
    expect(localeFromPath('/ru/anything')).toBe('ru');
  });

  it('does not treat a path that merely starts with "ru" as russian', () => {
    expect(localeFromPath('/ruby')).toBe('en');
    expect(localeFromPath('/runway/')).toBe('en');
  });
});

describe('useResumeLocale', () => {
  beforeEach(() => {
    resetLocaleState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetLocaleState();
  });

  it('derives the locale from the URL, not from storage', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    visit('/ru/');

    initResumeLocale();

    const { locale, isRu, isEn, copy } = useResumeLocale();
    expect(locale.value).toBe('ru');
    expect(isRu.value).toBe(true);
    expect(isEn.value).toBe(false);
    expect(copy.value.name).toBe(getResumeCopy('ru').name);
  });

  it('does not persist anything just because a page was opened', () => {
    visit('/ru/');

    initResumeLocale();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('leaves an existing preference untouched on open', () => {
    localStorage.setItem(STORAGE_KEY, 'ru');
    visit('/');

    initResumeLocale();

    expect(useResumeLocale().locale.value).toBe('en');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('ru');
  });

  it('rememberLocale records an explicit choice', () => {
    rememberLocale('ru');

    expect(localStorage.getItem(STORAGE_KEY)).toBe('ru');

    rememberLocale('en');

    expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
  });

  it('survives a blocked storage when remembering a choice', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => {
      rememberLocale('ru');
    }).not.toThrow();
  });

  it('setResumeLocale touches no DOM', () => {
    document.title = 'untouched';

    setResumeLocale('ru');

    expect(useResumeLocale().locale.value).toBe('ru');
    expect(document.title).toBe('untouched');
    expect(document.documentElement.hasAttribute('lang')).toBe(false);
  });
});
