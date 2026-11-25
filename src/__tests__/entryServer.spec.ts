import { describe, expect, it } from 'vitest';

import { renderSitemap } from '../entry-server';
import { CONTENT_UPDATED } from '../features/resume/data/seo';

describe('renderSitemap', () => {
  it('stamps the content date, not the build date', () => {
    const sitemap = renderSitemap();
    const dates = [...sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map(
      (match) => match[1],
    );

    expect(dates).toEqual([CONTENT_UPDATED, CONTENT_UPDATED]);
  });
});
