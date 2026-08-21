<script setup lang="ts">
import { computed } from 'vue';

const RS_SCHOOL = 'RS School';

const { summary } = defineProps<{
  summary: string;
}>();

const parts = computed(() => {
  const index = summary.indexOf(RS_SCHOOL);

  if (index === -1) {
    return { pre: summary, post: '' };
  }

  return {
    pre: summary.slice(0, index),
    post: summary.slice(index + RS_SCHOOL.length),
  };
});
</script>

<template>
  <p class="summary">
    {{ parts.pre
    }}<a href="https://rs.school/" target="_blank" rel="noopener">RS School</a
    >{{ parts.post }}
  </p>
</template>

<style scoped>
.summary {
  max-width: 88ch;
  margin: clamp(14px, 2vw, 22px) 0 0;
  color: color-mix(in srgb, var(--color-text) 88%, transparent);
  font-size: clamp(14.5px, 1.7vw, 16.5px);
  line-height: 1.65;
  text-wrap: pretty;
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
