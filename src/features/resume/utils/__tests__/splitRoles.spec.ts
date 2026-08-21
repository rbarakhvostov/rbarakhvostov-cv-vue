import { describe, expect, it } from 'vitest';

import { splitRoles } from '../splitRoles';

describe('splitRoles', () => {
  it('splits on pipe, trims parts, and marks separators after the first', () => {
    expect(
      splitRoles('Software Engineer | Frontend Developer | React'),
    ).toEqual([
      { text: 'Software Engineer', showSep: false },
      { text: 'Frontend Developer', showSep: true },
      { text: 'React', showSep: true },
    ]);
  });

  it('returns a single part without a separator', () => {
    expect(splitRoles('Engineer')).toEqual([
      { text: 'Engineer', showSep: false },
    ]);
  });

  it('keeps empty parts after trim', () => {
    expect(splitRoles('Lead |  | Vue')).toEqual([
      { text: 'Lead', showSep: false },
      { text: '', showSep: true },
      { text: 'Vue', showSep: true },
    ]);
  });
});
