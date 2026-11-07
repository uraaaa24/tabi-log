import { describe, expect, it } from 'vitest'

import { anchoredOffset, boundedOffset } from './viewport'

describe('指の位置を基準にした地図の拡大縮小', () => {
  it('中心以外でつまんでも、指の下の地図上の点を維持する', () => {
    const initialOffset = 20
    const initialScale = 1.5
    const initialFocal = 80
    const nextScale = 3
    const nextFocal = 110
    const offset = anchoredOffset(
      nextFocal,
      initialFocal,
      initialOffset,
      initialScale,
      nextScale,
    )
    const contentPoint = (initialFocal - initialOffset) / initialScale
    expect(contentPoint * nextScale + offset).toBe(nextFocal)
  })
  it('拡大した後の縮小でも同じ地点を追従する', () => {
    expect(anchoredOffset(80, 110, -10, 3, 1.5)).toBe(20)
  })
  it('拡大率に合わせて移動範囲を制限し、等倍では中央に戻す', () => {
    expect(boundedOffset(500, 390, 2)).toBe(195)
    expect(boundedOffset(-500, 390, 2)).toBe(-195)
    expect(boundedOffset(120, 390, 3)).toBe(120)
    expect(boundedOffset(120, 390, 1)).toBe(0)
  })
})
