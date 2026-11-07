import { defineConfig } from 'oxfmt'

export default defineConfig({
  printWidth: 80,
  trailingComma: 'all',
  arrowParens: 'always',
  sortTailwindcss: { config: './tailwind.config.cjs' },
  sortImports: {
    groups: [
      ['type-builtin', 'value-builtin', 'type-external', 'value-external'],
      [
        'type-internal',
        'value-internal',
        'type-subpath',
        'value-subpath',
        'type-parent',
        'value-parent',
        'type-sibling',
        'value-sibling',
        'type-index',
        'value-index',
      ],
      'unknown',
    ],
    newlinesBetween: true,
    sortSideEffects: false,
  },
  singleAttributePerLine: true,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: false,
  ignorePatterns: [
    'docs/mockups/**',
    'pnpm-lock.yaml',
    'storybook-static/**',
    '.rnstorybook/storybook.requires.ts',
    'dist/**',
  ],
})
