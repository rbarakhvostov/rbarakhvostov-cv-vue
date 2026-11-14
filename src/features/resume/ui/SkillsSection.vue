<script setup lang="ts">
import { skills } from '../data/skills';

defineProps<{
  heading: string;
}>();
</script>

<template>
  <section class="skills" aria-labelledby="skills-heading">
    <div class="skills__heading">
      <h2 id="skills-heading">{{ heading }}</h2>
    </div>
    <div class="skills__rule" />
    <ul class="skills__list" role="list">
      <li v-for="skill in skills" :key="skill" class="skills__chip">
        {{ skill }}
      </li>
    </ul>
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
  margin: 0;
  padding: 0;
  list-style: none;
}

.skills__chip {
  padding: 4px 11px;
  border-radius: 6px;
  background: var(--chip-bg);
  color: var(--chip-fg);
  font-size: 12.5px;
}

@media screen and (width <= 640px) {
  .skills__list {
    gap: 5px;
  }

  .skills__chip {
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 11px;
  }
}

@media (forced-colors: active) {
  .skills__rule {
    background: CanvasText;
  }

  .skills__chip {
    border: 1px solid CanvasText;
  }
}
</style>
