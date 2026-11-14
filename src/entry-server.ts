import { createSSRApp } from 'vue';
import { renderToString, type SSRContext } from 'vue/server-renderer';

import App from './App.vue';
import { setResumeLocale } from './features/resume/composables/useResumeLocale';
import {
  DEFAULT_LOCALE,
  LOCALE_PATHS,
  LOCALES,
} from './features/resume/data/seo';
import type { Locale } from './features/resume/types';
import { buildHead, buildSitemap } from './features/resume/utils/buildHead';

export type PrerenderedPage = {
  /** Путь, по которому ляжет файл: `/` → `dist/index.html`, `/ru/` → `dist/ru/index.html`. */
  route: string;
  lang: Locale;
  /** Содержимое маркера `<!--app-head-->`. */
  head: string;
  /** Разметка внутрь `#app`. */
  html: string;
  /** Якоря `<Teleport to="body">` — без них гидратация слоя тостов ломается. */
  teleports: string;
};

/**
 * Рендерит все локали за один проход.
 *
 * Строго последовательно и по свежему `createSSRApp` на страницу: `locale` —
 * модульный `ref`, общий для всех рендеров в процессе Node, а `renderToString`
 * асинхронный. Сегодня дерево нигде не приостанавливается, поэтому параллельный
 * рендер сработал бы случайно — и сломался бы в день появления первого
 * `defineAsyncComponent`.
 *
 * `theme` трогать не нужно: на сервере в него никто не пишет, он остаётся
 * `dark` — ровно то значение, с которым клиент приходит на гидратацию
 * (`initResumeTheme()` в `main.ts` вызывается уже после `mount`).
 */
export const renderAll = async (): Promise<readonly PrerenderedPage[]> => {
  const pages: PrerenderedPage[] = [];

  for (const locale of LOCALES) {
    setResumeLocale(locale);

    const context: SSRContext = {};
    const html = await renderToString(createSSRApp(App), context);

    pages.push({
      route: LOCALE_PATHS[locale],
      lang: locale,
      head: buildHead(locale),
      html,
      teleports: context.teleports?.body ?? '',
    });
  }

  setResumeLocale(DEFAULT_LOCALE);

  return pages;
};

export const renderSitemap = (): string => {
  // Дата сборки в формате W3C (YYYY-MM-DD), которого ждёт <lastmod>.
  return buildSitemap(new Date().toISOString().slice(0, 10));
};
