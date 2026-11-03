import { describe, expect, it } from 'vitest';

import { hasFeedbackErrors, validateFeedback } from '../validateFeedback';

describe('validateFeedback', () => {
  it('flags empty and whitespace-only fields as invalid', () => {
    expect(validateFeedback('', '')).toEqual({ name: true, message: true });
    expect(validateFeedback('   ', '   ')).toEqual({
      name: true,
      message: true,
    });
  });

  it('accepts trimmed non-empty fields', () => {
    expect(validateFeedback('Ada', 'Hi there')).toEqual({
      name: false,
      message: false,
    });
  });
});

describe('hasFeedbackErrors', () => {
  it('is true if any field is invalid', () => {
    expect(hasFeedbackErrors({ name: true, message: false })).toBe(true);
    expect(hasFeedbackErrors({ name: false, message: false })).toBe(false);
  });
});
