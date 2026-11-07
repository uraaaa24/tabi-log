import { describe, expect, it } from 'vitest'

import {
  anchoredOffset,
  boundedOffset,
  fittedMapSize,
  mapTransform,
} from './viewport'

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
  it('縦長画面のSVG上下の余白を移動範囲に含めない', () => {
    const content = fittedMapSize(390, 740)
    expect(content.width).toBe(390)
    expect(content.height).toBeCloseTo(538.91, 2)
    expect(boundedOffset(200, 740, 1.2, content.height)).toBe(0)
    expect(boundedOffset(-200, 740, 1.2, content.height)).toBe(0)
    expect(boundedOffset(300, 740, 2, content.height)).toBeCloseTo(168.91, 2)
  })
  it('全体表示への縮小中に、焦点が端へ動いても移動できない', () => {
    const raw = anchoredOffset(160, 30, 100, 3, 1)
    expect(raw).not.toBe(0)
    expect(boundedOffset(raw, 390, 1, 390)).toBe(0)
    expect(boundedOffset(raw, 740, 1, fittedMapSize(390, 740).height)).toBe(0)
  })
  it('横長画面でも、画面内に収まる軸の移動は固定する', () => {
    const content = fittedMapSize(740, 390)
    expect(content.height).toBe(390)
    expect(boundedOffset(300, 740, 2, content.width)).toBe(0)
    expect(boundedOffset(-300, 390, 2, content.height)).toBe(-195)
  })
  it('SVG内部の拡大でも画面上の移動距離と中心を維持する', () => {
    const matrix = mapTransform(3, 60, -90, 0.75)
    expect((matrix[0] * 275 + matrix[4] - 275) * 0.75).toBe(60)
    expect((matrix[3] * 380 + matrix[5] - 380) * 0.75).toBe(-90)
    expect(mapTransform(1, 0, 0, 0)).toEqual([1, 0, 0, 1, 0, 0])
  })
})
