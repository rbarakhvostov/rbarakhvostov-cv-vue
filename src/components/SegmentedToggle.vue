<script setup lang="ts" generic="T extends string">
type Option = {
  value: T;
  label?: string;
  ariaLabel?: string;
  href?: string;
};

defineSlots<{
  default?: (props: { option: Option }) => unknown;
}>();

const emit = defineEmits<{
  select: [value: T];
}>();

const model = defineModel<T>({ required: true });

const { options } = defineProps<{
  options: readonly Option[];
  label: string;
}>();

const attrsFor = (option: Option): Record<string, unknown> => {
  const isOn = model.value === option.value;

  if (option.href) {
    return {
      href: option.href,
      hreflang: option.value,
      'aria-current': isOn ? 'page' : undefined,
    };
  }

  return {
    type: 'button',
    'aria-pressed': isOn,
    'aria-label': option.ariaLabel,
  };
};

const onSelect = (option: Option): void => {
  if (!option.href) {
    model.value = option.value;
  }

  emit('select', option.value);
};
</script>

<template>
  <div class="segmented" role="group" :aria-label="label">
    <component
      :is="option.href ? 'a' : 'button'"
      v-for="option in options"
      :key="option.value"
      class="segmented__btn"
      :class="{ 'is-on': model === option.value }"
      v-bind="attrsFor(option)"
      @click="onSelect(option)"
    >
      <slot :option="option">{{ option.label }}</slot>
    </component>
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
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
  font: inherit;
  font-size: 12.5px;
  letter-spacing: 0.04em;
  text-decoration: none;
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
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

.segmented__btn:hover:not(.is-on) {
  background: color-mix(in srgb, var(--color-text) 7%, transparent);
}

@media (forced-colors: active) {
  .segmented__btn.is-on {
    border: 2px solid Highlight;
  }
}
</style>
