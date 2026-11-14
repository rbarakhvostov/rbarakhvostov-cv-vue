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
    // Звёздочка декоративна — обязательность несёт required.
    const markers = wrapper.findAll('.feedback__required');
    expect(markers).toHaveLength(2);
    markers.forEach((marker) => {
      expect(marker.attributes('aria-hidden')).toBe('true');
    });

    expect(wrapper.find('#feedback-name').attributes('required')).toBeDefined();
    expect(
      wrapper.find('#feedback-message').attributes('required'),
    ).toBeDefined();
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

  // Валидация не поднимает тост, а ошибки не в live-region: без переноса
  // фокуса сабмит пустой формы для скринридера прошёл бы беззвучно.
  it('moves focus to the first invalid field on submit', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const wrapper = mountForm();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const nameInput = wrapper.find('#feedback-name').element;
    expect(document.activeElement).toBe(nameInput);
    expect(wrapper.find('#feedback-name').attributes('aria-invalid')).toBe(
      'true',
    );
    expect(wrapper.find('#feedback-name').attributes('aria-describedby')).toBe(
      'feedback-name-error',
    );

    wrapper.unmount();
  });

  it('skips a valid field and focuses the next invalid one', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const wrapper = mountForm();

    await wrapper.find('#feedback-name').setValue('Ada Lovelace');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(document.activeElement).toBe(
      wrapper.find('#feedback-message').element,
    );

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
    // Тост живёт внутри формы, поэтому из печати его убирает собственный
    // data-print-hide, а не телепорт за пределы секции.
    expect(
      wrapper.find('.feedback-toast-layer').attributes('data-print-hide'),
    ).toBeDefined();

    wrapper.unmount();
  });

  // Регрессия, которую не ловил ни один тест: пока тост телепортировался в
  // <body>, в собранной странице он оказывался ПЕРЕД #app, и от Send до его
  // mailto-ссылки было ~19 Shift+Tab назад через всю страницу.
  it('places the toast after the submit button in DOM order', async () => {
    stubSubmitResponse({ success: false, message: 'bad key' });

    const wrapper = mountForm();
    await fillAndSubmit(wrapper);

    const submit = wrapper.find('button[type="submit"]').element;
    const toast = findToast();

    expect(toast).not.toBeNull();
    expect(
      submit.compareDocumentPosition(toast as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

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
