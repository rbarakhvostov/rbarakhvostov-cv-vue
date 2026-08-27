---
name: vue-typescript-vite
description: Apply Vue 3 Composition API, TypeScript, and Vite best practices when writing, reviewing, or refactoring frontend code. Use when working with .vue SFCs, composables, Pinia, Vue Router, Vite, vue-tsc, or when the user asks to build or review a Vue + TypeScript + Vite app.
---

# Vue + TypeScript + Vite

Follow these practices for all Vue 3 + TypeScript + Vite work in this repo. Prefer current Vue 3 APIs over Vue 2 / Options API patterns.

This project is Vue 3.5+, Vite 8, TypeScript (strict, `noUncheckedIndexedAccess`), `@` → `src`, and `vue-tsc --build` for type-checking. Match that stack.

## Non-negotiables

- Use **Composition API** with `<script setup lang="ts">`. Do not introduce Options API, mixins, filters, or class components.
- Keep TypeScript **strict**. Never use `any`. Prefer `unknown` + narrowing. Never add `// @ts-ignore` or `as any` to silence errors.
- Use `vue-tsc` for type-checking, not `tsc`. Do not weaken `tsconfig` (`strict`, `noUncheckedIndexedAccess`, path aliases).
- Colocate by **feature** as the app grows. Do not dump everything into `components/` and `views/`.
- Keep components small and single-purpose. Move reusable logic into composables (`useXxx`).
- Do not put secrets in `VITE_*` env vars — they are inlined into the client bundle.

## Default stack

Use these unless the project already chose otherwise:

| Concern | Choice |
|---|---|
| UI components | SFCs, Composition API, typed props/emits |
| Shared logic | Composables (`src/composables` or `src/features/<name>`) |
| Client state | Pinia setup stores |
| Server state | TanStack Vue Query (or Pinia Colada). Do not cache HTTP in Pinia. |
| Routing | Vue Router + typed routes (`unplugin-vue-router` when adding routes) |
| HTTP | `ofetch` or native `fetch` with typed wrappers. No untyped axios bag. |
| Utilities | VueUse for DOM/lifecycle/browser primitives. Do not reimplement them. |
| Unit tests | Vitest + Vue Test Utils + Testing Library |
| E2E | Playwright |
| Lint / format | ESLint 9 flat config (`typescript-eslint` + `eslint-plugin-vue`) + Prettier or Oxfmt |
| CSS | Scoped SFC styles + CSS variables. Tailwind/UnoCSS only if already in the project. |

Do not add Vuex, Vetur, webpack, or runtime `PropTypes`.

## File structure

```
src/
  assets/
  components/          # shared, presentational UI only
  composables/         # shared composables
  features/<name>/     # feature module: ui, composables, api, types, store
  router/
  stores/              # Pinia stores that are truly global
  types/
  utils/               # pure functions, no Vue APIs
  App.vue
  main.ts
```

- Import via `@/` (`@/features/auth/api`).
- One component per file. File name = component name (`UserCard.vue`).
- Composables: `useUserSession.ts`. Stores: `useUserStore.ts`.
- Keep `utils/` free of Vue reactivity. If it needs `ref` / lifecycle, it is a composable.

## SFC rules

Block order: `<script setup lang="ts">`, then `<template>`, then `<style scoped>`.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  title: string
  count?: number
}>()

const emit = defineEmits<{
  select: [id: string]
  close: []
}>()

const { title, count = 0 } = props
const doubled = computed(() => count * 2)
</script>

<template>
  <article>
    <h2>{{ title }}</h2>
    <button type="button" @click="emit('select', '1')">Select</button>
  </article>
</template>

