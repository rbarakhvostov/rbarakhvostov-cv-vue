import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';

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
  route: string;
  lang: Locale;
  head: string;
  html: string;
};

export const renderAll = async (): Promise<readonly PrerenderedPage[]> => {
  const pages: PrerenderedPage[] = [];

  for (const locale of LOCALES) {
    setResumeLocale(locale);

    const html = await renderToString(createSSRApp(App));

    pages.push({
      route: LOCALE_PATHS[locale],
      lang: locale,
      head: buildHead(locale),
      html,
    });
  }

  setResumeLocale(DEFAULT_LOCALE);

  return pages;
};

export const renderSitemap = (): string => {
  return buildSitemap(new Date().toISOString().slice(0, 10));
};
