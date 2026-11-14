import pluginVitest from '@vitest/eslint-plugin';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript';
import { globalIgnores } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  // SSR-энтри выполняется в Node во время сборки. Типами это не поймать:
  // tsconfig без DOM пришлось бы применить ко всему графу импортов от App.vue,
  // куда законно входят клиентские useResumeTheme / useResumeLocale.
  {
    name: 'app/ssr-entry',
    files: ['src/entry-server.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        'document',
        'window',
        'localStorage',
        'navigator',
        'location',
      ],
    },
  },

  skipFormatting,

  // Placed after skipFormatting so Prettier's config cannot switch them off.
  // Prettier preserves blank lines but never inserts them, so the padding rule
  // is ours to enforce.
  {
    name: 'app/code-style',
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'prefer-arrow-callback': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: ['if', 'for'] },
        { blankLine: 'always', prev: ['if', 'for'], next: '*' },
      ],
    },
  },
);
