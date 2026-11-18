<script setup lang="ts">
import { computed } from 'vue';

import { getPdfAsset } from '../data/pdf';
import { getResumeCopy } from '../locales';
import type { Locale } from '../types';

const { locale } = defineProps<{
  locale: Locale;
}>();

const asset = computed(() => getPdfAsset(locale));
const label = computed(() => getResumeCopy(locale).pdfLabel);
</script>

<template>
  <a
    class="pdf-link"
    data-print-hide
    :href="asset.href"
    :download="asset.fileName"
    :aria-label="label"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M8 1.5v8.2" />
      <path d="M4.5 6.8 8 10.3l3.5-3.5" />
      <path d="M2 12.5v1.3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.3" />
    </svg>
    PDF
  </a>
</template>

<style scoped>
.pdf-link {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: var(--control-height);
  padding: 0 12px;
  border: 1px solid var(--color-control-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
  font-size: 12.5px;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition: var(--control-transition);
}

.pdf-link::after {
  content: '';
  position: absolute;
  inset: var(--control-hit-inset) 0;
}

.pdf-link:hover {
  border-color: var(--color-accent);
  background: var(--control-wash);
  color: var(--color-text);
}

.pdf-link:active {
  border-color: var(--color-accent);
  background: var(--control-wash-strong);
  color: var(--color-text);
}

.pdf-link svg {
  flex: none;
}
</style>
