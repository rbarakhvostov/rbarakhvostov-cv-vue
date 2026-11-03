import type { FeedbackFieldErrors } from '../types';

export function validateFeedback(
  name: string,
  message: string,
): FeedbackFieldErrors {
  return {
    name: name.trim().length === 0,
    message: message.trim().length === 0,
  };
}

export function hasFeedbackErrors(errors: FeedbackFieldErrors): boolean {
  return errors.name || errors.message;
}
