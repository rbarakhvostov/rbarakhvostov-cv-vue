/** @type {import('lint-staged').Configuration} */
export default {
  '*': 'prettier --write --ignore-unknown',
  '*.{css,vue}': 'stylelint --cache',
  '*.{ts,mts,tsx,vue}': [
    'eslint --cache',
    () => 'npm run type-check',
    'vitest related --run --passWithNoTests',
  ],
};
