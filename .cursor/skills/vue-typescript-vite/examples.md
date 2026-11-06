# Vue + TypeScript + Vite — examples

Concrete patterns to copy. Keep logic aligned with [SKILL.md](SKILL.md). Snippets follow this repo's ESLint and Prettier: arrow functions, semicolons, single quotes, and a blank line around `if` / `for` plus before `return`.

## Typed SFC with model and slots

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue';

const open = defineModel<boolean>('open', { default: false });

defineProps<{
  title: string;
}>();

defineSlots<{
  default: (props: { close: () => void }) => unknown;
  actions?: () => unknown;
}>();

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog');

const close = (): void => {
  open.value = false;
  dialogRef.value?.close();
};
</script>

<template>
  <dialog ref="dialog" :open="open">
    <h2>{{ title }}</h2>
    <slot :close="close" />
    <footer>
      <slot name="actions" />
    </footer>
  </dialog>
</template>
```

## Feature API module

Not used today. The feedback submit builds `FormData` in `features/feedback/data/web3forms.ts` and does not map a JSON DTO. Copy this only when a screen starts reading a remote resource.

```ts
export type User = {
  id: string;
  name: string;
  email: string;
};

type UserDto = {
  id: string;
  full_name: string;
  email: string;
};

const toUser = (dto: UserDto): User => {
  return { id: dto.id, name: dto.full_name, email: dto.email };
};

export const fetchUser = async (
  id: string,
  init?: { signal?: AbortSignal },
): Promise<User> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
    signal: init?.signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load user ${id}`);
  }

  const dto = (await response.json()) as UserDto;

  return toUser(dto);
};
```

## Pinia store + component usage

Not installed. Add a setup store only when cross-feature state outgrows a composable.

```ts
export const useSessionStore = defineStore('session', () => {
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => token.value !== null);

  const setToken = (value: string | null): void => {
    token.value = value;
  };

  const logout = (): void => {
    token.value = null;
  };

  return { token, isAuthenticated, setToken, logout };
});
```

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useSessionStore } from '@/stores/session';

const session = useSessionStore();
const { isAuthenticated } = storeToRefs(session);
const { logout } = session;
</script>
```

## Composable with MaybeRefOrGetter

```ts
import { computed, toValue, type MaybeRefOrGetter } from 'vue';

export const useFullName = (
  first: MaybeRefOrGetter<string>,
  last: MaybeRefOrGetter<string>,
) => {
  const fullName = computed(() => `${toValue(first)} ${toValue(last)}`.trim());

  return { fullName };
};
```

## Async component + Suspense

```ts
import { defineAsyncComponent } from 'vue';

export const UserChart = defineAsyncComponent({
  loader: () => import('@/features/users/UserChart.vue'),
  delay: 200,
});
```

```vue
<script setup lang="ts">
import { UserChart } from '@/features/users/async';
</script>

<template>
  <Suspense>
    <UserChart />
    <template #fallback>
      <p>Loading chart…</p>
    </template>
  </Suspense>
</template>
```

## Typed inject

```ts
import type { ComputedRef, InjectionKey, Ref } from 'vue';

export type ThemeContext = {
  theme: Ref<'light' | 'dark'>;
  isDark: ComputedRef<boolean>;
  toggle: () => void;
};

export const themeKey: InjectionKey<ThemeContext> = Symbol('theme');
```

```ts
import { inject } from 'vue';

import { themeKey } from '@/features/theme/keys';

const theme = inject(themeKey);

if (!theme) {
  throw new Error('ThemeContext is missing');
}
```

## Vitest component test

This repo uses Vue Test Utils. Do not add Testing Library for a new spec.

```ts
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import Counter from '../Counter.vue';

describe('Counter', () => {
  it('increments', async () => {
    const wrapper = mount(Counter);

    await wrapper.get('button').trigger('click');

    expect(wrapper.text()).toContain('1');
  });
});
```
