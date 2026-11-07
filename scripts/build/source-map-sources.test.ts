import { describe, expect, it } from 'vitest'

import { checkBundleSources } from './bundle-sources'
import { sourceMapSources } from './source-map-sources'

const plain = (sources: string[]) => ({ version: 3, sources })
const indexed = (...maps: unknown[]) => ({
  version: 3,
  sections: maps.map((map, index) => ({
    offset: { line: index * 10, column: 0 },
    map,
  })),
})
describe('Metroの通常・分割ソースマップ', () => {
  it('SDK 57形式とSDK 58形式のすべてのセクションからソースを読む', () => {
    expect(sourceMapSources(plain(['src/app/index.tsx']))).toEqual([
      'src/app/index.tsx',
    ])
    expect(
      sourceMapSources(
        indexed(
          plain(['__prelude__']),
          indexed(
            plain(['src/app/index.tsx']),
            plain(['src/components/TravelUI.tsx']),
          ),
        ),
      ),
    ).toEqual([
      '__prelude__',
      'src/app/index.tsx',
      'src/components/TravelUI.tsx',
    ])
  })
  it('後ろのセクションに混入したStorybookも製品バンドルとして拒否する', () => {
    const map = indexed(
      plain(['src/app/index.tsx', 'src/components/TravelUI.tsx']),
      plain(['src/components/PaperCard.stories.tsx']),
    )
    expect(checkBundleSources(sourceMapSources(map), 'product')).not.toEqual([])
  })
  it.each([
    null,
    {},
    { version: 2, sources: [] },
    { version: 3, sources: [123] },
    { version: 3, sections: [] },
    {
      version: 3,
      sections: [{ offset: { line: 0, column: 0 }, url: 'external.map' }],
    },
    { version: 3, sources: [], sections: [] },
  ])('不正な構造を検査済みとして扱わない: %j', (map) => {
    expect(() => sourceMapSources(map)).toThrow('Invalid source map')
  })
})
