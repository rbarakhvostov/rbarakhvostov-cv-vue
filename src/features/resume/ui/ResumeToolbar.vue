<script setup lang="ts">
import { computed } from 'vue';

import SegmentedToggle from '@/components/SegmentedToggle.vue';

import {
  rememberLocale,
  useResumeLocale,
} from '../composables/useResumeLocale';
import { useResumeTheme } from '../composables/useResumeTheme';
import { LOCALE_PATHS } from '../data/seo';
import type { Locale, Theme } from '../types';
import PdfDownloadLink from './PdfDownloadLink.vue';

const { locale, copy } = useResumeLocale();
const { theme, setTheme } = useResumeTheme();

const langOptions = [
  { value: 'en', label: 'EN', href: LOCALE_PATHS.en },
  { value: 'ru', label: 'RU', href: LOCALE_PATHS.ru },
] as const satisfies readonly {
  value: Locale;
  label: string;
  href: string;
}[];

const themeOptions = computed(
  () =>
    [
      { value: 'light' as const, ariaLabel: copy.value.lightLabel },
      { value: 'dark' as const, ariaLabel: copy.value.darkLabel },
    ] satisfies readonly { value: Theme; ariaLabel: string }[],
);
</script>

<template>
  <header class="toolbar" data-print-hide>
    <PdfDownloadLink :locale="locale" />
    <div class="toolbar__controls">
      <SegmentedToggle
        :model-value="locale"
        :options="langOptions"
        :label="copy.langGroupLabel"
        @select="rememberLocale"
      />
      <SegmentedToggle
        :model-value="theme"
        :options="themeOptions"
        :label="copy.themeGroupLabel"
        @update:model-value="setTheme"
      >
        <template #default="{ option }">
          <svg
            v-if="option.value === 'light'"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="3" />
            <line x1="8" y1="1" x2="8" y2="2.6" />
            <line x1="8" y1="13.4" x2="8" y2="15" />
            <line x1="1" y1="8" x2="2.6" y2="8" />
            <line x1="13.4" y1="8" x2="15" y2="8" />
            <line x1="3.05" y1="3.05" x2="4.17" y2="4.17" />
            <line x1="11.83" y1="11.83" x2="12.95" y2="12.95" />
            <line x1="3.05" y1="12.95" x2="4.17" y2="11.83" />
            <line x1="11.83" y1="4.17" x2="12.95" y2="3.05" />
          </svg>
          <svg
            v-else
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8.5 1.6a6.5 6.5 0 1 0 5.9 9.2 6.5 6.5 0 0 1-5.9-9.2z" />
          </svg>
        </template>
      </SegmentedToggle>
    </div>
  </header>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: clamp(16px, 3vw, 24px);
}

.toolbar__controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar svg {
  flex: none;
}
</style>
