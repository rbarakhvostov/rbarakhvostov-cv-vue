import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initResumeTheme, useResumeTheme } from '../useResumeTheme';

const STORAGE_KEY = 'rb-resume-theme';

type SystemTheme = {
  setPrefersLight: (next: boolean) => void;
};

/** jsdom не реализует matchMedia — подменяем его управляемым стабом. */
const stubSystemTheme = (prefersLight: boolean): SystemTheme => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  let matches = prefersLight;

  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    get matches() {
      return matches;
    },
    addEventListener: (
      _type: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => {
      listeners.add(listener);
    },
    removeEventListener: (
      _type: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => {
      listeners.delete(listener);
    },
  }));

  return {
    setPrefersLight: (next) => {
      matches = next;
      listeners.forEach((listener) => {
        listener({ matches: next } as MediaQueryListEvent);
      });
    },
  };
};

const resetThemeState = (): void => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  // setTheme также снимает подписку на системную тему, оставшуюся от прошлого теста.
  useResumeTheme().setTheme('dark');
  localStorage.clear();
};

describe('useResumeTheme', () => {
  beforeEach(() => {
    resetThemeState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetThemeState();
    vi.unstubAllGlobals();
  });

  it('uses the system theme when nothing is stored', () => {
    stubSystemTheme(true);

    initResumeTheme();

    const { theme, isDark, isLight } = useResumeTheme();
    expect(theme.value).toBe('light');
    expect(isLight.value).toBe(true);
    expect(isDark.value).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('uses dark when the system prefers dark and nothing is stored', () => {
    stubSystemTheme(false);

    initResumeTheme();

    const { theme, isDark } = useResumeTheme();
    expect(theme.value).toBe('dark');
    expect(isDark.value).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('falls back to dark when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);

    initResumeTheme();

    expect(useResumeTheme().theme.value).toBe('dark');
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

  it('prefers the stored theme over the system one', () => {
    stubSystemTheme(true);
    localStorage.setItem(STORAGE_KEY, 'dark');

    initResumeTheme();

    expect(useResumeTheme().theme.value).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('falls back to the system theme when the stored value is invalid', () => {
    stubSystemTheme(true);
    localStorage.setItem(STORAGE_KEY, 'neon');

    initResumeTheme();

    const { theme } = useResumeTheme();
    expect(theme.value).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('follows system theme changes while no choice is stored', () => {
    const system = stubSystemTheme(false);

    initResumeTheme();
    system.setPrefersLight(true);

    const { theme } = useResumeTheme();
    expect(theme.value).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');

    system.setPrefersLight(false);
    expect(theme.value).toBe('dark');
  });

  it('does not follow the system after the user picks a theme', () => {
    const system = stubSystemTheme(false);

    initResumeTheme();

    const { setTheme, theme } = useResumeTheme();
    setTheme('dark');

    system.setPrefersLight(true);

    expect(theme.value).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('does not follow the system when a stored theme was applied', () => {
    const system = stubSystemTheme(false);
    localStorage.setItem(STORAGE_KEY, 'dark');

    initResumeTheme();
    system.setPrefersLight(true);

    expect(useResumeTheme().theme.value).toBe('dark');
  });

  it('setTheme applies the theme and persists it', () => {
    const { setTheme, theme, isDark } = useResumeTheme();

    setTheme('light');

    expect(theme.value).toBe('light');
    expect(isDark.value).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('falls back to the system theme when reading storage throws', () => {
    stubSystemTheme(true);
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
