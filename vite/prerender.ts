import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build, type Plugin, type ResolvedConfig } from 'vite';

/** Зеркало `PrerenderedPage` из `src/entry-server.ts`. */
type PrerenderedPage = {
  route: string;
  lang: string;
  head: string;
  html: string;
  teleports: string;
};

type ServerEntry = {
  renderAll: () => Promise<readonly PrerenderedPage[]>;
  renderSitemap: () => string;
};

const SSR_ENTRY = 'src/entry-server.ts';
const SSR_OUT_DIR = 'dist-ssr';
const SSR_BUNDLE = join(SSR_OUT_DIR, 'entry-server.js');

const BODY_OPEN = '<body>';
const TITLE_OPEN = '<title>';
const TITLE_CLOSE = '</title>';

const HEAD_MARKER = '<!--app-head-->';
const HTML_MARKER = '<!--app-html-->';
const TELEPORTS_MARKER = '<!--app-teleports-->';
const LANG_MARKER = '<html lang="en"';

const isPrerenderedPage = (value: unknown): value is PrerenderedPage => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const page = value as Record<string, unknown>;

  return (
    typeof page.route === 'string' &&
    typeof page.lang === 'string' &&
    typeof page.head === 'string' &&
    typeof page.html === 'string' &&
    typeof page.teleports === 'string'
  );
};

const isServerEntry = (value: unknown): value is ServerEntry => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.renderAll === 'function' &&
    typeof entry.renderSitemap === 'function'
  );
};

const assertContains = (template: string, needle: string): void => {
  if (!template.includes(needle)) {
    throw new Error(
      `index.html is missing \`${needle}\`, which the prerender plugin needs.`,
    );
  }
};

/**
 * Замена функцией, а не строкой: в строковой замене `$&`, `` $` `` и `$'`
 * — управляющие последовательности. Одна строчка опыта вида «сэкономил $5
 * млн» молча перекорёжила бы разметку.
 */
const replaceOnce = (
  template: string,
  marker: string,
  value: string,
): string => {
  return template.replace(marker, () => value);
};

/**
 * `<title>` в index.html нужен только для `npm run dev`. В сборке рядом с ним
 * встал бы пререндеренный заголовок, а браузер и Google берут первый, поэтому
 * вырезаем его вместе с отступом — не полагаясь на то, как Prettier его
 * отформатировал.
 */
const stripDevTitle = (template: string): string => {
  const start = template.indexOf(TITLE_OPEN);
  const close = template.indexOf(TITLE_CLOSE, start) + TITLE_CLOSE.length;
  const next = template.indexOf('<', close);

  return template.slice(0, start) + template.slice(next);
};

/**
 * Якоря телепорта должны стать первым узлом `<body>`: `hydrateTeleport`
 * начинает с `target.firstChild` и ждёт там комментарий «teleport start
 * anchor». Поэтому вставляем не «вместо маркера», а «вместо всего, что стоит
 * между `<body>` и концом маркера» — так в выдачу не попадёт ни текстовый
 * узел с отступом Prettier, ни поясняющий комментарий.
 */
const injectTeleports = (template: string, teleports: string): string => {
  const bodyEnd = template.indexOf(BODY_OPEN) + BODY_OPEN.length;
  const markerStart = template.indexOf(TELEPORTS_MARKER);
  const between = template.slice(bodyEnd, markerStart);

  if (!/^\s*(?:<!--[\s\S]*?-->\s*)*$/.test(between)) {
    throw new Error(
      'Only whitespace and comments may sit between <body> and the teleports marker.',
    );
  }

  return (
    template.slice(0, bodyEnd) +
    teleports +
    template.slice(markerStart + TELEPORTS_MARKER.length)
  );
};

const renderPage = (template: string, page: PrerenderedPage): string => {
  const withHead = replaceOnce(
    replaceOnce(
      stripDevTitle(template),
      LANG_MARKER,
      `<html lang="${page.lang}"`,
    ),
    HEAD_MARKER,
    page.head,
  );

  return injectTeleports(
    replaceOnce(withHead, HTML_MARKER, page.html),
    page.teleports,
  );
};

const loadServerEntry = async (root: string): Promise<ServerEntry> => {
  const bundleUrl = pathToFileURL(resolve(root, SSR_BUNDLE)).href;
  const loaded: unknown = await import(bundleUrl);

  if (!isServerEntry(loaded)) {
    throw new Error(`${SSR_BUNDLE} does not export renderAll/renderSitemap.`);
  }

  return loaded;
};

/**
 * Собирает статический HTML на каждую локаль после обычной клиентской сборки.
 *
 * Почему плагин, а не отдельный npm-скрипт: CI гоняет `build-only`, а Netlify —
 * `build`. Скрипт, подвешенный к одному из них, во втором молча не выполнится.
 * Внутри `vite build` все точки входа ведут себя одинаково по построению.
 */
export const prerender = (): Plugin => {
  let config: ResolvedConfig;

  return {
    name: 'rb-prerender',

    // Не `apply: 'build'`: вложенная SSR-сборка ниже — тоже `build`, и плагин
    // запустил бы сам себя. `isSsrBuild` — ровно тот дискриминатор, что нужен.
    apply: (_config, env) => env.command === 'build' && !env.isSsrBuild,

    configResolved(resolved) {
      config = resolved;
    },

    async closeBundle() {
      const { root } = config;
      const outDir = resolve(root, config.build.outDir);

      await build({
        root,
        // Тот же mode, что и у клиентской сборки: иначе `import.meta.env`
        // в общих модулях разошёлся бы между разметкой и бандлом.
        mode: config.mode,
        logLevel: 'warn',
        build: { ssr: SSR_ENTRY, outDir: SSR_OUT_DIR },
      });

      const entry = await loadServerEntry(root);
      const template = await readFile(join(outDir, 'index.html'), 'utf8');

      for (const needle of [
        HEAD_MARKER,
        HTML_MARKER,
        TELEPORTS_MARKER,
        LANG_MARKER,
        TITLE_OPEN,
      ]) {
        assertContains(template, needle);
      }

      const pages = await entry.renderAll();

      if (!pages.every(isPrerenderedPage)) {
        throw new Error('renderAll() returned an unexpected page shape.');
      }

      for (const page of pages) {
        const target = join(outDir, page.route, 'index.html');

        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, renderPage(template, page), 'utf8');

        config.logger.info(`prerendered ${page.route} (${page.lang})`);
      }

      await writeFile(
        join(outDir, 'sitemap.xml'),
        entry.renderSitemap(),
        'utf8',
      );
    },
  };
};
