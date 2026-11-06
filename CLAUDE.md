# CLAUDE.md

> Зеркало [.cursor/skills/vue-typescript-vite/SKILL.md](.cursor/skills/vue-typescript-vite/SKILL.md) (тот же контент на английском, для Cursor). При изменении правил в одном файле — переносить изменение в другой.

Правила для работы Claude в этом репозитории. Стек: Vue 3.5+, Composition API, TypeScript (strict, `noUncheckedIndexedAccess`), Vite 8, `@` → `src`, `vue-tsc --build` для проверки типов.

Это **статичное одностраничное приложение-резюме** (см. [README.md](README.md)): один экран, без бэкенда, контент резюме — в локальных TS-модулях. Сейчас две фичи: `resume` и `feedback`. Роутера, Pinia и HTTP-клиента здесь намеренно нет — не добавлять их "про запас". Единственный сетевой вызов — форма обратной связи: один `fetch` POST с `FormData` на Web3Forms (`features/feedback`). Глобальное состояние (локаль, тема) — модульные `ref` внутри composable-ов. Оба значения берутся из `localStorage`, иначе из системы (`navigator.languages`, `prefers-color-scheme`), иначе `en` и `dark`. Пока тему не выбрали вручную, она продолжает следовать `prefers-color-scheme`; явный выбор это слежение отключает. Язык разрешается один раз при старте и дальше за системой не ходит. Роутер / store / query-библиотеку / VueUse / HTTP-обёртку добавлять только когда для этого появится реальная задача, и сначала пробовать самое простое решение.

## Обязательные правила

- Только **Composition API** с `<script setup lang="ts">`. Не использовать Options API, mixins, filters, class components.
- TypeScript **strict**. Никогда не использовать `any`. Предпочитать `unknown` + сужение типов. Не добавлять `// @ts-ignore` или `as any`.
- Для проверки типов использовать `vue-tsc`, а не `tsc`. Не ослаблять `tsconfig` (`strict`, `noUncheckedIndexedAccess`, path aliases).
- Группировать код по **фичам** по мере роста приложения, не сваливать всё в `components/` и `views/`.
- Компоненты — маленькие и однозадачные. Переиспользуемую логику выносить в composables (`useXxx`).
- Не хранить секреты в `VITE_*` env-переменных — они попадают в клиентский бандл.

## Стек по умолчанию

Сейчас установлено и используется:

| Что                             | Выбор                                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| UI-компоненты                   | SFC, Composition API, типизированные props/emits                                                                             |
| Общая логика                    | Composables (`src/features/<name>/composables`)                                                                              |
| Глобальное клиентское состояние | Модульные `ref`/`computed` внутри composable (`useResumeLocale`, `useResumeTheme`), персист в `localStorage` через try/catch |
| Юнит-тесты                      | Vitest + Vue Test Utils                                                                                                      |
| Lint / format                   | ESLint 10 flat config (`typescript-eslint` + `eslint-plugin-vue`) + Prettier, плюс правила стиля (см. «Стиль кода»)          |
| CSS                             | Scoped SFC-стили + CSS-переменные (`assets/styles/tokens.css`, `base.css`)                                                   |

Не установлено — не добавлять "про запас"; вносить только под реальную задачу, сначала пробовать самое простое:

| Что                              | Если реально понадобится                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| Несколько роутов                 | Vue Router + типизированные роуты (`unplugin-vue-router`)                            |
| Состояние, переросшее composable | Pinia setup store                                                                    |
| Удалённые данные с кэшем         | TanStack Vue Query (или Pinia Colada). Не кэшировать HTTP в Pinia                    |
| HTTP-запросы                     | `ofetch` или нативный `fetch` с типизированными обёртками, не нетипизированный axios |
| DOM/lifecycle/browser-хелперы    | VueUse — не переизобретать их                                                        |
| E2E-покрытие                     | Playwright                                                                           |
| DOM-ассерты сверх Vue Test Utils | Testing Library                                                                      |
| Utility-first CSS                | Tailwind/UnoCSS, только если проект их примет                                        |

Не добавлять Vuex, Vetur, webpack, runtime `PropTypes`.

## Структура файлов

Актуальная текущая раскладка — ориентироваться на неё для нового кода, не придумывать `router/`, `stores/` или top-level `composables/`/`types/`, пока в проекте реально не появится второй роут или настоящий кросс-фичевый стор:

```
src/
  assets/styles/           # tokens.css, base.css
  components/              # общие презентационные компоненты (без логики фичи)
  features/<name>/         # модуль фичи
    composables/           # composables фичи (+ __tests__)
    data/                  # статичные модули с контентом (без Vue API)
    locales/               # переводы по локалям
    ui/                    # компоненты фичи (+ __tests__)
    utils/                 # чистые функции (+ __tests__)
    types.ts               # общие типы фичи
  App.vue
  main.ts
```

