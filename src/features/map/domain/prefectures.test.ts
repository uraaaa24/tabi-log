import { expect, it } from 'vitest'

import prefectures from './prefectures.json'

it('47都道府県を欠かさず、形状と固定ID・ピン位置を持つ', () => {
  expect(prefectures.map((place) => place.id)).toEqual(
    Array.from(
      { length: 47 },
      (_value, index) => `JP-${String(index + 1).padStart(2, '0')}`,
    ),
  )
  expect(new Set(prefectures.map((place) => place.name)).size).toBe(47)
  for (const place of prefectures) {
    expect(place.path).toMatch(/^M/)
    expect(place.path).not.toMatch(/NaN|undefined/)
    expect(place.x).toBeGreaterThan(0)
    expect(place.x).toBeLessThan(550)
    expect(place.y).toBeGreaterThan(0)
    expect(place.y).toBeLessThan(760)
  }
})
