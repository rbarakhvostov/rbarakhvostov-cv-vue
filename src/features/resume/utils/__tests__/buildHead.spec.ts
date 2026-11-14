import { describe, expect, it } from 'vitest';

import { getSeoCopy } from '../../data/seo';
import { buildHead, buildSitemap } from '../buildHead';

const SITE = 'https://roman-barakhvostov-cv.netlify.app';

describe('buildHead', () => {
  it('emits exactly one title, and it is the locale one', () => {
    const head = buildHead('ru');

    expect(head.match(/<title>/g)).toHaveLength(1);
    expect(head).toContain(`<title>${getSeoCopy('ru').title}</title>`);
  });

  it('points canonical at the locale URL', () => {
    expect(buildHead('en')).toContain(
      `<link rel="canonical" href="${SITE}/" />`,
    );
    expect(buildHead('ru')).toContain(
      `<link rel="canonical" href="${SITE}/ru/" />`,
    );
  });

  // Обе страницы перечисляют обе версии и x-default — иначе Google
  // считает связь односторонней и игнорирует её.
  it('declares the same three alternates on both pages', () => {
    for (const locale of ['en', 'ru'] as const) {
      const head = buildHead(locale);

      expect(head).toContain(`href="${SITE}/" hreflang="en"`);
      expect(head).toContain(`href="${SITE}/ru/" hreflang="ru"`);
      expect(head).toContain(`href="${SITE}/" hreflang="x-default"`);
    }
  });

  it('uses absolute og:image and og:url, as the spec requires', () => {
    const head = buildHead('ru');

    expect(head).toContain(
      `<meta property="og:image" content="${SITE}/og-image.png" />`,
    );
    expect(head).toContain(`<meta property="og:url" content="${SITE}/ru/" />`);
  });

  it('cross-declares the og locales', () => {
    expect(buildHead('en')).toContain(
      '<meta property="og:locale" content="en_US" />',
    );
    expect(buildHead('en')).toContain(
      '<meta property="og:locale:alternate" content="ru_RU" />',
    );
  });

  it('escapes the JSON-LD so it cannot close its own script tag', () => {
    const head = buildHead('en');
    const jsonLd = head.slice(head.indexOf('application/ld+json'));

    expect(jsonLd.match(/<\/script>/g)).toHaveLength(1);
  });

  it('keeps the description within what search engines display', () => {
    for (const locale of ['en', 'ru'] as const) {
      expect(getSeoCopy(locale).description.length).toBeLessThanOrEqual(165);
      expect(getSeoCopy(locale).description.length).toBeGreaterThan(120);
    }
  });
});

describe('buildSitemap', () => {
  it('lists both locales with their alternates', () => {
    const sitemap = buildSitemap('2026-11-09');

    expect(sitemap.match(/<url>/g)).toHaveLength(2);
    expect(sitemap).toContain(`<loc>${SITE}/</loc>`);
    expect(sitemap).toContain(`<loc>${SITE}/ru/</loc>`);
    expect(sitemap.match(/hreflang="x-default"/g)).toHaveLength(2);
    expect(sitemap).toContain('<lastmod>2026-11-09</lastmod>');
  });
});
