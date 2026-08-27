import type { PercentPart } from '../types';

const PERCENT_SPLIT = /(\d+%)/;
const PERCENT_VALUE = /^\d+%$/;

export function splitPercents(value: string): PercentPart[] {
  return value
    .split(PERCENT_SPLIT)
    .filter((text) => text.length > 0)
    .map((text) => ({
      text,
      isPercent: PERCENT_VALUE.test(text),
    }));
}
