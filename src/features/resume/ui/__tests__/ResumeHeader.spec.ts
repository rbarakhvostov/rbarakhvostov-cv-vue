import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { contacts } from '../../data/contacts';
import { en } from '../../locales/en';
import ResumeHeader from '../ResumeHeader.vue';

const mountHeader = () => {
  return mount(ResumeHeader, {
    props: { name: en.name, roleLine: en.roleLine },
  });
};

describe('ResumeHeader', () => {
  it('renders contacts as a list', () => {
    const wrapper = mountHeader();
    const list = wrapper.get('.header__contacts');

    expect(list.element.tagName).toBe('UL');
    expect(list.attributes('role')).toBe('list');

    const links = wrapper.findAll('.header__contacts li > a');
    expect(links).toHaveLength(contacts.length);
    expect(links.map((link) => link.attributes('href'))).toEqual(
      contacts.map((contact) => contact.href),
    );

    wrapper.unmount();
  });

  it('leaves no separator glyph for a screen reader to read out', () => {
    const wrapper = mountHeader();

    expect(wrapper.get('.header__contacts').text()).not.toContain('|');

    wrapper.unmount();
  });

  it('tags the untranslated English role line with lang="en"', () => {
    const wrapper = mountHeader();

    expect(wrapper.get('.role-line').attributes('lang')).toBe('en');

    wrapper.unmount();
  });
});
