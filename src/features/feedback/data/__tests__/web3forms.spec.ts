import { describe, expect, it } from 'vitest';

import { buildWeb3FormsPayload, WEB3FORMS_ENDPOINT } from '../web3forms';

describe('web3forms data', () => {
  it('exposes the submit endpoint', () => {
    expect(WEB3FORMS_ENDPOINT).toBe('https://api.web3forms.com/submit');
  });

  it('builds a payload with the subject derived from the sender name', () => {
    const payload = buildWeb3FormsPayload({
      accessKey: 'test-key',
      name: 'Ada Lovelace',
      message: 'Hello there',
      isBot: false,
    });

    expect(payload).toEqual({
      access_key: 'test-key',
      subject: 'CV feedback from Ada Lovelace',
      from_name: 'Ada Lovelace',
      name: 'Ada Lovelace',
      message: 'Hello there',
      botcheck: false,
    });
  });
});
