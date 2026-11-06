import { describe, expect, it } from 'vitest';

import { buildWeb3FormsFormData, WEB3FORMS_ENDPOINT } from '../web3forms';

describe('web3forms data', () => {
  it('exposes the submit endpoint', () => {
    expect(WEB3FORMS_ENDPOINT).toBe('https://api.web3forms.com/submit');
  });

  it('builds form data with the subject derived from the sender name', () => {
    const formData = buildWeb3FormsFormData({
      accessKey: 'test-key',
      name: 'Ada Lovelace',
      message: 'Hello there',
    });

    expect(formData).toBeInstanceOf(FormData);
    expect(Object.fromEntries(formData.entries())).toEqual({
      access_key: 'test-key',
      subject: 'CV feedback from Ada Lovelace',
      from_name: 'Ada Lovelace',
      name: 'Ada Lovelace',
      message: 'Hello there',
    });
  });
});
