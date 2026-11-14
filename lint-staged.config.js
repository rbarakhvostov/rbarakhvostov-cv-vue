export default {
  '*': 'prettier --write --ignore-unknown',
  '*.{css,vue}': 'stylelint --cache',
  '*.{ts,mts,tsx,vue}': 'eslint --cache',
};
