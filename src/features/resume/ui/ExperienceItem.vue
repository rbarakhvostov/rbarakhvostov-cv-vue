<script setup lang="ts">
import type { JobMeta } from '../types';
import { splitHighlightedNumbers } from '../utils/splitHighlightedNumbers';
import RoleLine from './RoleLine.vue';

defineProps<{
  job: JobMeta;
  roleLine: string;
  bullets: readonly string[];
  isFirst?: boolean;
}>();
</script>

<template>
  <article
    class="job"
    :class="{ 'is-first': isFirst }"
    :aria-labelledby="`job-${job.id}-heading`"
  >
    <div class="job__meta">
      <h3 :id="`job-${job.id}-heading`" class="job__company">
        {{ job.company }}
      </h3>
      <div class="job__period">{{ job.period }}</div>
      <ul class="job__urls" role="list">
        <li v-for="url in job.urls" :key="url.href">
          <a :href="url.href" target="_blank" rel="noopener">{{ url.label }}</a>
        </li>
      </ul>
    </div>
    <div class="job__body">
      <RoleLine class="job__role" :value="roleLine" />
      <ul class="job__bullets" role="list">
        <li v-for="bullet in bullets" :key="bullet">
          <template
            v-for="(part, partIndex) in splitHighlightedNumbers(bullet)"
            :key="`${part.text}-${partIndex}`"
          >
            <span v-if="part.isHighlighted" class="job__number">{{
              part.text
            }}</span>
            <template v-else>{{ part.text }}</template>
          </template>
        </li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.job {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 36px;
  margin-top: clamp(16px, 2.5vw, 24px);
  padding: clamp(20px, 3vw, 28px) 0 0;
  background: linear-gradient(
      to right,
      transparent,
      var(--color-divider) 48px,
      var(--color-divider) calc(100% - 48px),
      transparent
    )
    no-repeat top / 100% 1px;
}

.job.is-first {
  margin-top: clamp(4px, 1vw, 12px);
}

.job__meta {
  position: relative;
  flex: 0 1 208px;
  min-width: 180px;
}

.job__company {
  margin: 0 0 4px;
  font-size: 19px;
  font-weight: 600;
}

.job__period {
  margin-bottom: 4px;
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
  font-size: 12.5px;
  letter-spacing: 0.04em;
}

.job__urls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.job__urls a {
  color: color-mix(in srgb, var(--color-text) 82%, transparent);
  font-size: 12.5px;
  font-weight: 500;
  word-break: break-all;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--color-text) 45%, transparent);
}

.job__urls a:hover {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}

.job__body {
  flex: 1 1 440px;
  min-width: 248px;
}

.job__role {
  margin-bottom: 12px;
  color: var(--color-role);
  font-size: 14.5px;
}

.job__role :deep(.role-line__item) {
  font-weight: 600;
}

.job__bullets {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: color-mix(in srgb, var(--color-text) 86%, transparent);
  font-size: 14.5px;
  line-height: 1.6;
}

.job__bullets li {
  position: relative;
  padding-left: 20px;
  text-wrap: pretty;
}

.job__number {
  color: var(--color-text);
  font-weight: 600;
}

.job__bullets li::before {
  content: '';
  position: absolute;
  top: 11px;
  left: 0;
  width: 8px;
  height: 1px;
  background: color-mix(in srgb, var(--color-text) 55%, transparent);
}

@media screen and (width <= 640px) {
  .job {
    gap: 16px 36px;
  }
}

@media (forced-colors: active) {
  .job {
    background: none;
    border-top: 1px solid CanvasText;
  }

  .job__bullets li::before {
    background: CanvasText;
  }
}
</style>
