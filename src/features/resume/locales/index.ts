import type { Locale, ResumeCopy } from '../types';
import { en } from './en';
import { ru } from './ru';

export const locales: Record<Locale, ResumeCopy> = {
  en,
  ru,
};

export const getResumeCopy = (locale: Locale): ResumeCopy => {
  return locales[locale];
};
