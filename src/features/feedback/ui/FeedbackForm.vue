<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';

import { useResumeLocale } from '@/features/resume/composables/useResumeLocale';
import { contacts } from '@/features/resume/data/contacts';

import { useFeedbackForm } from '../composables/useFeedbackForm';
import { getFeedbackCopy } from '../locales';
import type {
  FeedbackErrorReason,
  FeedbackToast as FeedbackToastPayload,
} from '../types';
import FeedbackToast from './FeedbackToast.vue';

const { locale } = useResumeLocale();
const copy = computed(() => getFeedbackCopy(locale.value));

const mailtoHref = computed(
  () =>
    contacts.find((contact) => contact.href.startsWith('mailto:'))?.href ??
    'mailto:rbarakhvostov@gmail.com',
);

const { name, message, botcheck, status, errorReason, fieldErrors, submit } =
  useFeedbackForm();

// 'validation' stays inline under the offending field, so it maps to null.
const errorCopyFor = (reason: FeedbackErrorReason | null): string | null => {
  switch (reason) {
    case 'missing-key':
      return copy.value.configErrorMessage;
    case 'network':
      return copy.value.networkErrorMessage;
    case 'server':
      return copy.value.serverErrorMessage;
    default:
      return null;
  }
};

const toast = ref<FeedbackToastPayload | null>(null);
const submitButton = useTemplateRef<HTMLButtonElement>('submit-button');

// `status` never returns to 'idle', so an identical outcome twice in a row is
// not a reactive change — await the submission instead of watching the status.
const onSubmit = async (): Promise<void> => {
  await submit();

  if (status.value === 'success') {
    toast.value = { tone: 'success', message: copy.value.successMessage };

    return;
  }

  const errorMessage = errorCopyFor(errorReason.value);

  if (errorMessage) {
    toast.value = {
      tone: 'error',
      message: errorMessage,
      link: { href: mailtoHref.value, label: copy.value.fallbackLinkLabel },
    };
  }
};

// The toast is teleported to the end of <body>, so its close button is the last
// focusable node; hand focus back to Send instead of resetting to page top.
// Only on an explicit close — the timer must never steal focus.
const onToastClose = (): void => {
  toast.value = null;
  submitButton.value?.focus({ preventScroll: true });
};
</script>

<template>
  <section class="feedback" data-print-hide>
    <div class="feedback__heading">
      <h2>{{ copy.heading }}</h2>
    </div>
    <div class="feedback__rule" />

    <div class="feedback__card">
      <p class="feedback__subheading">{{ copy.subheading }}</p>

      <form class="feedback__form" novalidate @submit.prevent="onSubmit">
        <label class="feedback__honeypot" aria-hidden="true">
          <input
            v-model="botcheck"
            type="checkbox"
            name="botcheck"
            tabindex="-1"
            autocomplete="off"
          />
        </label>

        <div class="feedback__field">
          <label class="feedback__label" for="feedback-name">
            {{ copy.nameLabel }} <span class="feedback__required">*</span>
          </label>
          <input
            id="feedback-name"
            v-model="name"
            class="feedback__control"
            type="text"
            name="name"
            autocomplete="name"
            :aria-invalid="fieldErrors.name"
            :aria-describedby="
              fieldErrors.name ? 'feedback-name-error' : undefined
            "
          />
          <p
            v-if="fieldErrors.name"
            id="feedback-name-error"
            class="feedback__field-error"
          >
            {{ copy.nameRequiredError }}
          </p>
        </div>

        <div class="feedback__field">
          <label class="feedback__label" for="feedback-message">
            {{ copy.messageLabel }} <span class="feedback__required">*</span>
          </label>
          <textarea
            id="feedback-message"
            v-model="message"
            class="feedback__control feedback__control--textarea"
            name="message"
            rows="5"
            :aria-invalid="fieldErrors.message"
            :aria-describedby="
              fieldErrors.message ? 'feedback-message-error' : undefined
            "
          />
          <p
            v-if="fieldErrors.message"
            id="feedback-message-error"
            class="feedback__field-error"
          >
            {{ copy.messageRequiredError }}
          </p>
        </div>

        <button
          ref="submit-button"
          class="feedback__submit"
          type="submit"
          :disabled="status === 'sending'"
        >
          {{ status === 'sending' ? copy.sendingLabel : copy.sendLabel }}
        </button>
      </form>
    </div>

    <FeedbackToast
      :toast="toast"
      :close-label="copy.dismissLabel"
      @dismiss="toast = null"
      @close="onToastClose"
    />
  </section>
</template>

<style scoped>
.feedback {
  margin-top: clamp(40px, 6vw, 64px);
}

.feedback__heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: clamp(6px, 1vw, 12px);
}

.feedback__heading h2 {
  margin: 0;
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
  font-size: 14px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.feedback__rule {
  height: 1px;
  margin-bottom: clamp(16px, 2.5vw, 22px);
  background: linear-gradient(
    to right,
    transparent,
    var(--color-divider) 48px,
    var(--color-divider) calc(100% - 48px),
    transparent
  );
}

.feedback__card {
  padding: clamp(24px, 4vw, 36px);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-accent) 6%, var(--color-bg));
  box-shadow: 0 0 0 1px var(--color-divider);
}

.feedback__subheading {
  margin: 0 0 clamp(18px, 2.5vw, 24px);
  color: color-mix(in srgb, var(--color-text) 80%, transparent);
  font-size: clamp(15.5px, 1.8vw, 17.5px);
}

.feedback__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
}

.feedback__honeypot {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.feedback__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feedback__label {
  font-size: 13px;
  font-weight: 500;
}

.feedback__required {
  color: var(--color-accent);
}

.feedback__control {
  box-sizing: border-box;
  padding: 9px 12px;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text);
  font: inherit;
}

.feedback__control:focus-visible {
  border-color: var(--color-accent);
  outline: 1px solid var(--color-accent);
  outline-offset: 0;
}

.feedback__control--textarea {
  resize: vertical;
}

.feedback__field-error {
  margin: 0;
  color: var(--color-accent);
  font-size: 12.5px;
}

.feedback__submit {
  align-self: flex-start;
  padding: 9px 22px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-accent);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.feedback__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback__submit:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
}
</style>
