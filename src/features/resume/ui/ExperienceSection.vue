<script setup lang="ts">
import { jobs } from '../data/jobs'
import type { ResumeCopy } from '../types'
import ExperienceItem from './ExperienceItem.vue'

defineProps<{
  copy: ResumeCopy
}>()
</script>

<template>
  <section class="experience">
    <div class="experience__heading">
      <h2>{{ copy.expHeading }}</h2>
    </div>
    <ExperienceItem
      v-for="(job, index) in jobs"
      :key="job.id"
      :job="job"
      :role-line="copy[job.roleKey]"
      :bullets="copy.jobs[job.id]"
      :is-first="index === 0"
    />
  </section>
</template>

<style scoped>
.experience {
  margin-top: clamp(22px, 3.5vw, 38px);
}

.experience__heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.experience__heading h2 {
  margin: 0;
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
  font-size: 14px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
</style>
