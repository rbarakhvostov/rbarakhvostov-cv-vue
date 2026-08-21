import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initResumeTheme, useResumeTheme } from '../useResumeTheme';

const STORAGE_KEY = 'rb-resume-theme';

function resetThemeState(): void {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  useResumeTheme().setTheme('light');
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

  it('initResumeTheme applies a stored theme', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');

    initResumeTheme();

    const { theme, isDark, isLight } = useResumeTheme();
    expect(theme.value).toBe('dark');
    expect(isDark.value).toBe(true);
    expect(isLight.value).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('falls back to light when stored value is invalid', () => {
    localStorage.setItem(STORAGE_KEY, 'neon');

    initResumeTheme();

    const { theme } = useResumeTheme();
    expect(theme.value).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('setTheme applies the theme and persists it', () => {
    const { setTheme, theme, isDark } = useResumeTheme();

    setTheme('dark');

    expect(theme.value).toBe('dark');
    expect(isDark.value).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('falls back to light when reading storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    initResumeTheme();

    expect(useResumeTheme().theme.value).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
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
