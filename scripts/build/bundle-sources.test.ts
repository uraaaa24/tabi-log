import { describe, expect, it } from 'vitest'

import { checkBundleSources } from './bundle-sources'

const product = ['src/app/index.tsx', 'src/components/PaperCard.tsx']
const storybook = [
  '.rnstorybook/index.ts',
  'src/components/PaperCard.tsx',
  'src/components/PaperCard.stories.tsx',
  'node_modules/@storybook/react-native-ui-lite/dist/index.js',
]

describe('Metro bundle source boundaries', () => {
  it('accepts the product and native Storybook as separate entry graphs', () => {
    expect(checkBundleSources(product, 'product')).toEqual([])
    expect(checkBundleSources(storybook, 'storybook')).toEqual([])
  })

  it.each([
    '.rnstorybook/index.ts',
    '.storybook/preview.ts',
    'src/components/PaperCard.stories.tsx',
    'node_modules/@storybook/react-native/dist/index.js',
    'node_modules/.pnpm/@storybook+react-native@10.7.1/dist/index.js',
    'node_modules/storybook/dist/index.js',
  ])('rejects development code in the product: %s', (source) => {
    expect(checkBundleSources([...product, source], 'product')).not.toEqual([])
  })

  it('rejects an empty export or the wrong entry point', () => {
    expect(checkBundleSources([], 'product')).not.toEqual([])
    expect(checkBundleSources([], 'storybook')).not.toEqual([])
    expect(checkBundleSources(product, 'storybook')).not.toEqual([])
    expect(
      checkBundleSources([...storybook, ...product], 'storybook'),
    ).not.toEqual([])
  })

  it('requires both shared stories and the native UI runtime', () => {
    for (const missing of [
      '.rnstorybook/index.ts',
      'src/components/PaperCard.stories.tsx',
      'node_modules/@storybook/react-native-ui-lite/dist/index.js',
    ]) {
      expect(
        checkBundleSources(
          storybook.filter((source) => source !== missing),
          'storybook',
        ),
      ).not.toEqual([])
    }
  })

  it('recognizes Windows paths in source maps', () => {
    expect(
      checkBundleSources(
        product.map((source) => source.replaceAll('/', '\\')),
        'product',
      ),
    ).toEqual([])
    expect(
      checkBundleSources([...product, '.rnstorybook\\index.ts'], 'product'),
    ).not.toEqual([])
  })
})
