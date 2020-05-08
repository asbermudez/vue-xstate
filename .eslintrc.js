module.exports = {
  root: true,
  env: { node: true },
  extends: ['plugin:vue/essential', '@vue/airbnb', '@vue/typescript/recommended'],
  parserOptions: { ecmaVersion: 2020 },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? ['error', { allow: ['error', 'warn'] }] : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/prefer-default-export': 0,
    // https://stackoverflow.com/a/55863857
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.spec.ts'] }],
    'class-methods-use-this': 0,
    'max-len': [
      'error',
      {
        code: 120,
        comments: 120,
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'quote-props': ['error', 'as-needed'],
    'default-case': 0,
    'no-unused-expressions': 0,
    'linebreak-style': 0,
    'comma-dangle': ['error', 'always-multiline'],
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'object-curly-newline': ['error', { multiline: true }],
    'function-paren-newline': 0,
    'implicit-arrow-linebreak': 0,
    'arrow-parens': ['error', 'always'],
    '@typescript-eslint/no-inferrable-types': 0,
    'operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
  },
  overrides: [
    {
      files: ['**/*.spec.{j,t}s?(x)'],
      env: { jest: true },
    },
  ],
};
