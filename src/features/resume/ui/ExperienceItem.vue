<script setup lang="ts">
import type { JobMeta } from '../types';
import RoleLine from './RoleLine.vue';

defineProps<{
  job: JobMeta;
  roleLine: string;
  bullets: readonly string[];
  isFirst?: boolean;
}>();
</script>

<template>
  <article class="job" :class="{ 'is-first': isFirst }">
    <div class="job__meta">
      <h4 class="job__company">{{ job.company }}</h4>
      <div class="job__period">{{ job.period }}</div>
      <div class="job__urls">
        <a v-for="url in job.urls" :key="url.href" :href="url.href">{{
          url.label
        }}</a>
      </div>
    </div>
    <div class="job__body">
      <RoleLine class="job__role" :value="roleLine" />
      <ul class="job__bullets">
        <li v-for="bullet in bullets" :key="bullet">{{ bullet }}</li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.job {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 36px;
  margin-top: clamp(18px, 2.5vw, 26px);
  padding: clamp(22px, 3vw, 30px) 0 0;
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
  margin-top: clamp(6px, 1vw, 12px);
}

.job__meta {
  position: relative;
  flex: 0 1 210px;
  min-width: 180px;
}

.job__company {
  margin: 0 0 4px;
  font-size: 19px;
}

.job__period {
  margin-bottom: 6px;
  color: color-mix(in srgb, var(--color-text) 55%, transparent);
  font-size: 12.5px;
  letter-spacing: 0.04em;
}

.job__urls {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.job__urls a {
  color: var(--color-role);
  font-size: 12.5px;
  font-weight: 500;
  word-break: break-all;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--color-role) 40%, transparent);
}

.job__urls a:hover {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}

.job__body {
  flex: 1 1 440px;
  min-width: 250px;
}

.job__role {
  margin-bottom: 12px;
  color: var(--color-role);
  font-size: 14.5px;
}

.job__bullets {
  display: flex;
  flex-direction: column;
  gap: 9px;
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

.job__bullets li::before {
  content: '';
  position: absolute;
  top: 11px;
  left: 0;
  width: 9px;
  height: 1px;
  background: var(--color-accent);
}
</style>
