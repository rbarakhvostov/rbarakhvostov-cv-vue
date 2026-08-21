<script setup lang="ts">
import { computed } from 'vue'

import { getPdfAsset } from '../data/pdf'
import type { Locale } from '../types'

const { locale } = defineProps<{
  locale: Locale
}>()

const asset = computed(() => getPdfAsset(locale))
</script>

<template>
  <a
    class="pdf-link"
    data-print-hide
    :href="asset.href"
    :download="asset.fileName"
    aria-label="PDF"
  >
    <svg
      width="15"
      height="15"
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
  box-sizing: border-box;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  margin-top: -6px;
  padding: 0 12px;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-role);
  font-size: 12.5px;
  letter-spacing: 0.04em;
  text-decoration: none;
}

.pdf-link:hover {
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  color: var(--color-role);
}

.pdf-link svg {
  flex: none;
}
</style>
