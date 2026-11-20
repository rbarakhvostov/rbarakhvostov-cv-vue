import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import SegmentedToggle from '../SegmentedToggle.vue';

const options = [
  { value: 'en', label: 'EN', ariaLabel: 'English' },
  { value: 'ru', label: 'RU', ariaLabel: 'Русский' },
] as const;

const linkOptions = [
  { value: 'en', label: 'EN', href: '/' },
  { value: 'ru', label: 'RU', href: '/ru/' },
] as const;

const source = readFileSync(
  resolve(process.cwd(), 'src/components/SegmentedToggle.vue'),
  'utf8',
);

// Пробелы схлопнуты, чтобы тест пережил переносы, которые расставляет Prettier.
const style = source
  .slice(source.indexOf('<style scoped>'), source.indexOf('</style>'))
  .replace(/\s+/g, ' ');

describe('SegmentedToggle', () => {
  it('marks the selected option and emits the next value on click', async () => {
    const wrapper = mount(SegmentedToggle, {
      props: {
        modelValue: 'en',
        options,
        label: 'Language',
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

  it('renders options with an href as links and leaves the model alone', async () => {
    const wrapper = mount(SegmentedToggle, {
      props: {
        modelValue: 'en',
        label: 'Language',
        options: linkOptions,
      },
    });

    expect(wrapper.findAll('button')).toHaveLength(0);

    const links = wrapper.findAll('a');
    const [first, second] = links;

    expect(links).toHaveLength(2);
    expect(first?.attributes('href')).toBe('/');
    expect(first?.attributes('hreflang')).toBe('en');
    expect(first?.attributes('aria-current')).toBe('page');
    expect(first?.classes()).toContain('is-on');

    expect(first?.attributes('aria-pressed')).toBeUndefined();
    expect(second?.attributes('href')).toBe('/ru/');
    expect(second?.attributes('aria-current')).toBeUndefined();

    const swallowNavigation = (event: Event): void => {
      event.preventDefault();
    };

    second?.element.addEventListener('click', swallowNavigation);
    await second?.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();

    expect(wrapper.emitted('select')?.[0]).toEqual(['ru']);
  });

  it('marks exactly one segment as selected', async () => {
    const wrapper = mount(SegmentedToggle, {
      props: { modelValue: 'en', options, label: 'Language' },
    });

    expect(wrapper.findAll('.is-on')).toHaveLength(1);
    expect(wrapper.findAll('button')[0]?.classes()).toContain('is-on');

    await wrapper.setProps({ modelValue: 'ru' });

    expect(wrapper.findAll('.is-on')).toHaveLength(1);
    expect(wrapper.findAll('button')[1]?.classes()).toContain('is-on');

    wrapper.unmount();
  });

  it('names the group so that role="group" is not announced blank', () => {
    const wrapper = mount(SegmentedToggle, {
      props: { modelValue: 'en', options, label: 'Language' },
    });

    const group = wrapper.get('[role="group"]');

    expect(group.attributes('aria-label')).toBe('Language');

    wrapper.unmount();
  });

  it('reports a select for button options too', async () => {
    const wrapper = mount(SegmentedToggle, {
      props: { modelValue: 'en', options, label: 'Language' },
    });

    await wrapper.findAll('button')[1]?.trigger('click');

    expect(wrapper.emitted('select')?.[0]).toEqual(['ru']);
  });

  it('exposes the option value as data-value on buttons and links', () => {
    const buttons = mount(SegmentedToggle, {
      props: { modelValue: 'en', options, label: 'Language' },
    });

    expect(
      buttons
        .findAll('button')
        .map((button) => button.attributes('data-value')),
    ).toEqual(['en', 'ru']);

    const links = mount(SegmentedToggle, {
      props: { modelValue: 'en', options: linkOptions, label: 'Language' },
    });

    expect(
      links.findAll('a').map((link) => link.attributes('data-value')),
    ).toEqual(['en', 'ru']);
  });

  it('marks the group for document-theme painting only when asked', async () => {
    const wrapper = mount(SegmentedToggle, {
      props: { modelValue: 'en', options, label: 'Language' },
    });

    expect(wrapper.get('.segmented').classes()).not.toContain(
      'segmented--theme',
    );

    await wrapper.setProps({ paintFromDocumentTheme: true });

    expect(wrapper.get('.segmented').classes()).toContain('segmented--theme');
  });
});

// jsdom не резолвит var() в getComputedStyle, поэтому каскад проверяется по
// исходнику — как в tokens.spec.ts.
describe('SegmentedToggle selected styling', () => {
  // `.is-on` приходит из пререндера всегда на «тёмной», поэтому красить по нему
  // переключатель темы нельзя: первый кадр подсветил бы не тот сегмент.
  const unguarded =
    /(?<!\.segmented:not\(\.segmented--theme\) )\.segmented__btn\.is-on/;

  it('paints the theme toggle from html[data-theme], not from .is-on', () => {
    expect(style).toContain(
      "html[data-theme='light'] .segmented--theme .segmented__btn[data-value='light']",
    );
    expect(style).toContain(
      "html[data-theme='dark'] .segmented--theme .segmented__btn[data-value='dark']",
    );
    expect(unguarded.test(style)).toBe(false);
  });

  it('keeps the forced-colors outline on the same selectors', () => {
    const forcedColors = style.slice(style.indexOf('@media (forced-colors'));

    expect(forcedColors).toContain(
      "html[data-theme='light'] .segmented--theme .segmented__btn[data-value='light']",
    );
    expect(forcedColors).toContain(
      "html[data-theme='dark'] .segmented--theme .segmented__btn[data-value='dark']",
    );
    expect(forcedColors).toContain('border: 2px solid Highlight');
  });
});
