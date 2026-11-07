import { describe, expect, it } from 'vitest'

import { photoStyle, validDate, validateVisit } from './record'
import type { Visit } from './record'

const visit: Visit = {
  id: '1',
  placeId: 'JP-13',
  startDate: '2024-02-29',
  endDate: '2024-02-29',
  diary: '',
  transports: [],
  otherTransport: '',
  photos: [],
  createdAt: '',
  updatedAt: '',
}
describe('訪問日の検証', () => {
  it('閏日と不正な暦日を区別する', () => {
    expect(validDate('2024-02-29')).toBe(true)
    expect(validDate('2025-02-29')).toBe(false)
    expect(validDate('2025-04-31')).toBe(false)
    expect(validDate('')).toBe(false)
  })
  it('日付だけの記録を許可し、未来日・逆転・日付未選択を拒否する', () => {
    expect(() => validateVisit(visit, '2024-02-29')).not.toThrow()
    expect(() => validateVisit(visit, '2024-02-28')).toThrow('未来')
    expect(() => validateVisit({ ...visit, endDate: '2024-02-28' })).toThrow(
      '終了日',
    )
    expect(() => validateVisit({ ...visit, startDate: '' })).toThrow('訪問日')
  })
  it('その他の交通手段は説明を要求する', () => {
    expect(() => validateVisit({ ...visit, transports: ['その他'] })).toThrow(
      '交通手段',
    )
  })
  it('写真の追加削除でも同じIDの配置特性は変わらない', () => {
    const first = photoStyle('first')
    photoStyle('another')
    expect(photoStyle('first')).toEqual(first)
    expect(first.rotation).toBeGreaterThanOrEqual(-2.5)
    expect(first.size).toBeLessThanOrEqual(0.96)
  })
})
