import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores(['dist', 'dist-ssr']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // 프리렌더 전용 엔트리. 컴포넌트가 아닌 값을 export하지만 브라우저 번들에
    // 포함되지 않으므로 Fast Refresh 제약을 적용하지 않는다.
    files: ['src/entry-server.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
]);
