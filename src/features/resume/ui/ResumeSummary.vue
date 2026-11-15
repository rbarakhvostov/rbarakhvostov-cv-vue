<script setup lang="ts">
import { computed } from 'vue';

import { splitSummary } from '../utils/splitSummary';

const { summary, newTabHint } = defineProps<{
  summary: string;
  newTabHint: string;
}>();

const parts = computed(() => splitSummary(summary));
</script>

<template>
  <p class="summary">
    <template v-for="(part, index) in parts" :key="`${part.kind}-${index}`">
      <span v-if="part.kind === 'highlight'" class="summary__highlight">{{
        part.text
      }}</span>
      <a
        v-else-if="part.kind === 'link'"
        href="https://rs.school/"
        target="_blank"
        rel="noopener"
        >{{ part.text
        }}<span class="visually-hidden">&nbsp;{{ newTabHint }}</span></a
      >
      <template v-else>{{ part.text }}</template>
    </template>
  </p>
</template>

<style scoped>
.summary {
  max-width: 88ch;
  margin: clamp(12px, 2vw, 20px) 0 0;
  color: color-mix(in srgb, var(--color-text) 88%, transparent);
  font-size: clamp(14.5px, 1.7vw, 16.5px);
  line-height: 1.65;
  text-wrap: pretty;
}

.summary__highlight {
  color: var(--color-text);
  font-weight: 600;
}

.summary a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--color-role);
  text-decoration-thickness: 1.5px;
  text-underline-offset: 2px;
}

.summary a:hover {
  color: var(--color-accent);
}
</style>
