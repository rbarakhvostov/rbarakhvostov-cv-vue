import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { en } from '../../locales/en';
import { ru } from '../../locales/ru';
import type { JobMeta } from '../../types';
import ExperienceItem from '../ExperienceItem.vue';

const job: JobMeta = {
  id: 'alfa',
  company: 'Alfa-Bank',
  period: '2025 -',
  urls: [{ href: 'https://www.alfabank.by', label: 'https://www.alfabank.by' }],
  roleKey: 'roleReactNext',
};

describe('ExperienceItem', () => {
  it('highlights percents in English and Russian job bullets', () => {
    const enWrapper = mount(ExperienceItem, {
      props: { job, roleLine: en.roleReactNext, bullets: en.jobs.alfa },
    });
    const ruWrapper = mount(ExperienceItem, {
      props: { job, roleLine: ru.roleReactNext, bullets: ru.jobs.alfa },
    });

    expect(
      enWrapper.findAll('.job__number').map((node) => node.text()),
    ).toEqual(['50%', '80%', '50%']);
    expect(
      ruWrapper.findAll('.job__number').map((node) => node.text()),
    ).toEqual(['50%', '80%', '50%']);
  });

  it('names the article by its company heading', () => {
    const wrapper = mount(ExperienceItem, {
      props: { job, roleLine: en.roleReactNext, bullets: en.jobs.alfa },
    });

    const labelledBy = wrapper.get('article').attributes('aria-labelledby');

    expect(labelledBy).toBe('job-alfa-heading');
    expect(wrapper.get(`#${labelledBy}`).text()).toBe('Alfa-Bank');

    wrapper.unmount();
  });

  it('keeps list semantics for bullets and job urls', () => {
    const wrapper = mount(ExperienceItem, {
      props: { job, roleLine: en.roleReactNext, bullets: en.jobs.alfa },
    });

    expect(wrapper.get('.job__bullets').attributes('role')).toBe('list');
    expect(wrapper.get('.job__urls').attributes('role')).toBe('list');
    expect(wrapper.findAll('.job__urls li a')).toHaveLength(job.urls.length);

    wrapper.unmount();
  });
});
