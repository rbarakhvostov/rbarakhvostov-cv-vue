---
name: vue-typescript-vite
description: Apply Vue 3 Composition API, TypeScript, and Vite best practices when writing, reviewing, or refactoring frontend code. Use when working with .vue SFCs, composables, Pinia, Vue Router, Vite, vue-tsc, or when the user asks to build or review a Vue + TypeScript + Vite app.
---

# Vue + TypeScript + Vite

> Mirrored in [CLAUDE.md](../../../CLAUDE.md) (same content in Russian, for Claude Code). When editing rules here, port the change there too.

Follow these practices for all Vue 3 + TypeScript + Vite work in this repo. Prefer current Vue 3 APIs over Vue 2 / Options API patterns.

This project is Vue 3.5+, Vite 8, TypeScript (strict, `noUncheckedIndexedAccess`), `@` → `src`, and `vue-tsc --build` for type-checking. Match that stack.

This is a **static, single-page resume app** (see `README.md`): one screen, no backend, resume content lives in local TS modules. Features today: `resume` and `feedback`. Deliberately no router, no Pinia, and no HTTP client library — don't add them speculatively. The only network call is the feedback form: one `fetch` POST of `FormData` to Web3Forms (`features/feedback`). There are two pages but no router: the build prerenders the same app into `dist/index.html` (EN) and `dist/ru/index.html` (RU) — search engines otherwise receive an empty `#app`. **Locale comes from the URL** (`/` → en, `/ru/` → ru), not from state: the language switch is plain links. Theme is a module-scope `ref` in a composable, resolved from `localStorage`, otherwise `prefers-color-scheme`, otherwise `dark`; until the visitor picks one explicitly it keeps following the system. Only add a router / store / query library / VueUse / HTTP wrapper when a real requirement needs it, and prefer the smallest solution first.

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
| Lint / format | ESLint 10 flat config (`typescript-eslint` + `eslint-plugin-vue` + `eslint-plugin-vuejs-accessibility`) + Prettier, plus the style rules under "Code style" |
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
  assets/styles/           # tokens.css, base.css (+ the Inter @font-face rules)
  components/              # shared, presentational UI only (no feature logic)
  features/<name>/         # feature module
    composables/           # feature-scoped composables (+ __tests__)
    data/                  # static content modules (no Vue APIs)
    locales/               # translated copy per locale
    ui/                    # feature components (+ __tests__)
    utils/                 # pure functions (+ __tests__)
    types.ts               # feature's shared types
  App.vue
  main.ts                  # client bootstrap (hydration)
  entry-server.ts          # SSR entry: renders both locales for the prerender
vite/
  prerender.ts             # build plugin: writes dist/ru/index.html and sitemap.xml
scripts/
  build-og-image.mjs       # one-off og-image.png generation, run by hand
```

- Import via `@/` (`@/features/resume/data/jobs`).
- One component per file. File name = component name (`ResumeHeader.vue`).
- Composables: `useResumeLocale.ts`. If a store is ever introduced: `useXxxStore.ts`.
- Keep `data/` and `utils/` free of Vue reactivity. If it needs `ref` / lifecycle, it belongs in `composables/`. The feedback payload is built in `features/feedback/data/web3forms.ts` (plain `FormData`, no Vue).
- Tests live next to what they cover, in `__tests__/`.
- Do not add an `api/` directory until a second remote integration exists. The feedback submit stays a one-shot `fetch` in `useFeedbackForm`.

## SFC rules

Block order: `<script setup lang="ts">`, then `<template>`, then `<style scoped>`.

```vue
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  count?: number;
}>();

const emit = defineEmits<{
  select: [id: string];
  close: [];
}>();

const { title, count = 0 } = props;
const doubled = computed(() => count * 2);
</script>

<template>
  <article>
    <h2>{{ title }}</h2>
    <button type="button" @click="emit('select', '1')">Select</button>
  </article>
</template>

