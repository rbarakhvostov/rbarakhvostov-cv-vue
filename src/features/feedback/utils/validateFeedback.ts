import type { FeedbackFieldErrors } from '../types';

export const validateFeedback = (
  name: string,
  message: string,
): FeedbackFieldErrors => {
  return {
    name: name.trim().length === 0,
    message: message.trim().length === 0,
  };
};

export const hasFeedbackErrors = (errors: FeedbackFieldErrors): boolean => {
  return errors.name || errors.message;
};
