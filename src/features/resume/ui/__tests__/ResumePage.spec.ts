import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { en } from '../../locales/en';
import ResumePage from '../ResumePage.vue';

describe('ResumePage', () => {
  it('opens with a skip link pointing at <main>', () => {
    const wrapper = mount(ResumePage);
    const skipLink = wrapper.get('.skip-link');

    expect(skipLink.text()).toBe(en.skipToContent);
    expect(skipLink.attributes('href')).toBe('#main');

    const main = wrapper.get('main');
    expect(main.attributes('id')).toBe('main');

    // Без tabindex Safari переносит по якорю прокрутку, но не фокус.
    expect(main.attributes('tabindex')).toBe('-1');

    wrapper.unmount();
  });

  it('puts the skip link ahead of everything else in the tab order', () => {
    const wrapper = mount(ResumePage);
    const focusable = wrapper.findAll('a, button, input, textarea');

    expect(focusable[0]?.classes()).toContain('skip-link');

    wrapper.unmount();
  });

  // Тулбар лежит вне <main>, поэтому без собственного лендмарка он выпадал
  // из навигации по лендмаркам целиком.
  it('exposes the toolbar as a banner landmark outside <main>', () => {
    const wrapper = mount(ResumePage);
    const toolbar = wrapper.get('.toolbar');

    expect(toolbar.element.tagName).toBe('HEADER');
    expect(wrapper.get('main').element.contains(toolbar.element)).toBe(false);

    wrapper.unmount();
  });
});
