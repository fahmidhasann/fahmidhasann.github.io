import js from '@eslint/js';
import globals from 'globals';

/**
 * The site scripts are classic (non-module) browser scripts served as-is, so
 * they are linted separately from the Node-side tooling and tests.
 */
export default [
  {
    ignores: ['node_modules/**', 'graphify-out/**', 'test-results/**', 'playwright-report/**']
  },
  js.configs.recommended,
  {
    name: 'site-scripts',
    files: ['script.js', 'v2/script.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        // Loaded from CDNs at runtime; absent when the CDN is unreachable.
        gsap: 'readonly',
        ScrollTrigger: 'readonly',
        particlesJS: 'readonly'
      }
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'multi-line'],
      'no-implicit-globals': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    name: 'tooling',
    files: ['*.config.js', 'tests/**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      // Specs run in Node, but page.evaluate() callbacks execute in the browser.
      globals: { ...globals.node, ...globals.browser }
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always']
    }
  }
];
