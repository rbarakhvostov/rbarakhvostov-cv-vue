import { describe, expect, it } from 'vitest';

import { en } from '../en';
import { ru } from '../ru';

describe('roleLine', () => {
  it('stays the same untranslated English string in both locales', () => {
    expect(ru.roleLine).toBe(en.roleLine);
  });
});
