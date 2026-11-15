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
  gap: 4px;
}

.segmented__btn {
  appearance: none;
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: var(--control-height);
  height: var(--control-height);
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: color-mix(in srgb, var(--color-text) 72%, transparent);
  font: inherit;
  font-size: 12.5px;
  letter-spacing: 0.04em;
  text-decoration: none;
  cursor: pointer;
  transition: var(--control-transition);
}

.segmented__btn::after {
  content: '';
  position: absolute;
  inset: var(--control-hit-inset) 0;
}

.segmented__btn:focus-visible {
  z-index: 1;
}

.segmented__btn.is-on {
  background: var(--control-raised);
  color: var(--color-text);
  box-shadow: var(--control-raised-shadow);
}

.segmented__btn:hover:not(.is-on) {
  background: var(--control-wash);
  color: var(--color-text);
}

.segmented__btn:active:not(.is-on) {
  background: var(--control-wash-strong);
  color: var(--color-text);
}

@media (forced-colors: active) {
  .segmented__btn.is-on {
    border: 2px solid Highlight;
  }
}
</style>