- Импорт через `@/` (`@/features/resume/data/jobs`).
- Один компонент — один файл. Имя файла = имя компонента (`ResumeHeader.vue`).
- Composables: `useResumeLocale.ts`. Если когда-нибудь появится стор: `useXxxStore.ts`.
- В `data/` и `utils/` не должно быть Vue-реактивности. Если нужен `ref`/lifecycle — это composable. Тело отправки формы собирается в `features/feedback/data/web3forms.ts` (обычный `FormData`, без Vue).
- Тесты лежат рядом с тем, что проверяют, в `__tests__/`.
- Каталог `api/` не заводить, пока не появится второе удалённое API. Отправка формы остаётся разовым `fetch` в `useFeedbackForm`.

## Правила для SFC

Порядок блоков: `<script setup lang="ts">`, затем `<template>`, затем `<style scoped>`.

- Типизированные `defineProps` / `defineEmits`. Предпочитать `defineModel` для `v-model`.
- Vue 3.5+: деструктуризация `defineProps()` реактивна — не оборачивать эти поля в `toRefs` без необходимости.
- Использовать `useTemplateRef<HTMLInputElement>('input')` вместо `ref()` + типизации `ref="input"`.
- Типизировать слоты через `defineSlots`. `defineExpose` — только если родителю действительно нужно вызывать методы.
- У `v-for` всегда стабильный `:key` (id, не индекс, кроме статичных списков).
- Никогда не использовать `v-html` с недоверенным контентом.
- Предпочитать семантический HTML и нативные элементы. ARIA — только если нативной семантики недостаточно.

## Стиль кода

Проверяется ESLint (`func-style`, `prefer-arrow-callback`, `padding-line-between-statements`), а не только договорённостью:

- Только **стрелочные функции**, включая экспортируемые: `export const useXxx = () => {}`, не `export function useXxx() {}`. Из-за этого функция недоступна до строки своего объявления — порядок в модуле имеет значение.
- Пустая строка **до и после** блоков `if` и `for`, и **перед** каждым `return`. Первый оператор в блоке — исключение: перед ним пустая строка не нужна.

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

## Реактивность и script setup

- `ref` для примитивов и заменяемых значений. `reactive` — только для целостного объектного состояния, которое не переприсваивается целиком.
- Не деструктурировать `reactive()`-объект без `toRefs`/`toRef`.
- Производные значения → `computed`, а не `watch`, который пишет в другой ref.
- Побочные эффекты → `watch`/`watchEffect` с явной очисткой. Предпочитать `{ once: true }` или `watchEffect` + `onScopeDispose`.
- В composables принимать `MaybeRefOrGetter<T>`, читать через `toValue()`.
- `shallowRef`/`shallowReactive` для больших деревьев или сторонних инстансов (графики, карты, редакторы).
- Не хранить реактивное состояние в `utils/`. Не мутировать props.

## Composables

- Имя: `useXxx`. Возвращать **именованный объект**, а не позиционный кортеж (кроме устоявшихся API вида `[state, setState]`).
- Регистрировать листенеры, интервалы, observers с очисткой на `onScopeDispose`.
- Держать composables framework-agnostic на границах: принимать refs/getters, возвращать refs/computed.
- Не создавать composable, который используется один раз и не даёт переиспользования/тестируемости — оставить логику в компоненте.

## Состояние, роутинг, данные

