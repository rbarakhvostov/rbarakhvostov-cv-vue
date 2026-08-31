import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initResumeTheme, useResumeTheme } from '../useResumeTheme';

const STORAGE_KEY = 'rb-resume-theme';

function resetThemeState(): void {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  useResumeTheme().setTheme('dark');
  localStorage.clear();
}

describe('useResumeTheme', () => {
  beforeEach(() => {
    resetThemeState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetThemeState();
  });

  it('defaults to dark when nothing is stored', () => {
    initResumeTheme();

    const { theme, isDark, isLight } = useResumeTheme();
    expect(theme.value).toBe('dark');
    expect(isDark.value).toBe(true);
    expect(isLight.value).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('initResumeTheme applies a stored theme', () => {
    localStorage.setItem(STORAGE_KEY, 'light');

    initResumeTheme();

    const { theme, isDark, isLight } = useResumeTheme();
    expect(theme.value).toBe('light');
    expect(isDark.value).toBe(false);
    expect(isLight.value).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('falls back to dark when stored value is invalid', () => {
    localStorage.setItem(STORAGE_KEY, 'neon');

    initResumeTheme();

    const { theme } = useResumeTheme();
    expect(theme.value).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('setTheme applies the theme and persists it', () => {
    const { setTheme, theme, isDark } = useResumeTheme();

    setTheme('light');

    expect(theme.value).toBe('light');
    expect(isDark.value).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('falls back to dark when reading storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    initResumeTheme();

    expect(useResumeTheme().theme.value).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('still applies the theme when writing storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    const { setTheme, theme } = useResumeTheme();
    setTheme('dark');

    expect(theme.value).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
