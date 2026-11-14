export default {
  extends: ['stylelint-config-standard', 'stylelint-config-standard-vue'],
  rules: {
    'custom-property-empty-line-before': null,
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*)((--|__|-|_)[a-z0-9]+)*$',
      {
        message: 'Expected class selector to be kebab-case or BEM',
      },
    ],
  },
};