- **Локальное UI-состояние** — в компоненте. Поля формы, ошибки полей и статус тоста живут в `useFeedbackForm`, потому что тесты покрывают именно отправку — это по-прежнему один composable, а не стор.
- **Небольшое глобальное клиентское состояние** (локаль, тема) → модульные `ref`/`computed` внутри composable, экспортированные как синглтон (см. `useResumeLocale`, `useResumeTheme`). Все вызовы разделяют один и тот же экземпляр. Чтение/запись `localStorage` оборачивать в try/catch с разумным значением по умолчанию (приватный режим может бросить исключение). Пустой `catch` — только для этого известного сбоя, и в нём нужен комментарий, почему он пустой.
- Порядок разрешения обоих значений: сохранённый выбор, иначе система (`navigator.languages` для языка, `prefers-color-scheme` для темы), иначе `en` / `dark`. `setTheme` записывает выбор и снимает слежение за системной темой. `setLocale` записывает выбор; после старта язык за системой не ходит. Ключи storage: `rb-resume-lang` и `rb-resume-theme`.
- Подписка на системную тему создаётся из `initResumeTheme()` в `main.ts`, вне scope компонента, поэтому `onScopeDispose` тут не срабатывает. Снимать её явно — в `setTheme` и при повторном init.
- До первой отрисовки инлайн-скрипт в `index.html` ставит `html[data-theme]` и `html[lang]` по тем же правилам и с теми же ключами storage. `main.ts` — отложенный модуль; без этого скрипта светлая или русская первая загрузка мигнула бы тёмной английской. Скрипт и composable-ы должны оставаться согласованными.
- Роутера нет: приложение — один экран (`App.vue` → `ResumePage`). Не добавлять Vue Router ради одной страницы.
- Если кросс-фичевое состояние реально перерастёт composable (много независимых потребителей, сложные производные значения) — поднимать его до Pinia setup store, а не растить ad-hoc модульный синглтон.
- Контент резюме — статичные TS-модули в `features/resume/data/`. Форма обратной связи — разовый `fetch` (refs `status` / `errorReason`), а не кэш серверных данных. Если приложение когда-нибудь начнёт загружать удалённые данные на экран — кэш держать через query-библиотеку, а не ручным fetch+кэш в composable или сторе.
- Bootstrap приложения в `main.ts`: сначала side-effect инициализации, которые должны отработать до первой отрисовки (`initResumeTheme()`, `initResumeLocale()`) → `createApp(App).mount('#app')`. Вызовы `app.use(...)` добавлять только когда реально появится плагин (роутер, Pinia и т.п.).
- Посещаемость считает тег GoatCounter в конце `index.html` (`count.v5.js` с хешем `integrity`). Это не npm-зависимость, не composable и не env-переменная. Не переносить счётчик внутрь Vue-приложения.

## Vite и TypeScript

- Env: наружу торчит только `VITE_*`. Единственная своя переменная — необязательный `VITE_WEB3FORMS_ACCESS_KEY`, типизирован в `env.d.ts`, шаблон в `.env.example`. Это публикуемый ключ доступа (Web3Forms ограничивает его списком доменов), и он попадает в бандл — `.env` всё равно не коммитить, а настоящие секреты в `VITE_*` не класть. Отсутствующий ключ — обработанная ошибка формы, а не падение приложения. Встроенный `import.meta.env.BASE_URL` используется в `features/resume/data/pdf.ts`. Доступ через `import.meta.env`, никогда не через `process.env`. Новую переменную типизировать в `ImportMetaEnv`.
- Держать alias `@` синхронизированным в `vite.config.ts` и `tsconfig.app.json`.
- Использовать `import type { Foo } from '...'` для type-only импортов.
- Предпочитать официальные Vite-плагины. Не добавлять webpack-era loaders или `vite-plugin-vue2`.
- Тяжёлые виджеты (если появятся) разбивать через `() => import(...)` или `defineAsyncComponent`.
- Продакшн-проверка: `npm run build` должен проходить `vue-tsc --build` и сборку Vite.

## Планка качества перед завершением задачи

После правок исходников — прогнать проверки и исправить ошибки до завершения задачи:

```bash
npm run format
npm run lint
npm run lint:css
npm run type-check
npm run test
```

- Сначала `format` (`prettier --write .`), чтобы lint и остальное видели отформатированные файлы.
- `test` — одиночный прогон (`vitest run`), используется в CI, pre-commit и перед завершением. `test:watch` — watch-режим. `test:coverage` пишет v8-отчёт в терминал и `coverage/`.
- `lint:css` запускать при изменении CSS или `<style>` в Vue-файлах. `lint` и `type-check` — при любом TS/Vue изменении.
- Если проверка падает — исправить причину и перезапустить именно эту проверку. Не завершать задачу, пока проверки не проходят.

Husky pre-commit: `lint-staged --concurrent false && npm run type-check && npm run test`:

- **lint-staged** работает по файлам: Prettier на всех staged-файлах, Stylelint на CSS/Vue, ESLint на TS/Vue.
- **type-check** и **test** — общепроектные, их не кладут в lint-staged (`vue-tsc` и тестовый набор игнорируют списки staged-путей).

## Чек-лист перед сдачей изменений

- [ ] SFC использует `<script setup lang="ts">` с типизированными props/emits
- [ ] Нет `any`, нет неиспользуемого реактивного состояния, нет мутации props
- [ ] Composables чистят подписки
- [ ] У списков стабильные ключи; у асинхронной работы есть loading/error/empty состояния
- [ ] Роутер/Pinia/HTTP-клиент не добавлены без реальной необходимости; новые env-переменные типизированы
- [ ] Стили scoped (или соответствуют существующей глобальной стратегии)
- [ ] Типы проходят (`vue-tsc`); для нетривиальной логики добавлены тесты
- [ ] `format`, `lint`, `lint:css` (если менялись стили), `type-check`, `test` — запущены и проходят
