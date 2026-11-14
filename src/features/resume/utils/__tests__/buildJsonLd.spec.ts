import { describe, expect, it } from 'vitest';

import { contacts } from '../../data/contacts';
import { jobs } from '../../data/jobs';
import { skills } from '../../data/skills';
import { getResumeCopy } from '../../locales';
import { buildJsonLd, type JsonLdNode } from '../buildJsonLd';

const findNode = (locale: 'en' | 'ru', type: string): JsonLdNode => {
  const node = buildJsonLd(locale)['@graph'].find(
    (item) => item['@type'] === type,
  );

  if (!node) {
    throw new Error(`No ${type} node in the graph.`);
  }

  return node;
};

describe('buildJsonLd', () => {
  it('describes a ProfilePage, a Person and a WebSite', () => {
    const types = buildJsonLd('en')['@graph'].map((node) => node['@type']);

    expect(types).toEqual(['ProfilePage', 'Person', 'WebSite']);
  });

  it('mirrors the visible copy so the markup cannot drift from the page', () => {
    const person = findNode('ru', 'Person');
    const copy = getResumeCopy('ru');

    expect(person.name).toBe(copy.name);
    expect(person.jobTitle).toBe(copy.roleLine);
    expect(person.description).toBe(copy.summary);
  });

  // Именно alternateName связывает «Roman Barakhvostov» и «Роман Барахвостов».
  it('cross-links the two spellings of the name', () => {
    expect(findNode('en', 'Person').alternateName).toBe(
      getResumeCopy('ru').name,
    );
    expect(findNode('ru', 'Person').alternateName).toBe(
      getResumeCopy('en').name,
    );
  });

  it('lists every skill', () => {
    expect(findNode('en', 'Person').knowsAbout).toEqual([...skills]);
  });

  it('splits contacts into email and sameAs profiles', () => {
    const person = findNode('en', 'Person');
    const profiles = contacts
      .filter((contact) => !contact.href.startsWith('mailto:'))
      .map((contact) => contact.href);

    expect(person.email).toBe('rbarakhvostov@gmail.com');
    expect(person.sameAs).toEqual(profiles);
    expect(profiles.some((href) => href.startsWith('mailto:'))).toBe(false);
  });

  it('takes worksFor from the most recent job', () => {
    const current = jobs[0];

    expect(findNode('en', 'Person').worksFor).toEqual({
      '@type': 'Organization',
      name: current?.company,
      url: current?.urls[0]?.href,
    });
  });

  it('points the ProfilePage at the locale URL', () => {
    expect(findNode('ru', 'ProfilePage').url).toBe(
      'https://roman-barakhvostov-cv.netlify.app/ru/',
    );
    expect(findNode('en', 'ProfilePage').url).toBe(
      'https://roman-barakhvostov-cv.netlify.app/',
    );
  });
});