<style scoped>
article {
  display: grid;
  gap: 0.5rem;
}
</style>
```

- Type-based `defineProps` / `defineEmits`. Prefer `defineModel` for `v-model`.
- Vue 3.5+: destructuring `defineProps()` is reactive. Do not wrap those fields in extra `toRefs` unless needed.
- Use `useTemplateRef<HTMLInputElement>('input')` instead of `ref()` + `ref="input"` typing hacks.
- Type slots with `defineSlots`. Expose instance API with `defineExpose` only when a parent must call methods.
- `v-for` always has a **stable** `:key` (id, not index, unless the list is static).
- Never use `v-html` with untrusted content.
- Prefer semantic HTML and native elements. Add ARIA only when native semantics are insufficient.
- Give every `<ul>` with `list-style: none` an explicit `role="list"`: Safari/VoiceOver drops list semantics otherwise. That is why `vuejs-accessibility/no-redundant-roles` is turned off.
- Check any new text or control-border colour for contrast (WCAG AA — 4.5:1 for text, 3:1 for borders and the focus ring) in both themes before committing. Start muted text at `color-mix(... 72%, transparent)`; below that the light theme fails AA.

## Code style

Enforced by ESLint (`func-style`, `prefer-arrow-callback`, `padding-line-between-statements`), not by convention alone:

- Arrow functions only, exports included: `export const useXxx = () => {}`, never `export function useXxx() {}`. This gives up hoisting, so a function is unusable above its own declaration — order within a module matters.
- A blank line **before and after** `if` and `for` blocks, and **before** every `return`. The first statement in a block is exempt — it needs no blank line above it.

```ts
const readStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (isTheme(stored)) {
      return stored;
    }
  } catch {
    // private mode / blocked storage
  }

  return DEFAULT_THEME;
};
```

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
export const usePointer = (target: MaybeRefOrGetter<HTMLElement | null>) => {
  const x = ref(0);
  const y = ref(0);

  const onMove = (event: PointerEvent): void => {
    x.value = event.clientX;
    y.value = event.clientY;
  };

  watchEffect((onCleanup) => {
    const el = toValue(target);

    if (!el) {
      return;
    }

    el.addEventListener('pointermove', onMove);
    onCleanup(() => el.removeEventListener('pointermove', onMove));
  });

  return { x, y };
};
```

- Name: `useXxx`. Return a **named object**, not a positional tuple (unless a pair like `[state, setState]` is the established API).
- Register listeners, intervals, and observers with cleanup on `onScopeDispose`.
- Keep composables framework-agnostic at the edges: accept refs/getters, return refs/computeds.
- Do not create a composable that is only used once and has no reuse or test value — keep that logic in the component.

## State, routing, data fetching

- **Local UI state** lives in the component. Feedback fields, field errors, and toast status live in `useFeedbackForm` because the submit flow is what its tests cover — still one composable, not a store.
- **Small global client state** (locale, theme) → module-scope `ref`/`computed` in a composable, exported as a singleton (see `useResumeLocale`, `useResumeTheme`). Every call site shares the same instance. Wrap `localStorage` reads/writes in try/catch and fall back to a sane default (private-browsing mode can throw). An empty `catch` is only for that known failure, and it needs a comment saying why.
- Locale resolution is `localeFromPath(location.pathname)` — the URL wins, full stop. Persisting is a separate concern: `rememberLocale()` runs on an explicit toggle click, and that stored value is the only thing the inline redirect below reads. Theme resolution is: stored choice, otherwise `prefers-color-scheme`, otherwise `dark`; `setTheme` persists it and unsubscribes from the system theme. Storage keys are `rb-resume-lang` and `rb-resume-theme`.
- The system-theme listener is created from `initResumeTheme()` in `main.ts`, outside any component scope, so `onScopeDispose` does not apply. Remove it explicitly in `setTheme` and on a repeated init.
- Before first paint, an inline script in `index.html` sets `html[data-theme]` with the same rules and storage key as `useResumeTheme` — `main.ts` is deferred, and without it a light first visit would flash dark. Keep the two in lockstep.
- The same script decides whether to send `/` to `/ru/`: by the stored choice, or — when nothing has been chosen yet — by `navigator.languages`. Two invariants must hold: redirect **only from the root** (`/ru/` is an explicitly requested address), and consult `navigator` **only when nothing is stored**. Without the second one a Russian-locale browser could never reach the English version — the redirect fires before the deferred `main.ts` can run. The script never touches `html[lang]`; the prerender sets it.
- That decision table is covered by `composables/__tests__/inlineBootstrap.spec.ts`, which extracts the script straight out of `index.html` and runs it against stubbed globals. Change the script, change the test.
- There is no router, and two URLs don't need one: Netlify serves `dist/index.html` and `dist/ru/index.html` as static files, and `localeFromPath(location.pathname)` tells the app which locale it is rendering. A third locale is one entry in `LOCALE_PATHS` (`features/resume/data/seo.ts`) and one in `LOCALES` (`entry-server.ts`) — not Vue Router.
- The language switch renders `<a href>`, not buttons: a crawler has to see the link to the other version. It never mutates locale state; the browser navigates, and the click is reported through a `select` event that `rememberLocale` persists.
- `initResumeLocale` **persists nothing** — it only reads the URL. Writing the opened page's locale there is a trap: the inline script redirects away from `/` based on the stored value, so one visit to `/ru/` would lock the English version out forever. Only `rememberLocale` writes, i.e. only an explicit click.
- If cross-feature state genuinely outgrows a composable (many independent consumers, complex derived state), promote it to a Pinia setup store instead of growing an ad-hoc module singleton.
- Resume content is static TS under `features/resume/data/`. The feedback form is a one-shot `fetch` (`status` / `errorReason` refs), not cached server state. If the app ever loads remote data onto the screen, use a query library for that cache — don't hand-roll fetch+cache in a composable or store.
- Bootstrap in `main.ts` is **`initResumeLocale()` → `mount()` → `initResumeTheme()`**, and the order is not stylistic. Locale comes from the URL and is what the server rendered, so it must land before hydration. Theme is only knowable on the client: setting it before `mount` makes the client vnode disagree with the markup, and Vue **does not re-apply `class` during hydration** (it rides a separate patch flag and never reaches `dynamicProps`) — the theme toggle would highlight "dark" forever, with no warning in production. After `mount` it is an ordinary reactive update that flushes in a microtask, i.e. before paint. Add `app.use(...)` calls only when a plugin actually exists.
- Visit counts are a GoatCounter script tag at the end of `index.html` (`count.v5.js` with an `integrity` hash). It is not an npm dependency, not a composable, and not an env var. Don't fold it into the Vue app.

