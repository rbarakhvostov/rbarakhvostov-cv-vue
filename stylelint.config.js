/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-standard-vue'],
  rules: {
    // Token groups in tokens.css are separated by blank lines.
    'custom-property-empty-line-before': null,
    // Existing SFC styles use BEM element selectors (`block__el`).
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*)((--|__|-|_)[a-z0-9]+)*$',
      {
        message: 'Expected class selector to be kebab-case or BEM',
      },
    ],
  },
};
