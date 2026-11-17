import { describe, expect, it } from 'vitest'

import {
  dateLabel,
  photoStyle,
  slashDate,
  spokenDateLabel,
  validDate,
  validateVisit,
} from './record'
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
  it('訪問期間は異なる部分だけを終了日に書き、月・年をまたいでも読み違えない', () => {
    expect(dateLabel({ startDate: '2026-01-01', endDate: '2026-01-01' })).toBe(
      '2026年1月1日',
    )
    expect(dateLabel({ startDate: '2026-01-01', endDate: '2026-01-03' })).toBe(
      '2026年1月1日-3日',
    )
    expect(dateLabel({ startDate: '2026-01-30', endDate: '2026-02-02' })).toBe(
      '2026年1月30日-2月2日',
    )
    expect(dateLabel({ startDate: '2025-12-30', endDate: '2026-01-02' })).toBe(
      '2025年12月30日-2026年1月2日',
    )
    expect(
      spokenDateLabel({ startDate: '2026-01-01', endDate: '2026-01-03' }),
    ).toBe('2026年1月1日から3日')
  })
  it('入力欄の日付は先頭の0を省いて表示する', () => {
    expect(slashDate('2026-01-09')).toBe('2026/1/9')
  })
})
