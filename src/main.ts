import { createApp, createSSRApp } from 'vue';

import App from './App.vue';
import './assets/styles/tokens.css';
import './assets/styles/base.css';
import { initResumeLocale } from './features/resume/composables/useResumeLocale';
import { initResumeTheme } from './features/resume/composables/useResumeTheme';

// Выводится из URL и детерминирована: сервер отрендерил ровно эту локаль.
// Должна встать до гидратации — от неё зависит всё дерево.
initResumeLocale();

const container = document.querySelector('#app');

// `npm run dev` отдаёт index.html как есть, без пререндера: гидрировать там
// нечего, и createSSRApp сыпал бы предупреждениями о несовпадении на каждой
// перезагрузке. В сборке #app всегда непустой.
const app =
  container && container.childElementCount > 0
    ? createSSRApp(App)
    : createApp(App);

app.mount('#app');

// А вот тема известна только на клиенте (localStorage / prefers-color-scheme),
// поэтому инициализируется ПОСЛЕ mount. До mount она рассинхронизировала бы
// клиентский vnode с пререндеренной разметкой, а Vue при гидратации не
// переприменяет `class` — он идёт отдельным patch-флагом и не попадает в
// dynamicProps. Переключатель темы навсегда подсветил бы «тёмную», причём
// без предупреждения в проде. После mount это обычное реактивное обновление:
// оно сбрасывается в микротаске, то есть до отрисовки, а `html[data-theme]`
// уже выставлен инлайн-скриптом — вспышки нет.
initResumeTheme();
