import type { NumberPart } from '../types';

const NUMBER_SPLIT = /(\d+%?)/;
const NUMBER_VALUE = /^\d+%?$/;

export const splitHighlightedNumbers = (value: string): NumberPart[] => {
  return value
    .split(NUMBER_SPLIT)
    .filter((text) => text.length > 0)
    .map((text) => ({
      text,
      isHighlighted: NUMBER_VALUE.test(text),
    }));
};
