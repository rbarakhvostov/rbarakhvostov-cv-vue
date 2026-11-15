import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { en } from '../../locales/en';
import { ru } from '../../locales/ru';
import type { JobMeta, ResumeCopy } from '../../types';
import ExperienceItem from '../ExperienceItem.vue';

const job: JobMeta = {
  id: 'alfa',
  company: 'Alfa-Bank',
  period: '2025 -',
  urls: [{ href: 'https://www.alfabank.by', label: 'https://www.alfabank.by' }],
  roleKey: 'roleReactNext',
};

const mountItem = (copy: ResumeCopy = en) => {
  return mount(ExperienceItem, {
    props: {
      job,
      roleLine: copy.roleReactNext,
      bullets: copy.jobs.alfa,
      newTabHint: copy.newTabHint,
    },
  });
};

describe('ExperienceItem', () => {
  it('highlights percents in English and Russian job bullets', () => {
    const enWrapper = mountItem(en);
    const ruWrapper = mountItem(ru);

    expect(
      enWrapper.findAll('.job__number').map((node) => node.text()),
    ).toEqual(['50%', '80%', '50%']);
    expect(
      ruWrapper.findAll('.job__number').map((node) => node.text()),
    ).toEqual(['50%', '80%', '50%']);

    enWrapper.unmount();
    ruWrapper.unmount();
  });

  it('names the article by its company heading', () => {
    const wrapper = mountItem();

    const labelledBy = wrapper.get('article').attributes('aria-labelledby');

    expect(labelledBy).toBe('job-alfa-heading');
    expect(wrapper.get(`#${labelledBy}`).text()).toBe('Alfa-Bank');

    wrapper.unmount();
  });

  it('keeps list semantics for bullets and job urls', () => {
    const wrapper = mountItem();

    expect(wrapper.get('.job__bullets').attributes('role')).toBe('list');
    expect(wrapper.get('.job__urls').attributes('role')).toBe('list');
    expect(wrapper.findAll('.job__urls li a')).toHaveLength(job.urls.length);

    wrapper.unmount();
  });

  it('warns in the accessible name that company links open a new tab', () => {
    const wrapper = mountItem(ru);
    const link = wrapper.get('.job__urls li a');

    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toContain('noopener');
    expect(link.get('.visually-hidden').text()).toBe(ru.newTabHint);

    wrapper.unmount();
  });
});
