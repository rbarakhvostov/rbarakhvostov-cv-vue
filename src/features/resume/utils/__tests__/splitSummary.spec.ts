import { describe, expect, it } from 'vitest';

import { splitSummary } from '../splitSummary';

describe('splitSummary', () => {
  it('highlights the English title, years, and links RS School', () => {
    expect(
      splitSummary(
        'Experienced Senior Frontend Developer with over 6 years and RS School',
      ),
    ).toEqual([
      { kind: 'text', text: 'Experienced ' },
      { kind: 'highlight', text: 'Senior Frontend Developer' },
      { kind: 'text', text: ' with over ' },
      { kind: 'highlight', text: '6 years' },
      { kind: 'text', text: ' and ' },
      { kind: 'link', text: 'RS School' },
    ]);
  });

  it('highlights the Russian title, years, and links RS School', () => {
    expect(
      splitSummary(
        'Опытный Senior Frontend-разработчик с 6-летним стажем в RS School.',
      ),
    ).toEqual([
      { kind: 'text', text: 'Опытный ' },
      { kind: 'highlight', text: 'Senior Frontend-разработчик' },
      { kind: 'text', text: ' с ' },
      { kind: 'highlight', text: '6-летним' },
      { kind: 'text', text: ' стажем в ' },
      { kind: 'link', text: 'RS School' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('returns a single text part when nothing is marked', () => {
    expect(splitSummary('Plain summary without marks')).toEqual([
      { kind: 'text', text: 'Plain summary without marks' },
    ]);
  });

  it('returns an empty list for an empty string', () => {
    expect(splitSummary('')).toEqual([]);
  });
});
