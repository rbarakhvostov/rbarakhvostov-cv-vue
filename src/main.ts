import { createApp, createSSRApp } from 'vue';

import App from './App.vue';
import './assets/styles/tokens.css';
import './assets/styles/base.css';
import { initResumeLocale } from './features/resume/composables/useResumeLocale';
import { initResumeTheme } from './features/resume/composables/useResumeTheme';

// Локаль выводится из URL, сервер отрендерил именно её — она обязана встать
// до гидратации.
initResumeLocale();

const container = document.querySelector('#app');

const app =
  container && container.childElementCount > 0
    ? createSSRApp(App)
    : createApp(App);

app.mount('#app');

// Тема известна только на клиенте, поэтому только ПОСЛЕ mount: до него
// клиентский vnode разошёлся бы с разметкой, а Vue при гидратации не
// переприменяет `class` — переключатель навсегда подсветил бы «тёмную».
initResumeTheme();
