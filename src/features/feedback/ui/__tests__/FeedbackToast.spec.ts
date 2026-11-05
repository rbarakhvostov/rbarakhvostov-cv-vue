import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FeedbackToast as FeedbackToastPayload } from '../../types';
import FeedbackToast from '../FeedbackToast.vue';

const successToast: FeedbackToastPayload = {
  tone: 'success',
  message: 'Thanks! Your message has been sent.',
};

const errorToast: FeedbackToastPayload = {
  tone: 'error',
  message: 'Something went wrong sending your message.',
  link: { href: 'mailto:someone@example.com', label: 'someone@example.com' },
};

const mountToast = (toast: FeedbackToastPayload | null) => {
  return mount(FeedbackToast, {
    props: { toast, closeLabel: 'Dismiss notification' },
    attachTo: document.body,
  });
};

// The toast teleports into <body>, so VTU's wrapper queries cannot reach it.
const findToast = (): HTMLElement | null => {
  return document.body.querySelector('.feedback-toast');
};

const fire = (type: string): void => {
  findToast()?.dispatchEvent(new Event(type));
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('FeedbackToast', () => {
  it('renders nothing while there is no toast', () => {
    const wrapper = mountToast(null);

    expect(document.body.querySelector('.feedback-toast')).toBeNull();

    wrapper.unmount();
  });

  it('renders the message and the fallback link', async () => {
    const wrapper = mountToast(null);
    await wrapper.setProps({ toast: errorToast });

    const toast = document.body.querySelector('.feedback-toast');
    expect(toast?.textContent).toContain(errorToast.message);
    expect(toast?.querySelector('a')?.getAttribute('href')).toBe(
      'mailto:someone@example.com',
    );
    expect(toast?.querySelector('button')?.getAttribute('aria-label')).toBe(
      'Dismiss notification',
    );

    wrapper.unmount();
  });

  it('emits close — not dismiss — when the close button is clicked', async () => {
    const wrapper = mountToast(null);
    await wrapper.setProps({ toast: successToast });

    document.body
      .querySelector<HTMLButtonElement>('.feedback-toast__close')
      ?.click();

    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.emitted('dismiss')).toBeUndefined();

    wrapper.unmount();
  });

  it('auto-dismisses a success toast after its duration', async () => {
    const wrapper = mountToast(null);
    await wrapper.setProps({ toast: successToast });

    vi.advanceTimersByTime(4999);
    expect(wrapper.emitted('dismiss')).toBeUndefined();

    vi.advanceTimersByTime(1);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);

    wrapper.unmount();
  });

  it('keeps an error toast up longer than a success toast', async () => {
    const wrapper = mountToast(null);
    await wrapper.setProps({ toast: errorToast });

    vi.advanceTimersByTime(5000);
    expect(wrapper.emitted('dismiss')).toBeUndefined();

    vi.advanceTimersByTime(3000);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);

    wrapper.unmount();
  });

  it('pauses the timer while hovered and resumes on leave', async () => {
    const wrapper = mountToast(null);
    await wrapper.setProps({ toast: successToast });

    vi.advanceTimersByTime(3000);

    fire('mouseenter');
    vi.advanceTimersByTime(60000);
    expect(wrapper.emitted('dismiss')).toBeUndefined();

    fire('mouseleave');
    vi.advanceTimersByTime(1999);
    expect(wrapper.emitted('dismiss')).toBeUndefined();

    vi.advanceTimersByTime(1);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);

    wrapper.unmount();
  });

  it('pauses the timer while focused and resumes on blur', async () => {
    const wrapper = mountToast(null);
    await wrapper.setProps({ toast: successToast });

    fire('focusin');
    vi.advanceTimersByTime(60000);
    expect(wrapper.emitted('dismiss')).toBeUndefined();

    fire('focusout');
    vi.advanceTimersByTime(5000);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);

    wrapper.unmount();
  });

  it('restarts the timer when an identical outcome is shown again', async () => {
    const wrapper = mountToast(null);
    await wrapper.setProps({ toast: { ...successToast } });

    vi.advanceTimersByTime(4000);
    await wrapper.setProps({ toast: { ...successToast } });

    vi.advanceTimersByTime(4000);
    expect(wrapper.emitted('dismiss')).toBeUndefined();

    vi.advanceTimersByTime(1000);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);

    wrapper.unmount();
  });

  it('clears a pending timer once the toast is removed', async () => {
    const wrapper = mountToast(null);
    await wrapper.setProps({ toast: successToast });
    await wrapper.setProps({ toast: null });

    vi.advanceTimersByTime(60000);
    expect(wrapper.emitted('dismiss')).toBeUndefined();

    wrapper.unmount();
  });
});
