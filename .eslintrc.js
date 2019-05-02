const tsRecommended = require('@typescript-eslint/eslint-plugin/dist/configs/recommended.json').rules

module.exports = {
  extends: ['eslint-config-quick'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        ...tsRecommended,
        indent: 0,
        camelcase: 0,
        'no-array-constructor': 0,
        'no-useless-constructor': 0,
        'node/no-unsupported-features/es-syntax': 0,
        'import/prefer-default-export': 0,
        '@typescript-eslint/adjacent-overload-signatures': 1,
        '@typescript-eslint/array-type': 1,
        '@typescript-eslint/ban-types': 1,
        '@typescript-eslint/camelcase': 1,
        '@typescript-eslint/class-name-casing': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/explicit-member-accessibility': 1,
        '@typescript-eslint/indent': 0,
        '@typescript-eslint/interface-name-prefix': 0,
        '@typescript-eslint/member-delimiter-style': 1,
        '@typescript-eslint/no-angle-bracket-type-assertion': 1,
        '@typescript-eslint/no-array-constructor': 1,
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-inferrable-types': 0,
        '@typescript-eslint/no-misused-new': 2,
        '@typescript-eslint/no-namespace': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-object-literal-type-assertion': 1,
        '@typescript-eslint/no-parameter-properties': 0,
        '@typescript-eslint/no-triple-slash-reference': 0,
        '@typescript-eslint/member-delimiter-style': [
          1,
          {
            multiline: {
              delimiter: 'none',
              requireLast: false
            },
            singleline: {
              delimiter: 'comma',
              requireLast: false
            }
          }
        ],
        '@typescript-eslint/no-unused-vars': [
          1,
          {
            args: 'after-used',
            ignoreRestSiblings: true,
            vars: 'all'
          }
        ],
        '@typescript-eslint/no-use-before-define': [
          2,
          {
            classes: false,
            functions: false
          }
        ],
        '@typescript-eslint/no-var-requires': 1,
        '@typescript-eslint/prefer-interface': 1,
        '@typescript-eslint/prefer-namespace-keyword': 1,
        '@typescript-eslint/type-annotation-spacing': 1
      }
    }
  ]
}
