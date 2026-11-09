import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

const nodeGlobals = { console: 'readonly', process: 'readonly', URL: 'readonly' };

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/', 'playwright-report/', 'test-results/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  {
    files: ['scripts/**', 'src/lib/**/*.mjs', 'astro.config.mjs'],
    languageOptions: { globals: nodeGlobals },
  },
];
