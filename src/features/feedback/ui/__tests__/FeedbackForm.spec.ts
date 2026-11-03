import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import FeedbackForm from '../FeedbackForm.vue';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('FeedbackForm', () => {
  it('renders labeled fields with required markers and a send button', () => {
    const wrapper = mount(FeedbackForm);

    expect(wrapper.find('label[for="feedback-name"]').text()).toContain('Name');
    expect(wrapper.find('label[for="feedback-message"]').text()).toContain(
      'Message',
    );
    expect(wrapper.findAll('.feedback__required')).toHaveLength(2);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Send');
  });

  it('shows validation errors and does not call fetch when submitted empty', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const wrapper = mount(FeedbackForm);

    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Please enter your name.');
    expect(wrapper.text()).toContain('Please enter a message.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows a success message after a successful submit', async () => {
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'ok' }),
      }),
    );

    const wrapper = mount(FeedbackForm);
    await wrapper.find('#feedback-name').setValue('Ada Lovelace');
    await wrapper.find('#feedback-message').setValue('Hello there');
    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain('Thanks! Your message has been sent.');
  });

  it('shows an error message with a mailto fallback link on server failure', async () => {
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, message: 'bad key' }),
      }),
    );

    const wrapper = mount(FeedbackForm);
    await wrapper.find('#feedback-name').setValue('Ada Lovelace');
    await wrapper.find('#feedback-message').setValue('Hello there');
    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const fallback = wrapper.find('.feedback__status--error a');
    expect(fallback.exists()).toBe(true);
    expect(fallback.attributes('href')).toBe('mailto:rbarakhvostov@gmail.com');
  });
});
