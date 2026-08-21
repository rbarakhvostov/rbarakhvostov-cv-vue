# Vue + TypeScript + Vite — reference

Read this when implementing stores, routing, data fetching, Vite config, tests, or performance work. Follow [SKILL.md](SKILL.md) first.

## Pinia (setup stores)

Prefer setup syntax. Keep stores thin: state + actions that mutate client state. No HTTP caching.

```ts
export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const theme = ref<'light' | 'dark'>('light')

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  const isDark = computed(() => theme.value === 'dark')

  return { sidebarOpen, theme, isDark, toggleSidebar }
})
```

- Store id is a stable string. Do not rename casually (devtools + persistence).
- Return only what consumers need. Do not return private helpers.
- Use `storeToRefs(store)` in components when destructuring state/computed. Destructure actions as plain functions.
- Reset with `store.$reset` only on option stores; for setup stores, provide an explicit `reset()` action.
- Do not call `useXxxStore()` outside `setup`, composables, or other stores (no usage in plain `utils/`).

## Vue Router

- Lazy-load every route component except the app shell.
- Name routes. Navigate by name + params, not concatenated path strings.
- Type params. With `unplugin-vue-router`, do not hand-write `RouteRecordRaw` unions.
- Put auth/permission checks in `beforeEnter` or a global `beforeEach` that reads a typed session composable — not inside random views.
- Prefer `RouterView` + named views only when the layout actually has multiple outlets.
- Sync query/state carefully: query is serializable strings. Parse in a composable, do not sprinkle `route.query.foo as string` everywhere.

```ts
{
  path: '/users/:id',
  name: 'user-detail',
  component: () => import('@/features/users/UserDetailView.vue'),
  props: true,
}
```

## Data fetching

Component-local one-shots (user click, form submit): `async` function + `ref` for pending/error.

Lists, details, shared caches: TanStack Vue Query (or Pinia Colada).

```ts
export function useUser(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => ['users', toValue(id)] as const),
    queryFn: ({ signal }) => fetchUser(toValue(id), { signal }),
  })
}
```

- Pass `AbortSignal` into `fetch` / `ofetch`.
- Type DTOs at the API boundary. Map to domain types in one place (`features/<name>/api.ts`).
- Handle `pending`, `error`, `empty`, `success` in the UI. Do not leave a blank screen.

## provide / inject

Use only for deep, stable dependencies (theme, form context, current tree item). Type with `InjectionKey`.

```ts
export const formKey: InjectionKey<FormContext> = Symbol('form')
```

Do not use provide/inject as a global store. That is Pinia.

## Forms

- Native `<form @submit.prevent>` as the baseline.
- For complex forms: VeeValidate + Zod (or Valibot). Schema is the source of truth for types and messages.
- `defineModel` for field wrappers. Do not invent `value` + `input` emit pairs.
- Disable submit while pending. Surface field-level and form-level errors.

## Styling

- Default: `<style scoped>` + CSS custom properties on `:root` / `html`.
- `:deep()` only to style a child component's root or a documented slot target — not to pierce entire trees.
- `v-bind()` in CSS for values that must stay in sync with script state.
- Do not mix Tailwind utility soup with large scoped CSS files in the same feature unless the project already does.
- Prefer logical properties (`margin-inline`, `inset-block-start`) when touching layout.

## Vite

- Config via `defineConfig` in `vite.config.ts`. Keep plugins explicit and ordered: `vue()`, Vue DevTools, then others.
- Alias `@` must match `tsconfig` paths.
- `import.meta.glob` for generated route maps or icon sets — with eager: false unless the set is tiny.
- Do not `optimizeDeps.include` everything; add packages only when prebundling fails.
- Env files: `.env`, `.env.local` (gitignored), `.env.[mode]`. Never commit secrets.
- Build target: modern browsers (Vite default). Do not add legacy plugin unless a real requirement exists.
- Analyze bundles before adding a heavy dependency (charts, PDF, maps). Load those with `defineAsyncComponent`.

### `env.d.ts`

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Testing

- Unit: Vitest, same Vite resolve aliases.
- Component: Testing Library (`@testing-library/vue`) — assert what the user sees/does, not internal refs.
- Composables: call inside `setup()` via `createApp` helper or a tiny test host component. Test fake timers and cleanup.
- Mock network at the API module boundary, not `window.fetch` in every test unless that is the unit under test.
- E2E: Playwright against `vite preview` or a dedicated preview server. Do not use Cypress unless already in the repo.
- Keep `vue-tsc --build` in `npm run build` / CI. A green Vite build without type-check is not done.

## Performance

- Split routes and heavy widgets. Use `Suspense` around async setup / async components.
- `v-memo` on hot list rows when profiling shows render cost. Do not add it speculatively.
- `keep-alive` on layout `RouterView` only for screens that are expensive to recreate; set `include`.
- Avoid deep `watch` + `JSON.stringify`. Prefer explicit sources.
- Images: width/height, lazy loading, modern formats. Do not import huge assets into SFCs without reason.
- Lists: virtualize when rendering hundreds of rows.

## Accessibility and UX

- Buttons are `<button type="button">` (or `submit` in forms). Not `<div @click>`.
- Icon-only buttons need an accessible name (`aria-label` or visually hidden text).
- Manage focus when opening/closing dialogs. Prefer the native `<dialog>` or a well-tested library.
- Do not ship color-only status. Add text or an icon with a label.
- Respect `prefers-reduced-motion` for animations.

## Error handling

- App-level: `app.config.errorHandler`.
- Tree-level: `onErrorCaptured` in a layout/error boundary component.
- Async UI: feature-level error state, not only a global toast.
- Never swallow errors with empty `catch {}`.

## ESLint / TS hygiene

- `eslint-plugin-vue` essential + strongly-recommended, plus `vue/multi-word-component-names` with an allowlist for `App`.
- `@typescript-eslint` recommended-type-checked when CI cost is acceptable; otherwise recommended + `vue-tsc` in CI.
- Ban `any`, unused vars (`_` prefix allowed), `v-html` without an override comment that explains sanitization.
- `verbatimModuleSyntax`: type imports are `import type`.

## Deprecated / do not use

| Avoid | Use instead |
|---|---|
| Options API, mixins, filters | `script setup` + composables |
| Vuex | Pinia |
| Vetur | Vue - Official (Volar) |
| `h` render functions for ordinary UI | SFC templates |
| Runtime `props: { foo: String }` | Type-based `defineProps<{ foo: string }>()` |
| `this.$refs` | `useTemplateRef` |
| `process.env` | `import.meta.env` |
| Barrel `index.ts` that re-exports a whole feature | Direct imports (better tree-shaking, fewer cycles) |
