<script setup lang="ts">
import { skills } from '../data/skills';

defineProps<{
  heading: string;
}>();
</script>

<template>
  <section class="skills">
    <div class="skills__heading">
      <h2>{{ heading }}</h2>
    </div>
    <div class="skills__rule" />
    <div class="skills__list">
      <span v-for="skill in skills" :key="skill" class="skills__chip">{{
        skill
      }}</span>
    </div>
  </section>
</template>

<style scoped>
.skills {
  margin-top: clamp(40px, 6vw, 64px);
}

.skills__heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: clamp(6px, 1vw, 12px);
}

.skills__heading h2 {
  margin: 0;
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
  font-size: 14px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.skills__rule {
  height: 1px;
  margin-bottom: clamp(16px, 2.5vw, 22px);
  background: linear-gradient(
    to right,
    transparent,
    var(--color-divider) 48px,
    var(--color-divider) calc(100% - 48px),
    transparent
  );
}

.skills__list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.skills__chip {
  padding: 4px 11px;
  border-radius: 6px;
  background: var(--chip-bg);
  color: var(--chip-fg);
  font-size: 12.5px;
}
</style>
