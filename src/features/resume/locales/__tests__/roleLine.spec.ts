import { describe, expect, it } from 'vitest';

import { en } from '../en';
import { ru } from '../ru';

describe('roleLine', () => {
  // RoleLine.vue помечает строку статичным lang="en" на том основании, что она
  // не переводится. Если её однажды переведут, атрибут из исправления WCAG
  // 3.1.2 превратится в нарушение: русский текст, объявленный английским.
  it('stays the same untranslated English string in both locales', () => {
    expect(ru.roleLine).toBe(en.roleLine);
  });
});
