import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import SegmentedToggle from '../SegmentedToggle.vue';

const options = [
  { value: 'en', label: 'EN', ariaLabel: 'English' },
  { value: 'ru', label: 'RU', ariaLabel: 'Русский' },
] as const;

describe('SegmentedToggle', () => {
  it('marks the selected option and emits the next value on click', async () => {
    const wrapper = mount(SegmentedToggle, {
      props: {
        modelValue: 'en',
        options,
        'onUpdate:modelValue': (value: string) => {
          void wrapper.setProps({ modelValue: value });
        },
      },
    });

    const buttons = wrapper.findAll('button');
    const first = buttons[0];
    const second = buttons[1];

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first?.attributes('aria-pressed')).toBe('true');
    expect(first?.classes()).toContain('is-on');
    expect(second?.attributes('aria-pressed')).toBe('false');

    await second?.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['ru']);
    expect(second?.attributes('aria-pressed')).toBe('true');
    expect(second?.classes()).toContain('is-on');
    expect(first?.attributes('aria-pressed')).toBe('false');
  });
});