<style scoped>
article { display: grid; gap: 0.5rem; }
</style>
```

- Type-based `defineProps` / `defineEmits`. Prefer `defineModel` for `v-model`.
- Vue 3.5+: destructuring `defineProps()` is reactive. Do not wrap those fields in extra `toRefs` unless needed.
- Use `useTemplateRef<HTMLInputElement>('input')` instead of `ref()` + `ref="input"` typing hacks.
- Type slots with `defineSlots`. Expose instance API with `defineExpose` only when a parent must call methods.
- `v-for` always has a **stable** `:key` (id, not index, unless the list is static).
- Never use `v-html` with untrusted content.
- Prefer semantic HTML and native elements. Add ARIA only when native semantics are insufficient.

## Reactivity and script setup

- `ref` for primitives and replaced values. `reactive` only for cohesive object state you never replace.
- Do not destructure a `reactive()` object without `toRefs` / `toRef`.
- Derived values → `computed`, not `watch` that writes to another ref.
- Side effects → `watch` / `watchEffect` with explicit cleanup. Prefer `{ once: true }` or `watchEffect` + `onScopeDispose`.
- Accept `MaybeRefOrGetter<T>` in composables; read with `toValue()`.
- Use `shallowRef` / `shallowReactive` for large trees or third-party instances (charts, maps, editors).
- Do not store reactive state in `utils/`. Do not mutate props.

## Composables

```ts
export function usePointer(target: MaybeRefOrGetter<HTMLElement | null>) {
  const x = ref(0)
  const y = ref(0)

  function onMove(event: PointerEvent) {
    x.value = event.clientX
    y.value = event.clientY
  }

  watchEffect((onCleanup) => {
    const el = toValue(target)
    if (!el) return
    el.addEventListener('pointermove', onMove)
    onCleanup(() => el.removeEventListener('pointermove', onMove))
  })

  return { x, y }
}
```

- Name: `useXxx`. Return a **named object**, not a positional tuple (unless a pair like `[state, setState]` is the established API).
- Register listeners, intervals, and observers with cleanup on `onScopeDispose`.
- Keep composables framework-agnostic at the edges: accept refs/getters, return refs/computeds.
- Do not create a composable that is only used once and has no reuse or test value — keep that logic in the component.

## State, routing, data fetching

- **Local UI state** lives in the component.
- **Cross-component client state** → Pinia setup store (`defineStore('id', () => { ... })`).
- **Server/async cache** → query library. Stores should not `fetch` and cache lists.
- Routes are lazy-loaded. Guards are typed. Prefer file-based typed routing when introducing Vue Router.
- App bootstrap in `main.ts`: create app → `app.use(pinia)` → `app.use(router)` → plugins → `mount`.

## Vite and TypeScript

- Env: only `VITE_*` is exposed. Type it in `env.d.ts` via `ImportMetaEnv`. Access through `import.meta.env`, never `process.env`.
- Keep the `@` alias in both `vite.config.ts` and `tsconfig.app.json`.
- Use `import type { Foo } from '...'` for type-only imports.
- Prefer official Vite plugins. Do not add webpack-era loaders or `vite-plugin-vue2`.
- Code-split routes and heavy widgets with `() => import(...)` or `defineAsyncComponent`.
- Production check: `npm run build` must pass `vue-tsc --build` and the Vite build.

## Quality bar before finishing a change

After editing source files, run the repo checks and fix failures before considering the task done:

```bash
npm run format
npm run lint
npm run lint:css
npm run type-check
npm run test
```

- Run `format` first (`prettier --write .`) so lint and the rest see formatted files.
- `test` is a single run (`vitest run`) — use it in CI, pre-commit, and before finishing. `test:watch` is watch mode. `test:coverage` writes a v8 report to the terminal and `coverage/`.
- Run `lint:css` when CSS or `<style>` in Vue files changed. Run `lint` and `type-check` for any TS/Vue change.
- If a check fails, fix the cause and re-run the failed command. Do not finish until the checks pass.

Husky pre-commit is `lint-staged --concurrent false && npm run type-check && npm run test`:

- **lint-staged** is file-scoped: Prettier on all staged files, Stylelint on CSS/Vue, ESLint on TypeScript/Vue.
- **type-check** and **test** are project-wide. Do not put them in lint-staged (`vue-tsc` and the suite ignore staged-path lists).

- [ ] SFC uses `<script setup lang="ts">` with typed props/emits
- [ ] No `any`, no unused reactive state, no prop mutation
- [ ] Composables clean up subscriptions
- [ ] Lists have stable keys; async work has loading/error/empty states
- [ ] New routes are lazy-loaded; new env vars are typed
- [ ] Styles are scoped (or existing global strategy)
- [ ] Types pass (`vue-tsc`); tests added for non-trivial logic
- [ ] `format`, `lint`, `lint:css` (if styles changed), `type-check`, and `test` have been run and pass

## Additional resources

- Patterns and APIs: [reference.md](reference.md)
- Copy-paste examples: [examples.md](examples.md)
