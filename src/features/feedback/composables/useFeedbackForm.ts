import { ref, watch } from 'vue';

import { buildWeb3FormsPayload, WEB3FORMS_ENDPOINT } from '../data/web3forms';
import type {
  FeedbackErrorReason,
  FeedbackFieldErrors,
  FeedbackStatus,
  Web3FormsResponse,
} from '../types';
import { hasFeedbackErrors, validateFeedback } from '../utils/validateFeedback';

export const useFeedbackForm = () => {
  const name = ref('');
  const message = ref('');
  const botcheck = ref(false);

  const status = ref<FeedbackStatus>('idle');
  const errorReason = ref<FeedbackErrorReason | null>(null);
  const fieldErrors = ref<FeedbackFieldErrors>({ name: false, message: false });

  // Clear a field's error as soon as it becomes valid again. This only ever
  // removes errors — typing must not raise new ones before the next submit.
  watch([name, message], ([nextName, nextMessage]) => {
    const current = fieldErrors.value;

    if (!current.name && !current.message) {
      return;
    }

    const errors = validateFeedback(nextName, nextMessage);
    fieldErrors.value = {
      name: current.name && errors.name,
      message: current.message && errors.message,
    };
  });

  const submit = async (): Promise<void> => {
    if (botcheck.value) {
      status.value = 'success';
      errorReason.value = null;

      return;
    }

    const errors = validateFeedback(name.value, message.value);
    fieldErrors.value = errors;

    if (hasFeedbackErrors(errors)) {
      status.value = 'error';
      errorReason.value = 'validation';

      return;
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      status.value = 'error';
      errorReason.value = 'missing-key';

      return;
    }

    status.value = 'sending';
    errorReason.value = null;

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(
          buildWeb3FormsPayload({
            accessKey,
            name: name.value,
            message: message.value,
            isBot: botcheck.value,
          }),
        ),
      });

      const data = (await response.json()) as Web3FormsResponse;

      if (!response.ok || !data.success) {
        status.value = 'error';
        errorReason.value = 'server';

        return;
      }

      status.value = 'success';
      errorReason.value = null;
      name.value = '';
      message.value = '';
      fieldErrors.value = { name: false, message: false };
    } catch {
      status.value = 'error';
      errorReason.value = 'network';
    }
  };

  return {
    name,
    message,
    botcheck,
    status,
    errorReason,
    fieldErrors,
    submit,
  };
};
