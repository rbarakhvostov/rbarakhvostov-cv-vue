import { describe, expect, it } from 'vitest';

import { escapeHtml, escapeJsonLd } from '../escapeHtml';

describe('escapeHtml', () => {
  it('escapes the characters that would break out of an attribute', () => {
    expect(escapeHtml(`<a href="x">O'Neil & co</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;O&#39;Neil &amp; co&lt;/a&gt;',
    );
  });

  it('leaves ordinary text, including cyrillic, untouched', () => {
    expect(escapeHtml('Роман Барахвостов — Senior Frontend')).toBe(
      'Роман Барахвостов — Senior Frontend',
    );
  });
});

describe('escapeJsonLd', () => {
  it('neutralises a closing script tag inside the payload', () => {
    const json = JSON.stringify({ name: '</script><img onerror=alert(1)>' });

    expect(escapeJsonLd(json)).not.toContain('</script>');
    expect(JSON.parse(escapeJsonLd(json))).toEqual(JSON.parse(json));
  });
});
