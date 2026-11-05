import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import FeedbackForm from '../FeedbackForm.vue';

// The toast teleports into <body>, so it lives outside the wrapper's tree.
const findToast = (): HTMLElement | null => {
  return document.body.querySelector('.feedback-toast');
};

const mountForm = () => {
  return mount(FeedbackForm, { attachTo: document.body });
};

const fillAndSubmit = async (
  wrapper: ReturnType<typeof mountForm>,
): Promise<void> => {
  await wrapper.find('#feedback-name').setValue('Ada Lovelace');
  await wrapper.find('#feedback-message').setValue('Hello there');
  await wrapper.find('form').trigger('submit');
  await flushPromises();
};

const stubSubmitResponse = (body: {
  success: boolean;
  message: string;
}): void => {
  vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', 'test-key');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(body),
    }),
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  document.body.innerHTML = '';
});

describe('FeedbackForm', () => {
  it('renders labeled fields with required markers and a send button', () => {
    const wrapper = mountForm();

    expect(wrapper.find('label[for="feedback-name"]').text()).toContain('Name');
    expect(wrapper.find('label[for="feedback-message"]').text()).toContain(
      'Message',
    );
    expect(wrapper.findAll('.feedback__required')).toHaveLength(2);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Send');

    wrapper.unmount();
  });

  it('shows inline validation errors without a toast when submitted empty', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const wrapper = mountForm();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Please enter your name.');
    expect(wrapper.text()).toContain('Please enter a message.');
    expect(fetch).not.toHaveBeenCalled();
    expect(findToast()).toBeNull();

    wrapper.unmount();
  });

  it('shows a success toast after a successful submit', async () => {
    stubSubmitResponse({ success: true, message: 'ok' });

    const wrapper = mountForm();
    await fillAndSubmit(wrapper);

    const toast = findToast();
    expect(toast).not.toBeNull();
    expect(toast?.classList.contains('feedback-toast--success')).toBe(true);
    expect(toast?.textContent).toContain('Thanks! Your message has been sent.');
    // The toast must escape the form's data-print-hide subtree.
    expect(wrapper.text()).not.toContain('Thanks! Your message has been sent.');

    wrapper.unmount();
  });

  it('closes the toast and returns focus to Send when × is clicked', async () => {
    stubSubmitResponse({ success: true, message: 'ok' });

    const wrapper = mountForm();
    await fillAndSubmit(wrapper);

    document.body
      .querySelector<HTMLButtonElement>('.feedback-toast__close')
      ?.click();
    await flushPromises();

    expect(findToast()).toBeNull();
    expect(document.activeElement).toBe(
      wrapper.find('button[type="submit"]').element,
    );

    wrapper.unmount();
  });

  it('shows an error toast with a mailto fallback link on server failure', async () => {
    stubSubmitResponse({ success: false, message: 'bad key' });

    const wrapper = mountForm();
    await fillAndSubmit(wrapper);

    const toast = findToast();
    expect(toast?.classList.contains('feedback-toast--error')).toBe(true);

    const fallback = toast?.querySelector('a');
    expect(fallback?.getAttribute('href')).toBe(
      'mailto:rbarakhvostov@gmail.com',
    );

    wrapper.unmount();
  });
});
