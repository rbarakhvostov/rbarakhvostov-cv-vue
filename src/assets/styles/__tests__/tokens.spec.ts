import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const srcDir = join(process.cwd(), 'src');

const DECLARATION = /--([\w-]+)\s*:/g;
const REFERENCE = /var\(\s*(--[\w-]+)/g;

const collectStyleFiles = (dir: string): string[] => {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectStyleFiles(path));

      continue;
    }

    if (entry.name.endsWith('.css') || entry.name.endsWith('.vue')) {
      files.push(path);
    }
  }

  return files;
};

const matchAll = (source: string, pattern: RegExp): string[] =>
  [...source.matchAll(pattern)].map((match) => match[1] ?? '');

describe('css custom properties', () => {
  it('resolves every var() reference in src to a declared property', () => {
    const files = collectStyleFiles(srcDir);
    const declared = new Set<string>();
    const referenced = new Map<string, string>();

    for (const file of files) {
      const source = readFileSync(file, 'utf8');

      for (const name of matchAll(source, DECLARATION)) {
        declared.add(`--${name}`);
      }

      for (const name of matchAll(source, REFERENCE)) {
        if (!referenced.has(name)) {
          referenced.set(name, file.slice(srcDir.length));
        }
      }
    }

    const dangling = [...referenced]
      .filter(([name]) => !declared.has(name))
      .map(([name, file]) => `${name} (${file})`);

    expect(dangling).toEqual([]);
  });

  it('keeps the theme tokens defined in both themes', () => {
    const tokens = readFileSync(
      join(srcDir, 'assets/styles/tokens.css'),
      'utf8',
    );
    const light = tokens.slice(tokens.indexOf("[data-theme='light']"));

    const perTheme = [
      '--color-bg',
      '--color-surface',
      '--color-text',
      '--color-role',
      '--color-divider',
      '--color-control-border',
      '--color-danger',
      '--color-form-danger',
      '--color-success',
      '--control-raised',
      '--control-raised-shadow',
      '--chip-bg',
      '--chip-fg',
    ];

    for (const token of perTheme) {
      expect(light).toContain(`${token}:`);
    }

    expect(tokens).toContain('--color-accent: var(--color-text);');
  });
});
