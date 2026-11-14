import { contacts } from '../data/contacts';
import { jobs } from '../data/jobs';
import {
  absoluteUrl,
  LOCALE_PATHS,
  OG_IMAGE_PATH,
  SITE_URL,
} from '../data/seo';
import { skills } from '../data/skills';
import { getResumeCopy } from '../locales';
import type { Locale } from '../types';

export type JsonLdNode = Record<string, unknown>;

export type JsonLdGraph = {
  '@context': 'https://schema.org';
  '@graph': readonly JsonLdNode[];
};

const MAILTO = 'mailto:';

const otherLocale = (locale: Locale): Locale => (locale === 'en' ? 'ru' : 'en');

const getEmail = (): string | null => {
  const contact = contacts.find((item) => item.href.startsWith(MAILTO));

  return contact ? contact.href.slice(MAILTO.length) : null;
};

/** Профили на других площадках — то, по чему поисковик склеивает личность. */
const getSameAs = (): readonly string[] => {
  return contacts
    .filter((contact) => !contact.href.startsWith(MAILTO))
    .map((contact) => contact.href);
};

const buildWorksFor = (): JsonLdNode | null => {
  const current = jobs[0];

  if (!current) {
    return null;
  }

  const url = current.urls[0]?.href;

  return {
    '@type': 'Organization',
    name: current.company,
    ...(url ? { url } : {}),
  };
};

/**
 * Схема собирается из тех же модулей, что и страница, поэтому не может
 * разъехаться с видимым содержимым — Google считает это спамом разметки.
 */
export const buildJsonLd = (locale: Locale): JsonLdGraph => {
  const copy = getResumeCopy(locale);
  const alternate = getResumeCopy(otherLocale(locale));
  const pageUrl = absoluteUrl(LOCALE_PATHS[locale]);
  const personId = `${SITE_URL}/#person`;
  const email = getEmail();
  const worksFor = buildWorksFor();

  const person: JsonLdNode = {
    '@type': 'Person',
    '@id': personId,
    name: copy.name,
    // Связывает «Roman Barakhvostov» и «Роман Барахвостов» как одно лицо.
    alternateName: alternate.name,
    jobTitle: copy.roleLine,
    description: copy.summary,
    url: pageUrl,
    image: absoluteUrl(OG_IMAGE_PATH),
    knowsAbout: [...skills],
    knowsLanguage: ['en', 'ru'],
    sameAs: getSameAs(),
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Frontend Developer',
      skills: skills.join(', '),
    },
    ...(email ? { email } : {}),
    ...(worksFor ? { worksFor } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${pageUrl}#profile`,
        url: pageUrl,
        name: copy.name,
        inLanguage: locale,
        mainEntity: { '@id': personId },
      },
      person,
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: copy.name,
        inLanguage: ['en', 'ru'],
        publisher: { '@id': personId },
      },
    ],
  };
};
