<script setup lang="ts">
import { onScopeDispose, ref, watch } from 'vue';

import type { FeedbackToast, FeedbackToastTone } from '../types';

const DURATIONS: Record<FeedbackToastTone, number | null> = {
  success: 5000,
  error: null,
};

const { toast } = defineProps<{
  toast: FeedbackToast | null;
  closeLabel: string;
}>();

const emit = defineEmits<{
  dismiss: [];
  close: [];
}>();

let timer: ReturnType<typeof setTimeout> | undefined;
let remaining = 0;
let startedAt = 0;

const clear = (): void => {
  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }
};

const start = (duration: number): void => {
  clear();
  remaining = duration;
  startedAt = Date.now();
  timer = setTimeout(() => emit('dismiss'), duration);
};

const pause = (): void => {
  if (timer === undefined) {
    return;
  }

  clear();
  remaining -= Date.now() - startedAt;
};

const resume = (): void => {
  if (toast && remaining > 0) {
    start(remaining);
  }
};

const renderKey = ref(0);

watch(
  () => toast,
  (next) => {
    if (!next) {
      clear();

      return;
    }

    renderKey.value += 1;

    const duration = DURATIONS[next.tone];

    if (duration === null) {
      clear();
      remaining = 0;

      return;
    }

    start(duration);
  },
);

onScopeDispose(clear);
</script>

<template>
  <div
    class="feedback-toast-layer"
    data-print-hide
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <Transition name="feedback-toast" mode="out-in">
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="toast"
        :key="renderKey"
        class="feedback-toast"
        :class="`feedback-toast--${toast.tone}`"
        @mouseenter="pause"
        @mouseleave="resume"
        @focusin="pause"
        @focusout="resume"
      >
        <p class="feedback-toast__text">
          {{ toast.message }}
          <a v-if="toast.link" :href="toast.link.href">{{
            toast.link.label
          }}</a>
        </p>
        <button
          class="feedback-toast__close"
          type="button"
          :aria-label="closeLabel"
          @click="emit('close')"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.feedback-toast-layer {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  padding: 0 16px
    calc(clamp(16px, 4vw, 32px) + env(safe-area-inset-bottom, 0px));
  pointer-events: none;
}

.feedback-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  width: min(440px, 100%);
  padding: 12px;
  border-left: 3px solid var(--toast-accent);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}

.feedback-toast--success {
  --toast-accent: var(--color-success);
}

.feedback-toast--error {
  --toast-accent: var(--color-danger);
}

.feedback-toast__text {
  flex: 1;
  margin: 0;
  font-size: 13.5px;
  line-height: 1.5;
}

.feedback-toast__text a {
  color: var(--color-accent);
  word-break: break-all;
  text-decoration: underline;
}

.feedback-toast__close {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--control-height);
  height: var(--control-height);
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
  cursor: pointer;
  transition: var(--control-transition);
}

.feedback-toast__close::after {
  content: '';
  position: absolute;
  inset: var(--control-hit-inset);
}

.feedback-toast__close:hover {
  background: var(--control-wash);
  color: var(--color-text);
}

.feedback-toast__close:active {
  background: var(--control-wash-strong);
  color: var(--color-text);
}

.feedback-toast-enter-active,
.feedback-toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.feedback-toast-enter-from,
.feedback-toast-leave-to {
  transform: translateY(12px);
  opacity: 0;
}

@media screen and (width <= 640px) {
  .feedback-toast-layer {
    position: static;
    padding: 16px 0 0;
  }
}

@media (forced-colors: active) {
  .feedback-toast {
    border: 1px solid CanvasText;
    border-left-width: 3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feedback-toast-enter-active,
  .feedback-toast-leave-active {
    transition: none;
  }

  .feedback-toast-enter-from,
  .feedback-toast-leave-to {
    transform: none;
  }
}
</style>
