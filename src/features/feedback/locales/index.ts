import type { Locale } from '@/features/resume/types';

import type { FeedbackCopy } from '../types';
import { en } from './en';
import { ru } from './ru';

export const feedbackLocales: Record<Locale, FeedbackCopy> = {
  en,
  ru,
};

export function getFeedbackCopy(locale: Locale): FeedbackCopy {
  return feedbackLocales[locale];
}
