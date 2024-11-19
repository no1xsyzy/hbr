import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['**/dist/**', 'src/lib/tau-prolog.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
)
