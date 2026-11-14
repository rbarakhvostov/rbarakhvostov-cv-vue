import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// Расширение обязательно: без него Vite не сможет загрузить конфиг нативным
// загрузчиком, который станет умолчанием в следующей мажорной версии.
import { prerender } from './vite/prerender.ts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), prerender()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
