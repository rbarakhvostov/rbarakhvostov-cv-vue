import { describe, expect, it } from 'vitest';

import { splitPercents } from '../splitPercents';

describe('splitPercents', () => {
  it('marks percent values and keeps surrounding text', () => {
    expect(
      splitPercents(
        'reducing operational overhead by over 50% and accelerating',
      ),
    ).toEqual([
      { text: 'reducing operational overhead by over ', isPercent: false },
      { text: '50%', isPercent: true },
      { text: ' and accelerating', isPercent: false },
    ]);
  });

  it('highlights every percent in a string', () => {
    expect(splitPercents('up 50% and then 80%')).toEqual([
      { text: 'up ', isPercent: false },
      { text: '50%', isPercent: true },
      { text: ' and then ', isPercent: false },
      { text: '80%', isPercent: true },
    ]);
  });

  it('returns a single plain part when there is no percent', () => {
    expect(
      splitPercents('Developed and discussed applications architecture'),
    ).toEqual([
      {
        text: 'Developed and discussed applications architecture',
        isPercent: false,
      },
    ]);
  });

  it('does not highlight a bare number without a percent sign', () => {
    expect(splitPercents('more than 100 teachers')).toEqual([
      { text: 'more than 100 teachers', isPercent: false },
    ]);
  });

  it('works with Russian copy', () => {
    expect(
      splitPercents('повысить удовлетворенность пользователей на 80%'),
    ).toEqual([
      {
        text: 'повысить удовлетворенность пользователей на ',
        isPercent: false,
      },
      { text: '80%', isPercent: true },
    ]);
  });
});
