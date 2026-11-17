import { describe, expect, it } from 'vitest'

import prefectures from '../domain/prefectures.json'
import { mainBounds, pathBounds, squareViewBox } from './shape'

describe('pathBounds', () => {
  it('covers every vertex of a multi-part outline', () => {
    expect(pathBounds('M1,2 L5,2 L5,8 Z M-3.5,4 L0,4 L0,5 Z')).toEqual({
      x: -3.5,
      y: 2,
      width: 8.5,
      height: 6,
    })
  })

  it('rejects an outline without coordinate pairs', () => {
    expect(() => pathBounds('M1 Z')).toThrow('輪郭の座標を読み取れません。')
  })

  it('places each prefecture pin inside its outline box', () => {
    for (const place of prefectures) {
      const box = pathBounds(place.path)
      expect(place.x).toBeGreaterThanOrEqual(box.x)
      expect(place.x).toBeLessThanOrEqual(box.x + box.width)
      expect(place.y).toBeGreaterThanOrEqual(box.y)
      expect(place.y).toBeLessThanOrEqual(box.y + box.height)
    }
  })
})

describe('squareViewBox', () => {
  it('centres a wide shape in a square with margin', () => {
    expect(squareViewBox({ x: 0, y: 0, width: 100, height: 20 }, 0.1)).toBe(
      '-10 -50 120 120',
    )
  })
})

describe('mainBounds', () => {
  it('ignores distant parts much smaller than the main land', () => {
    expect(
      mainBounds(
        'M0,0 L10,0 L10,10 L0,10 Z M3,20 L6,20 L6,23 Z M90,90 L91,90 L91,91 Z',
      ),
    ).toEqual({ x: 0, y: 0, width: 10, height: 10 })
  })

  it('keeps every part of a country made of comparable islands', () => {
    expect(
      mainBounds('M0,0 L10,0 L10,10 L0,10 Z M30,0 L38,0 L38,8 L30,8 Z'),
    ).toEqual({ x: 0, y: 0, width: 38, height: 10 })
  })
})
