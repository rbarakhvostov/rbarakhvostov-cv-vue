<script setup lang="ts">
import { useResumeLocale } from '../composables/useResumeLocale';
import ExperienceSection from './ExperienceSection.vue';
import ResumeHeader from './ResumeHeader.vue';
import ResumeSummary from './ResumeSummary.vue';
import ResumeToolbar from './ResumeToolbar.vue';
import SkillsSection from './SkillsSection.vue';

const { copy } = useResumeLocale();
</script>

<template>
  <div class="page">
    <div class="page__inner">
      <ResumeToolbar />
      <ResumeHeader :name="copy.name" :role-line="copy.roleLine" />
      <ResumeSummary :summary="copy.summary" />
      <ExperienceSection :copy="copy" />
      <SkillsSection :heading="copy.skillsHeading" />
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
}

.page__inner {
  max-width: 1020px;
  margin: 0 auto;
  padding: clamp(26px, 5vw, 60px) clamp(20px, 5vw, 64px) 96px;
}
</style>
