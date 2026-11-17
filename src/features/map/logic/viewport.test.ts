import { describe, expect, it } from 'vitest'

import {
  anchoredOffset,
  boundedOffset,
  filledCamera,
  fittedMapSize,
  mapTransform,
  projectPoint,
} from './viewport'

const frame = { x: 0, y: 0, width: 550, height: 760 }

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
    const content = fittedMapSize(390, 740, frame)
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
    expect(
      boundedOffset(raw, 740, 1, fittedMapSize(390, 740, frame).height),
    ).toBe(0)
  })
  it('横長画面でも、画面内に収まる軸の移動は固定する', () => {
    const content = fittedMapSize(740, 390, frame)
    expect(content.height).toBe(390)
    expect(boundedOffset(300, 740, 2, content.width)).toBe(0)
    expect(boundedOffset(-300, 390, 2, content.height)).toBe(-195)
  })
  it('SVG内部の拡大でも画面上の移動距離と中心を維持する', () => {
    const matrix = mapTransform(3, 60, -90, 0.75, frame)
    expect((matrix[0] * 275 + matrix[4] - 275) * 0.75).toBe(60)
    expect((matrix[3] * 380 + matrix[5] - 380) * 0.75).toBe(-90)
    expect(mapTransform(1, 0, 0, 0, frame)).toEqual([1, 0, 0, 1, 0, 0])
  })
  it('原点がゼロでない表示範囲でも、地図の中心を動かさず拡大する', () => {
    const shifted = { x: 100, y: 20, width: 200, height: 400 }
    const matrix = mapTransform(4, 25, -10, 0.5, shifted)
    expect((matrix[0] * 200 + matrix[4] - 200) * 0.5).toBe(25)
    expect((matrix[3] * 220 + matrix[5] - 220) * 0.5).toBe(-10)
  })
  it('ピンは拡大・移動しても地図上の同じ地点に留まる', () => {
    const shifted = { x: 100, y: 20, width: 200, height: 400 }
    const [scale, offsetX, offsetY, drawing] = [2.5, 30, -12, 1.6]
    const matrix = mapTransform(scale, offsetX, offsetY, drawing, shifted)
    const [pointX, pointY] = [150, 300]
    // Where the SVG viewBox (centred, uniformly scaled) draws the point.
    const drawnX =
      160 + (matrix[0] * pointX + matrix[4] - (shifted.x + 100)) * drawing
    const drawnY =
      320 + (matrix[3] * pointY + matrix[5] - (shifted.y + 200)) * drawing
    expect(projectPoint(pointX, 200, 320, drawing, scale, offsetX)).toBeCloseTo(
      drawnX,
    )
    expect(projectPoint(pointY, 220, 640, drawing, scale, offsetY)).toBeCloseTo(
      drawnY,
    )
  })
})

describe('横長の世界地図の最初の表示', () => {
  const world = { x: -500, y: -250, width: 1000, height: 500 }

  it('縦長の画面の上下に余白を残さず、指定した地点を中央に置く', () => {
    const camera = filledCamera(400, 800, world, { x: 0, y: 0 })
    expect(camera.scale).toBe(4)
    expect(camera.x).toBeCloseTo(0)
    expect(camera.y).toBeCloseTo(0)
    // The fitted map is 400 × 200; at 4× it covers the 800-tall screen.
    expect(200 * camera.scale).toBeGreaterThanOrEqual(800)
  })

  it('地点が端に近くても、地図の外の余白が見えるところまでは動かさない', () => {
    const camera = filledCamera(400, 800, world, { x: 480, y: 0 })
    const drawingScale = 400 / world.width
    // The right edge of the map stays on or beyond the right of the screen.
    expect(
      projectPoint(500, 0, 400, drawingScale, camera.scale, camera.x),
    ).toBeGreaterThanOrEqual(400)
    expect(camera.x).toBe(-600)
  })

  it('画面の大きさが未確定のうちは等倍のままにする', () => {
    expect(filledCamera(0, 0, world, { x: 0, y: 0 })).toEqual({
      scale: 1,
      x: 0,
      y: 0,
    })
  })
})
