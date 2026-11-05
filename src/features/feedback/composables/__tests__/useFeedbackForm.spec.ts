import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { WEB3FORMS_ENDPOINT } from '../../data/web3forms';
import { useFeedbackForm } from '../useFeedbackForm';

const mockFetchOnce = (body: unknown, ok = true): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(body),
    }),
  );
};

describe('useFeedbackForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('blocks submit and reports field errors when required fields are empty', async () => {
    const form = useFeedbackForm();
    vi.stubGlobal('fetch', vi.fn());

    await form.submit();

    expect(form.status.value).toBe('error');
    expect(form.errorReason.value).toBe('validation');
    expect(form.fieldErrors.value).toEqual({ name: true, message: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reports a missing-key error and never calls fetch when the access key env var is unset', async () => {
    const form = useFeedbackForm();
    form.name.value = 'Ada';
    form.message.value = 'Hello';
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', '');

    await form.submit();

    expect(form.status.value).toBe('error');
    expect(form.errorReason.value).toBe('missing-key');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('submits successfully and clears the form', async () => {
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', 'test-key');
    mockFetchOnce({ success: true, message: 'ok' });

    const form = useFeedbackForm();
    form.name.value = 'Ada';
    form.message.value = 'Hello there';

    await form.submit();

    expect(fetch).toHaveBeenCalledWith(
      WEB3FORMS_ENDPOINT,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(form.status.value).toBe('success');
    expect(form.name.value).toBe('');
    expect(form.message.value).toBe('');
  });

  it('reports a server error when Web3Forms responds with success: false', async () => {
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', 'test-key');
    mockFetchOnce({ success: false, message: 'invalid access key' });

    const form = useFeedbackForm();
    form.name.value = 'Ada';
    form.message.value = 'Hello there';

    await form.submit();

    expect(form.status.value).toBe('error');
    expect(form.errorReason.value).toBe('server');
  });

  it('reports a network error when fetch rejects', async () => {
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', 'test-key');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const form = useFeedbackForm();
    form.name.value = 'Ada';
    form.message.value = 'Hello there';

    await form.submit();

    expect(form.status.value).toBe('error');
    expect(form.errorReason.value).toBe('network');
  });

  it('silently succeeds without calling fetch when the honeypot is filled', async () => {
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', 'test-key');
    vi.stubGlobal('fetch', vi.fn());

    const form = useFeedbackForm();
    form.name.value = 'Ada';
    form.message.value = 'Hello there';
    form.botcheck.value = true;

    await form.submit();

    expect(form.status.value).toBe('success');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('clears a field error once that field becomes valid again', async () => {
    const form = useFeedbackForm();
    vi.stubGlobal('fetch', vi.fn());

    await form.submit();
    expect(form.fieldErrors.value).toEqual({ name: true, message: true });

    form.name.value = 'Ada Lovelace';
    await nextTick();
    expect(form.fieldErrors.value).toEqual({ name: false, message: true });

    form.message.value = 'Hello there';
    await nextTick();
    expect(form.fieldErrors.value).toEqual({ name: false, message: false });
  });

  it('treats whitespace as still invalid while clearing', async () => {
    const form = useFeedbackForm();
    vi.stubGlobal('fetch', vi.fn());

    await form.submit();

    form.name.value = '   ';
    await nextTick();

    expect(form.fieldErrors.value.name).toBe(true);
  });

  it('does not raise new field errors while typing before a submit', async () => {
    const form = useFeedbackForm();

    form.name.value = 'Ada Lovelace';
    form.message.value = '';
    await nextTick();

    expect(form.fieldErrors.value).toEqual({ name: false, message: false });
  });
});
