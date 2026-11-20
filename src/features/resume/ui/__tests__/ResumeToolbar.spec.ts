import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ResumeToolbar from '../ResumeToolbar.vue';

describe('ResumeToolbar', () => {
  it('paints only the theme toggle from the document theme', () => {
    const wrapper = mount(ResumeToolbar);
    const [langToggle, themeToggle] = wrapper.findAll('.segmented');

    // Локаль известна серверу, поэтому языковому переключателю проп не нужен.
    expect(langToggle?.classes()).not.toContain('segmented--theme');
    expect(themeToggle?.classes()).toContain('segmented--theme');

    expect(
      themeToggle
        ?.findAll('button')
        .map((button) => button.attributes('data-value')),
    ).toEqual(['light', 'dark']);

    wrapper.unmount();
  });
});
