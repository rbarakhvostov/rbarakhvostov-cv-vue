<script setup lang="ts" generic="T extends string">
defineSlots<{
  default?: (props: {
    option: { value: T; label?: string; ariaLabel: string };
  }) => unknown;
}>();

const model = defineModel<T>({ required: true });

const { options } = defineProps<{
  options: readonly { value: T; label?: string; ariaLabel: string }[];
}>();
</script>

<template>
  <div class="segmented" role="group">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="segmented__btn"
      :class="{ 'is-on': model === option.value }"
      :aria-pressed="model === option.value"
      :aria-label="option.ariaLabel"
      @click="model = option.value"
    >
      <slot :option="option">{{ option.label }}</slot>
    </button>
  </div>
</template>

<style scoped>
.segmented {
  display: flex;
  align-items: center;
}

.segmented__btn {
  appearance: none;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 40px;
  height: 34px;
  padding: 0;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
  font: inherit;
  font-size: 12.5px;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.segmented__btn:first-child {
  border-radius: calc(var(--radius-md) - 2px) 0 0 calc(var(--radius-md) - 2px);
}

.segmented__btn:last-child {
  border-radius: 0 calc(var(--radius-md) - 2px) calc(var(--radius-md) - 2px) 0;
}

.segmented__btn:focus-visible {
  position: relative;
  z-index: 1;
}

.segmented__btn.is-on {
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
  color: var(--color-role);
}

.segmented__btn:hover {
  background: color-mix(in srgb, var(--color-text) 7%, transparent);
}
</style>
