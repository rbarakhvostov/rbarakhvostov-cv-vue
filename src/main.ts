import { createApp } from 'vue';

import App from './App.vue';
import './assets/styles/tokens.css';
import './assets/styles/base.css';
import { initResumeLocale } from './features/resume/composables/useResumeLocale';
import { initResumeTheme } from './features/resume/composables/useResumeTheme';

initResumeTheme();
initResumeLocale();

createApp(App).mount('#app');
