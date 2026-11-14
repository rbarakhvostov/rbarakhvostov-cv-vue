import type { Locale, SeoCopy } from '../types';

/**
 * Единственное место, где живёт продакшн-домен: сюда смотрят canonical,
 * hreflang, Open Graph, JSON-LD и sitemap. Переезд на свой домен — одна строка.
 */
export const SITE_URL = 'https://roman-barakhvostov-cv.netlify.app';

export const OG_IMAGE_PATH = '/og-image.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Порядок важен: в этом же порядке пререндер обходит страницы и пишет sitemap. */
export const LOCALES = ['en', 'ru'] as const satisfies readonly Locale[];

/** Каждая локаль — отдельный проиндексированный URL, иначе hreflang не на что навесить. */
export const LOCALE_PATHS = {
  en: '/',
  ru: '/ru/',
} as const satisfies Record<Locale, string>;

/** `x-default` указывает на версию для всех прочих языков. */
export const DEFAULT_LOCALE: Locale = 'en';

export const absoluteUrl = (path: string): string => `${SITE_URL}${path}`;

export const seoCopy = {
  en: {
    title: 'Roman Barakhvostov — Senior Frontend Developer (React, Next.js)',
    description:
      'Senior Frontend Developer with 6+ years building production UIs in React, Next.js, TypeScript and Vue. Experience at Alfa-Bank, Senla, GP Solutions and EPAM.',
    ogLocale: 'en_US',
    imageAlt: 'Roman Barakhvostov — Senior Frontend Developer',
    firstName: 'Roman',
    lastName: 'Barakhvostov',
  },
  ru: {
    title: 'Роман Барахвостов — Senior Frontend-разработчик (React, Next.js)',
    description:
      'Senior Frontend-разработчик, более 6 лет в продакшене: React, Next.js, TypeScript, Vue. Опыт работы в Альфа-Банке, Senla, GP Solutions и EPAM. Резюме и контакты.',
    ogLocale: 'ru_RU',
    imageAlt: 'Роман Барахвостов — Senior Frontend-разработчик',
    firstName: 'Роман',
    lastName: 'Барахвостов',
  },
} as const satisfies Record<Locale, SeoCopy>;

export const getSeoCopy = (locale: Locale): SeoCopy => seoCopy[locale];
