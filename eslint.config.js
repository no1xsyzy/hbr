// // import { defineConfig } from 'eslint-define-config'
// import typescript from 'typescript'

// export default {
//   files: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.svelte'],
//   // root: true,
//   // parser: '@typescript-eslint/parser',
//   // extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
//   // plugins: ['svelte3', '@typescript-eslint'],
//   // overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
//   // settings: {
//   //   'svelte3/typescript': () => typescript,
//   // },
//   // parserOptions: {
//   //   sourceType: 'module',
//   //   ecmaVersion: 2020,
//   // },
//   // env: {
//   //   browser: true,
//   //   es2017: true,
//   //   node: true,
//   // },
// }

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['**/dist/**', 'src/lib/tau-prolog.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
)
