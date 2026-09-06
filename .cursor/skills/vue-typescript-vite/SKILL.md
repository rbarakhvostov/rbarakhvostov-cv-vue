---
name: vue-typescript-vite
description: Apply Vue 3 Composition API, TypeScript, and Vite best practices when writing, reviewing, or refactoring frontend code. Use when working with .vue SFCs, composables, Pinia, Vue Router, Vite, vue-tsc, or when the user asks to build or review a Vue + TypeScript + Vite app.
---

# Vue + TypeScript + Vite

> Mirrored in [CLAUDE.md](../../../CLAUDE.md) (same content in Russian, for Claude Code). When editing rules here, port the change there too.

Follow these practices for all Vue 3 + TypeScript + Vite work in this repo. Prefer current Vue 3 APIs over Vue 2 / Options API patterns.

This project is Vue 3.5+, Vite 8, TypeScript (strict, `noUncheckedIndexedAccess`), `@` → `src`, and `vue-tsc --build` for type-checking. Match that stack.

This is a **static, single-page resume app** (see `README.md`): one route, no backend, content lives in local TS modules. Deliberately no router, no Pinia, no HTTP client — don't reintroduce them speculatively. Global state (locale, theme) is module-scope `ref`s inside composables, persisted to `localStorage`. Only add a router / store / query library / VueUse / HTTP wrapper when a real requirement needs it, and prefer the smallest solution first.

## Non-negotiables

- Use **Composition API** with `<script setup lang="ts">`. Do not introduce Options API, mixins, filters, or class components.
- Keep TypeScript **strict**. Never use `any`. Prefer `unknown` + narrowing. Never add `// @ts-ignore` or `as any` to silence errors.
- Use `vue-tsc` for type-checking, not `tsc`. Do not weaken `tsconfig` (`strict`, `noUncheckedIndexedAccess`, path aliases).
- Colocate by **feature** as the app grows. Do not dump everything into `components/` and `views/`.
- Keep components small and single-purpose. Move reusable logic into composables (`useXxx`).
- Do not put secrets in `VITE_*` env vars — they are inlined into the client bundle.

## Default stack

Currently installed and in use:

| Concern | Choice |
|---|---|
| UI components | SFCs, Composition API, typed props/emits |
| Shared logic | Composables (`src/features/<name>/composables`) |
| Global client state | Module-scope `ref`/`computed` inside a composable (e.g. `useResumeLocale`, `useResumeTheme`), persisted via `localStorage` with try/catch |
| Unit tests | Vitest + Vue Test Utils |
| Lint / format | ESLint 10 flat config (`typescript-eslint` + `eslint-plugin-vue`) + Prettier |
| CSS | Scoped SFC styles + CSS variables (`assets/styles/tokens.css`, `base.css`) |

Not installed — do not add speculatively; bring in only when a real requirement needs it, and prefer the smallest fix first:

| Concern | If actually needed |
|---|---|
| Multiple routes | Vue Router + typed routes (`unplugin-vue-router`) |
| State outgrowing a composable | Pinia setup store |
| Remote/server data with caching | TanStack Vue Query (or Pinia Colada) — do not cache HTTP in Pinia |
| HTTP calls | `ofetch` or native `fetch` with typed wrappers, not untyped axios |
| DOM/lifecycle/browser helpers | VueUse — don't reimplement its primitives |
| E2E coverage | Playwright |
| Component-level DOM assertions beyond Vue Test Utils | Testing Library |
| Utility-first CSS | Tailwind/UnoCSS, only if the project adopts one |

Do not add Vuex, Vetur, webpack, or runtime `PropTypes`.

## File structure

Actual current layout — match it for new code, don't invent `router/`, `stores/`, or a top-level `composables/`/`types/` unless the project actually grows a second route or a real cross-feature store:

```
src/
  assets/styles/           # tokens.css, base.css
  components/              # shared, presentational UI only (no feature logic)
  features/<name>/         # feature module
    composables/           # feature-scoped composables (+ __tests__)
    data/                  # static content modules (no Vue APIs)
    locales/               # translated copy per locale
    ui/                    # feature components (+ __tests__)
    utils/                 # pure functions (+ __tests__)
    types.ts               # feature's shared types
  App.vue
  main.ts
```

- Import via `@/` (`@/features/resume/data/jobs`).
- One component per file. File name = component name (`ResumeHeader.vue`).
- Composables: `useResumeLocale.ts`. If a store is ever introduced: `useXxxStore.ts`.
- Keep `data/` and `utils/` free of Vue reactivity. If it needs `ref` / lifecycle, it belongs in `composables/`.
- Tests live next to what they cover, in `__tests__/`.

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
- **Small global client state** (locale, theme, ...) → module-scope `ref`/`computed` in a composable, exported as a singleton (see `useResumeLocale`, `useResumeTheme`). Every call site shares the same instance. Wrap `localStorage` reads/writes in try/catch and fall back to a sane default (private-browsing mode can throw).
- There is no router: the app is a single screen (`App.vue` → `ResumePage`). Don't add Vue Router for what is still one page.
- If cross-feature state genuinely outgrows a composable (many independent consumers, complex derived state), promote it to a Pinia setup store instead of growing an ad-hoc module singleton.
- There is no server data: content is static TS modules under `features/<name>/data/`. If the app ever fetches remote data, use a query library for the cache — don't hand-roll fetch+cache in a composable or store.
- App bootstrap in `main.ts`: run side-effect inits that must land before first paint (e.g. `initResumeTheme()`, `initResumeLocale()`) → `createApp(App).mount('#app')`. Add `app.use(...)` calls only when a plugin (router, Pinia, etc.) actually exists.

## Vite and TypeScript

- Env: only `VITE_*` is exposed to the client. No custom env vars exist yet (only built-ins like `import.meta.env.BASE_URL`, used in `data/pdf.ts`). If you add one, type it in `env.d.ts` via `ImportMetaEnv`. Access through `import.meta.env`, never `process.env`.
- Keep the `@` alias in both `vite.config.ts` and `tsconfig.app.json`.
- Use `import type { Foo } from '...'` for type-only imports.
- Prefer official Vite plugins. Do not add webpack-era loaders or `vite-plugin-vue2`.
- Code-split heavy widgets (if any appear) with `() => import(...)` or `defineAsyncComponent`.
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
- [ ] No router/Pinia/HTTP client added without a real need; new env vars are typed
- [ ] Styles are scoped (or existing global strategy)
- [ ] Types pass (`vue-tsc`); tests added for non-trivial logic
- [ ] `format`, `lint`, `lint:css` (if styles changed), `type-check`, and `test` have been run and pass

## Additional resources

- Patterns and APIs: [reference.md](reference.md)
- Copy-paste examples: [examples.md](examples.md)
