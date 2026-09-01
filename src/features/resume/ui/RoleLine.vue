<script setup lang="ts">
import { computed } from 'vue';

import { splitRoles } from '../utils/splitRoles';

const { value } = defineProps<{
  value: string;
}>();

const parts = computed(() => splitRoles(value));
</script>

<template>
  <div class="role-line">
    <template v-for="part in parts" :key="part.text">
      <span v-if="part.showSep" class="role-line__sep">|</span>
      <span class="role-line__item">{{ part.text }}</span>
    </template>
  </div>
</template>

<style scoped>
.role-line {
  display: flex;
  flex-wrap: wrap;
}

.role-line__sep {
  margin: 0 8px;
  color: var(--color-divider);
}

@media screen and (width <= 640px) {
  .role-line {
    display: grid;
    grid-template-columns: repeat(2, auto);
    gap: 6px 12px;
    justify-content: start;
  }

  .role-line__sep {
    display: none;
  }
}
</style>
