<script setup lang="ts">
import { computed } from 'vue';

import { useResumeLocale } from '@/features/resume/composables/useResumeLocale';
import { contacts } from '@/features/resume/data/contacts';

import { useFeedbackForm } from '../composables/useFeedbackForm';
import { getFeedbackCopy } from '../locales';

const { locale } = useResumeLocale();
const copy = computed(() => getFeedbackCopy(locale.value));

const mailtoHref = computed(
  () =>
    contacts.find((contact) => contact.href.startsWith('mailto:'))?.href ??
    'mailto:rbarakhvostov@gmail.com',
);

const { name, message, botcheck, status, errorReason, fieldErrors, submit } =
  useFeedbackForm();

const bannerMessage = computed(() => {
  if (status.value !== 'error' || errorReason.value === 'validation') {
    return null;
  }

  switch (errorReason.value) {
    case 'missing-key':
      return copy.value.configErrorMessage;
    case 'network':
      return copy.value.networkErrorMessage;
    case 'server':
      return copy.value.serverErrorMessage;
    default:
      return null;
  }
});
</script>

<template>
  <section class="feedback" data-print-hide>
    <h2 class="feedback__heading">{{ copy.heading }}</h2>
    <div class="feedback__rule" />
    <p class="feedback__subheading">{{ copy.subheading }}</p>

    <form class="feedback__form" novalidate @submit.prevent="submit">
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
        class="feedback__submit"
        type="submit"
        :disabled="status === 'sending'"
      >
        {{ status === 'sending' ? copy.sendingLabel : copy.sendLabel }}
      </button>

      <p
        v-if="status === 'success'"
        class="feedback__status feedback__status--success"
      >
        {{ copy.successMessage }}
      </p>
      <p
        v-else-if="bannerMessage"
        class="feedback__status feedback__status--error"
      >
        {{ bannerMessage }}
        <a :href="mailtoHref">{{ copy.fallbackLinkLabel }}</a>
      </p>
    </form>
  </section>
</template>

<style scoped>
.feedback {
  margin-top: clamp(40px, 6vw, 64px);
  padding: clamp(24px, 4vw, 36px);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.feedback__heading {
  margin: 0;
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
  font-size: 14px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.feedback__rule {
  height: 1px;
  margin: clamp(10px, 1.6vw, 14px) 0 clamp(16px, 2.5vw, 22px);
  background: linear-gradient(to right, var(--color-divider), transparent);
}

.feedback__subheading {
  margin: 0 0 clamp(18px, 2.5vw, 24px);
  color: color-mix(in srgb, var(--color-text) 80%, transparent);
  font-size: 14.5px;
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
  background: color-mix(in srgb, var(--color-text) 4%, transparent);
  color: var(--color-text);
  font: inherit;
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

.feedback__status {
  margin: 0;
  font-size: 13.5px;
}

.feedback__status--success {
  color: var(--color-accent);
}

.feedback__status--error a {
  color: var(--color-accent);
  text-decoration: underline;
}
</style>
