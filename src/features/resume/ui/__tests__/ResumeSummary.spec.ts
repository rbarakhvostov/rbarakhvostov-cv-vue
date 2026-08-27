import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { en } from '../../locales/en';
import { ru } from '../../locales/ru';
import ResumeSummary from '../ResumeSummary.vue';

describe('ResumeSummary', () => {
  it('highlights the title and years in English and Russian summaries', () => {
    const enWrapper = mount(ResumeSummary, { props: { summary: en.summary } });
    const ruWrapper = mount(ResumeSummary, { props: { summary: ru.summary } });

    expect(
      enWrapper.findAll('.summary__highlight').map((node) => node.text()),
    ).toEqual(['Senior Frontend Developer', '6 years']);
    expect(
      ruWrapper.findAll('.summary__highlight').map((node) => node.text()),
    ).toEqual(['Senior Frontend-разработчик', '6-летним']);
  });
});
