import { describe, expect, it } from 'vitest';

import { splitHighlightedNumbers } from '../splitHighlightedNumbers';

describe('splitHighlightedNumbers', () => {
  it('marks percent values and keeps surrounding text', () => {
    expect(
      splitHighlightedNumbers(
        'reducing operational overhead by over 50% and accelerating',
      ),
    ).toEqual([
      { text: 'reducing operational overhead by over ', isHighlighted: false },
      { text: '50%', isHighlighted: true },
      { text: ' and accelerating', isHighlighted: false },
    ]);
  });

  it('highlights every percent in a string', () => {
    expect(splitHighlightedNumbers('up 50% and then 80%')).toEqual([
      { text: 'up ', isHighlighted: false },
      { text: '50%', isHighlighted: true },
      { text: ' and then ', isHighlighted: false },
      { text: '80%', isHighlighted: true },
    ]);
  });

  it('returns a single plain part when there is no number', () => {
    expect(
      splitHighlightedNumbers(
        'Developed and discussed applications architecture',
      ),
    ).toEqual([
      {
        text: 'Developed and discussed applications architecture',
        isHighlighted: false,
      },
    ]);
  });

  it('highlights a bare number without a percent sign', () => {
    expect(splitHighlightedNumbers('more than 100 teachers')).toEqual([
      { text: 'more than ', isHighlighted: false },
      { text: '100', isHighlighted: true },
      { text: ' teachers', isHighlighted: false },
    ]);
  });

  it('works with Russian copy', () => {
    expect(
      splitHighlightedNumbers(
        'повысить удовлетворенность пользователей на 80%',
      ),
    ).toEqual([
      {
        text: 'повысить удовлетворенность пользователей на ',
        isHighlighted: false,
      },
      { text: '80%', isHighlighted: true },
    ]);
  });
});
