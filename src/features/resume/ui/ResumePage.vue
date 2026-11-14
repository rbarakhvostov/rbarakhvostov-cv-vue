<script setup lang="ts">
import FeedbackForm from '@/features/feedback/ui/FeedbackForm.vue';

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
      <a class="skip-link" href="#main">{{ copy.skipToContent }}</a>
      <ResumeToolbar />
      <main id="main" tabindex="-1">
        <ResumeHeader :name="copy.name" :role-line="copy.roleLine" />
        <ResumeSummary :summary="copy.summary" />
        <ExperienceSection :copy="copy" />
        <SkillsSection :heading="copy.skillsHeading" />
        <FeedbackForm />
      </main>
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

.skip-link {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.skip-link:focus {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 60;
  width: auto;
  height: auto;
  padding: 10px 16px;
  overflow: visible;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  clip-path: none;
}

main:focus-visible {
  outline: none;
}

@media (forced-colors: active) {
  .skip-link:focus {
    border: 1px solid CanvasText;
  }
}
</style>
