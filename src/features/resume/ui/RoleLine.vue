<script setup lang="ts">
import { computed } from 'vue';

import { splitRoles } from '../utils/splitRoles';

const { value } = defineProps<{
  value: string;
}>();

const parts = computed(() => splitRoles(value));
</script>

<template>
  <p class="role-line" lang="en">
    <template v-for="part in parts" :key="part.text">
      <span v-if="part.showSep" class="role-line__sep" aria-hidden="true"
        >|</span
      >
      <span class="role-line__item">{{ part.text }}</span>
    </template>
  </p>
</template>

<style scoped>
.role-line {
  display: flex;
  flex-wrap: wrap;
  margin-top: 0;
}

.role-line__sep {
  margin: 0 8px;
  color: var(--color-divider);
}

@media screen and (width <= 640px) {
  .role-line {
    display: grid;
    grid-template-columns: repeat(2, auto);
    gap: 8px 12px;
    justify-content: start;
  }

  .role-line__sep {
    display: none;
  }
}
</style>
