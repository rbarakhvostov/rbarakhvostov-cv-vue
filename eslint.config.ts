import pluginVitest from '@vitest/eslint-plugin';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript';
import { globalIgnores } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility';

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  pluginVueA11y.configs['flat/recommended'],

  {
    name: 'app/a11y-overrides',
    files: ['**/*.vue'],
    rules: {
      'vuejs-accessibility/no-redundant-roles': 'off',

      'vuejs-accessibility/label-has-for': [
        'error',
        { required: { some: ['nesting', 'id'] } },
      ],
    },
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

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
