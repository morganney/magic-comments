import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import jest from 'eslint-plugin-jest'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', '__tests__/__fixtures__/**']
  },
  {
    files: ['**/*.{js,ts,cts,mts}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.es2023,
        ...globals.node,
        ...globals.jest
      }
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jest.configs['flat/recommended'],
  {
    rules: {
      'no-console': 'error'
    }
  }
]
