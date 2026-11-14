import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * Инлайн-скрипт из index.html — это единственная логика, которая не
 * импортируется приложением: он обязан отработать до первой отрисовки, пока
 * отложенный main.ts ещё не загружен. Здесь он вытаскивается из разметки и
 * исполняется с подменёнными глобалами, иначе таблица решений про редирект
 * осталась бы без покрытия — а именно в ней уже один раз жил баг, из-за
 * которого английская версия становилась недостижимой.
 */
// Vitest запускается из корня проекта (там же лежит vitest.config.ts).
const INDEX_HTML = resolve(process.cwd(), 'index.html');

let source = '';

type Globals = {
  pathname?: string;
  search?: string;
  hash?: string;
  stored?: Record<string, string>;
  storageThrows?: boolean;
  languages?: readonly string[];
  prefersLight?: boolean;
};

type Result = {
  replaced: string | null;
  theme: string | undefined;
};

const run = ({
  pathname = '/',
  search = '',
  hash = '',
  stored = {},
  storageThrows = false,
  languages = ['en-US'],
  prefersLight = false,
}: Globals): Result => {
  const replace = vi.fn();
  const root: { dataset: { theme?: string } } = { dataset: {} };

  const localStorageStub = {
    getItem: (key: string): string | null => {
      if (storageThrows) {
        throw new Error('blocked');
      }

      return stored[key] ?? null;
    },
  };

  // Голые `location` / `localStorage` внутри скрипта разрешатся в эти
  // параметры — подменять настоящие глобалы jsdom не нужно.
  const invoke = new Function(
    'location',
    'localStorage',
    'navigator',
    'window',
    'document',
    source,
  ) as (
    location: unknown,
    localStorage: unknown,
    navigator: unknown,
    window: unknown,
    document: unknown,
  ) => void;

  invoke(
    { pathname, search, hash, replace },
    localStorageStub,
    { languages },
    { matchMedia: () => ({ matches: prefersLight }) },
    { documentElement: root },
  );

  return {
    replaced: replace.mock.calls[0]?.[0] ?? null,
    theme: root.dataset.theme,
  };
};

describe('инлайн-скрипт index.html', () => {
  beforeAll(() => {
    const html = readFileSync(INDEX_HTML, 'utf8');
    const match = /<script>([\s\S]*?)<\/script>/.exec(html);

    if (!match?.[1]) {
      throw new Error('В index.html не найден инлайн-скрипт.');
    }

    source = match[1];
  });

  describe('выбор языка', () => {
    it('уводит русский браузер с корня на /ru/', () => {
      expect(run({ languages: ['ru-RU', 'en-US'] }).replaced).toBe('/ru/');
    });

    it('оставляет английский браузер на корне', () => {
      expect(run({ languages: ['en-US'] }).replaced).toBeNull();
    });

    it('игнорирует неподдерживаемые языки и берёт первый знакомый', () => {
      expect(run({ languages: ['de-DE', 'ru'] }).replaced).toBe('/ru/');
      expect(run({ languages: ['de-DE', 'fr'] }).replaced).toBeNull();
    });

    // Регрессия: именно здесь английская версия становилась недостижимой.
    it('подчиняется сохранённому выбору EN даже в русском браузере', () => {
      expect(
        run({ languages: ['ru-RU'], stored: { 'rb-resume-lang': 'en' } })
          .replaced,
      ).toBeNull();
    });

    it('уважает сохранённый выбор RU в английском браузере', () => {
      expect(
        run({ languages: ['en-US'], stored: { 'rb-resume-lang': 'ru' } })
          .replaced,
      ).toBe('/ru/');
    });

    it('считает испорченное значение в storage отсутствующим', () => {
      expect(
        run({ languages: ['ru-RU'], stored: { 'rb-resume-lang': 'de' } })
          .replaced,
      ).toBe('/ru/');
    });

    it('никогда не уводит с /ru/ — явный адрес сильнее', () => {
      expect(
        run({
          pathname: '/ru/',
          languages: ['ru-RU'],
          stored: { 'rb-resume-lang': 'ru' },
        }).replaced,
      ).toBeNull();
    });

    it('переносит query и hash при редиректе', () => {
      expect(
        run({ languages: ['ru'], search: '?a=1', hash: '#toggle-goatcounter' })
          .replaced,
      ).toBe('/ru/?a=1#toggle-goatcounter');
    });

    it('при недоступном storage опирается на язык браузера', () => {
      expect(run({ storageThrows: true, languages: ['ru-RU'] }).replaced).toBe(
        '/ru/',
      );
    });
  });

  describe('тема', () => {
    it('берёт сохранённое значение', () => {
      expect(run({ stored: { 'rb-resume-theme': 'light' } }).theme).toBe(
        'light',
      );
    });

    it('иначе следует системной', () => {
      expect(run({ prefersLight: true }).theme).toBe('light');
      expect(run({ prefersLight: false }).theme).toBe('dark');
    });

    it('не трогает тему, когда уводит на другую локаль', () => {
      expect(run({ languages: ['ru'] }).theme).toBeUndefined();
    });
  });
});