## Vite and TypeScript

- Env: only `VITE_*` is exposed to the client. The one custom var is optional `VITE_WEB3FORMS_ACCESS_KEY`, typed in `env.d.ts` and templated in `.env.example`. It is a publishable access key (Web3Forms restricts it with a domain allow-list) and it is inlined into the bundle — still do not commit `.env`, and do not put real secrets in `VITE_*`. A missing key is a handled form error, not a crash. Built-in `import.meta.env.BASE_URL` is used in `features/resume/data/pdf.ts`. Access through `import.meta.env`, never `process.env`. Type any new var on `ImportMetaEnv`.
- Keep the `@` alias in both `vite.config.ts` and `tsconfig.app.json`.
- Use `import type { Foo } from '...'` for type-only imports.
- Prefer official Vite plugins. Do not add webpack-era loaders or `vite-plugin-vue2`.
- Code-split heavy widgets (if any appear) with `() => import(...)` or `defineAsyncComponent`.
- Production check: `npm run build` must pass `vue-tsc --build` and the Vite build.
- Prerendering is a `closeBundle` plugin (`vite/prerender.ts`), not a separate npm script: CI runs `build-only` and Netlify runs `build`, so a script chained to one of them silently skips in the other. `apply: (_, env) => env.command === 'build' && !env.isSsrBuild` keeps it from invoking itself. No `package.json` script changes are needed.
- The plugin imports nothing from `src/`: `entry-server.ts` hands it finished strings (`head`, `html`) and it substitutes them. That keeps `src/` files out of the node tsconfig project, which has no DOM libs.
- Substitution uses `String.replace` with a **function** replacement — in a string replacement `$&`, `` $` `` and `$'` are control sequences, so a bullet like "saved $5M" would silently mangle the markup. The markers are `<!--app-head-->` and `<!--app-html-->`. Never pretty-print the result: one stray newline inside `#app` is a hydration text-node mismatch, which is why `dist` stays in `.prettierignore`.
- There is deliberately no `<Teleport>`. The toast layer in `FeedbackToast` is fixed-positioned but sits in the DOM right after the form: teleporting to `<body>` forced it to be the first node there (`hydrateTeleport` starts from `target.firstChild`), which put the toast at the very start of the tab order — roughly 19 Shift+Tabs back from the Send button. `position: fixed` works regardless, because no ancestor sets `transform` / `filter` / `contain`. Introducing such an ancestor would make the toast position against it instead — that is the price of dropping the teleport.

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
