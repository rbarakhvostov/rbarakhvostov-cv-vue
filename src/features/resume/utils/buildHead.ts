import {
  absoluteUrl,
  DEFAULT_LOCALE,
  getSeoCopy,
  LOCALE_PATHS,
  LOCALES,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
} from '../data/seo';
import { getResumeCopy } from '../locales';
import type { Locale } from '../types';
import { buildJsonLd } from './buildJsonLd';
import { escapeHtml, escapeJsonLd } from './escapeHtml';

// Цвета продублированы из tokens.css: meta[theme-color] читает браузер до того,
// как загрузится CSS, поэтому через переменную его не задать.
const THEME_COLORS = {
  dark: '#161826',
  light: '#f3f5fe',
} as const;

const meta = (
  attribute: 'name' | 'property',
  key: string,
  content: string,
): string => {
  return `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
};

const link = (rel: string, href: string, extra = ''): string => {
  return `<link rel="${rel}" href="${escapeHtml(href)}"${extra} />`;
};

const preloadFont = (file: string): string => {
  return link(
    'preload',
    `/fonts/${file}`,
    ' as="font" type="font/woff2" crossorigin',
  );
};

/**
 * Латиница нужна обеим локалям — на русской странице по-английски написаны
 * роли и названия технологий. Кириллицу грузим только там, где она есть.
 */
const buildFontPreloads = (locale: Locale): readonly string[] => {
  const preloads = [preloadFont('inter-latin.woff2')];

  if (locale === 'ru') {
    preloads.push(preloadFont('inter-cyrillic.woff2'));
  }

  return preloads;
};

const buildAlternates = (): readonly string[] => {
  const alternates = LOCALES.map((locale) =>
    link(
      'alternate',
      absoluteUrl(LOCALE_PATHS[locale]),
      ` hreflang="${locale}"`,
    ),
  );

  return [
    ...alternates,
    link(
      'alternate',
      absoluteUrl(LOCALE_PATHS[DEFAULT_LOCALE]),
      ' hreflang="x-default"',
    ),
  ];
};

/**
 * Весь `<head>`, зависящий от локали, одной строкой — её подставляет
 * пререндер-плагин в маркер `<!--app-head-->`.
 */
export const buildHead = (locale: Locale): string => {
  const copy = getResumeCopy(locale);
  const seo = getSeoCopy(locale);
  const pageUrl = absoluteUrl(LOCALE_PATHS[locale]);
  const imageUrl = absoluteUrl(OG_IMAGE_PATH);
  const alternateLocale = locale === 'en' ? 'ru' : 'en';

  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    meta('name', 'description', seo.description),
    meta('name', 'author', copy.name),
    meta(
      'name',
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1',
    ),
    link('canonical', pageUrl),
    ...buildAlternates(),
    ...buildFontPreloads(locale),
    `<meta name="theme-color" content="${THEME_COLORS.dark}" media="(prefers-color-scheme: dark)" />`,
    `<meta name="theme-color" content="${THEME_COLORS.light}" media="(prefers-color-scheme: light)" />`,
    meta('property', 'og:type', 'profile'),
    meta('property', 'og:site_name', copy.name),
    meta('property', 'og:locale', seo.ogLocale),
    meta(
      'property',
      'og:locale:alternate',
      getSeoCopy(alternateLocale).ogLocale,
    ),
    meta('property', 'og:url', pageUrl),
    meta('property', 'og:title', seo.title),
    meta('property', 'og:description', seo.description),
    meta('property', 'og:image', imageUrl),
    meta('property', 'og:image:width', String(OG_IMAGE_WIDTH)),
    meta('property', 'og:image:height', String(OG_IMAGE_HEIGHT)),
    meta('property', 'og:image:alt', seo.imageAlt),
    meta('property', 'profile:first_name', seo.firstName),
    meta('property', 'profile:last_name', seo.lastName),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', seo.title),
    meta('name', 'twitter:description', seo.description),
    meta('name', 'twitter:image', imageUrl),
    meta('name', 'twitter:image:alt', seo.imageAlt),
    `<script type="application/ld+json">${escapeJsonLd(
      JSON.stringify(buildJsonLd(locale)),
    )}</script>`,
  ];

  return tags.join('\n    ');
};

const SITEMAP_HEADER =
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

/**
 * Каждая запись перечисляет все языковые версии — так Яндекс и Google
 * понимают, что это одна страница на двух языках, а не дубль.
 */
export const buildSitemap = (lastmod: string): string => {
  const alternates = [
    ...LOCALES.map(
      (locale) =>
        `    <xhtml:link rel="alternate" hreflang="${locale}" href="${absoluteUrl(LOCALE_PATHS[locale])}" />`,
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(LOCALE_PATHS[DEFAULT_LOCALE])}" />`,
  ].join('\n');

  const entries = LOCALES.map((locale) =>
    [
      '  <url>',
      `    <loc>${absoluteUrl(LOCALE_PATHS[locale])}</loc>`,
      alternates,
      `    <lastmod>${lastmod}</lastmod>`,
      '  </url>',
    ].join('\n'),
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n${SITEMAP_HEADER}\n${entries}\n</urlset>\n`;
};
