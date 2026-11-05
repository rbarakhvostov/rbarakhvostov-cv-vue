<script setup lang="ts">
import { onScopeDispose, ref, watch } from 'vue';

import type { FeedbackToast, FeedbackToastTone } from '../types';

const DURATIONS: Record<FeedbackToastTone, number> = {
  success: 5000,
  error: 8000,
};

const { toast } = defineProps<{
  toast: FeedbackToast | null;
  closeLabel: string;
}>();

const emit = defineEmits<{
  /** The auto-dismiss window elapsed. */
  dismiss: [];
  /** The reader closed the toast explicitly. */
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

// Bumped per toast so that an identical outcome twice in a row replaces the
// element instead of reusing it — otherwise the enter animation never replays.
const renderKey = ref(0);

// The form hands over a fresh object on every result, so an identical outcome
// twice in a row still restarts the timer.
watch(
  () => toast,
  (next) => {
    if (next) {
      renderKey.value += 1;
      start(DURATIONS[next.tone]);
    } else {
      clear();
    }
  },
);

onScopeDispose(clear);
</script>

<template>
  <Teleport to="body">
    <div
      class="feedback-toast-layer"
      data-print-hide
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <!-- out-in: a replacement must not sit beside the outgoing toast. -->
      <Transition name="feedback-toast" mode="out-in">
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
              width="14"
              height="14"
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
  </Teleport>
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

  /* The layer spans the viewport, so it must not swallow page clicks. */
  pointer-events: none;
}

.feedback-toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: min(440px, 100%);
  padding: 12px 14px;
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
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
  cursor: pointer;
}

.feedback-toast__close:hover {
  background: color-mix(in srgb, var(--color-text) 10%, transparent);
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
