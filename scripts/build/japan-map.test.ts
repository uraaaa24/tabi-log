import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import frame from '../../src/features/map/domain/map-frame.json'
import prefectures from '../../src/features/map/domain/prefectures.json'
import { generateParts } from './japan-map'

type Point = readonly [number, number]
type Part = (typeof prefectures)[number]
const rings = (part: Part): Point[][] =>
  (part.path.match(/M[^Z]+Z/gu) ?? []).map((ring) =>
    [...ring.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/gu)].map((match) => [
      Number(match[1]),
      Number(match[2]),
    ]),
  )
const edges = (part: Part) =>
  new Set(
    rings(part).flatMap((ring) =>
      ring.map((point, index) => {
        const a = point.join(',')
        const b = ring[(index + 1) % ring.length]?.join(',') ?? ''
        return a < b ? `${a}/${b}` : `${b}/${a}`
      }),
    ),
  )
const containsPin = (part: Part) =>
  rings(part).filter(
    (ring) =>
      ring.filter(([x, y], index) => {
        const next = ring[(index + 1) % ring.length]
        if (!next) {
          return false
        }
        const [nx, ny] = next
        return (
          y > part.y !== ny > part.y &&
          part.x < ((nx - x) * (part.y - y)) / (ny - y) + x
        )
      }).length %
        2 ===
      1,
  ).length %
    2 ===
  1

describe('木製パーツ用に簡略化した47都道府県', () => {
  it('微細な輪郭を抑え、全県のピンをパーツの内側に置く', () => {
    const count = prefectures
      .flatMap(rings)
      .reduce((total, ring) => total + ring.length, 0)
    expect(count).toBeLessThan(1000)
    for (const part of prefectures) {
      expect(containsPin(part), part.name).toBe(true)
      for (const ring of rings(part)) {
        expect(ring.length, part.name).toBeGreaterThanOrEqual(3)
      }
    }
  })
  it('隣り合う県が、ずれのない同じ境界線を共有する', () => {
    for (const [left, right] of [
      [13, 14],
      [20, 21],
      [25, 26],
      [38, 39],
      [40, 41],
    ]) {
      const a = prefectures[(left ?? 0) - 1]
      const b = prefectures[(right ?? 0) - 1]
      if (!a || !b) {
        throw new Error('missing prefecture')
      }
      const boundary = edges(b)
      expect(
        [...edges(a)].filter((edge) => boundary.has(edge)).length,
        `${a.name}/${b.name}`,
      ).toBeGreaterThan(0)
    }
  })
})

const sharedEdge: readonly Point[] = Array.from(
  { length: 21 },
  (_value, index) => [131 + (index % 2) * 0.015, 36 + index * 0.1],
)
const fixture: Parameters<typeof generateParts>[0] = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 1, nam_ja: '左の県' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [[[130, 36], ...sharedEdge, [130, 38], [130, 36]]],
          [
            [
              [129, 35],
              [129.2, 35],
              [129.2, 35.2],
              [129, 35.2],
              [129, 35],
            ],
          ],
          [
            [
              [129, 34],
              [129.02, 34],
              [129.02, 34.02],
              [129, 34.02],
              [129, 34],
            ],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 2, nam_ja: '右の県' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[131, 36], [132, 36], [132, 38], ...sharedEdge.toReversed()],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { id: 3, nam_ja: '島の県' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [133, 35],
            [133.2, 35],
            [133.2, 35.2],
            [133, 35.2],
            [133, 35],
          ],
        ],
      },
    },
  ],
}

it('生成処理は共有境界をまとめて簡略化し、小島を整理しても県を欠落させない', () => {
  const parts = generateParts(fixture)
  expect(parts.map((part) => part.id)).toEqual(['JP-01', 'JP-02', 'JP-03'])
  const [left, right] = parts
  if (!left || !right) {
    throw new Error('missing pieces')
  }
  expect(rings(left)).toHaveLength(2)
  expect(containsPin({ ...left, x: 156.2, y: 294.3 })).toBe(true)
  expect(rings(left)[0]?.length).toBeLessThan(10)
  const other = edges(right)
  expect([...edges(left)].filter((edge) => other.has(edge))).toHaveLength(1)
  expect(parts.every(containsPin)).toBe(true)
}, 15000)

it('出典ファイルのチェックサムが違う場合は生成を拒否する', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'tabi-map-test-'))
  try {
    const source = path.join(directory, 'untrusted.geojson')
    writeFileSync(source, JSON.stringify(fixture))
    const result = spawnSync(
      process.execPath,
      ['scripts/build/japan-map.ts', source],
      {
        encoding: 'utf8',
      },
    )
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Source checksum mismatch')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

it('主要な島や半島の代表的な内陸地点を削り落とさない', () => {
  const locations = [
    [47, '沖縄本島', 127.9, 26.5],
    [47, '宮古島', 125.3, 24.78],
    [47, '石垣島', 124.18, 24.45],
    [47, '西表島', 123.85, 24.32],
    [46, '屋久島', 130.52, 30.35],
    [46, '種子島', 130.98, 30.58],
    [46, '奄美大島', 129.4, 28.3],
    [42, '対馬', 129.31, 34.43],
    [42, '壱岐', 129.72, 33.78],
    [42, '福江島', 128.75, 32.7],
    [17, '能登半島', 136.9, 37.4],
    [2, '下北半島・恐山付近', 141.125, 41.32],
  ] as const
  for (const [id, name, longitude, latitude] of locations) {
    const part = prefectures[id - 1]
    if (!part) {
      throw new Error('missing prefecture')
    }
    expect(
      containsPin({
        ...part,
        x: (longitude - 122) * 22,
        y: (46 - latitude) * 27,
      }),
      name,
    ).toBe(true)
  }
})

it('すべての輪郭が余白付きの全体表示に収まり、端の島も切れない', () => {
  for (const point of prefectures.flatMap(rings).flat()) {
    expect(point[0]).toBeGreaterThanOrEqual(frame.x + 16)
    expect(point[0]).toBeLessThanOrEqual(frame.x + frame.width - 16)
    expect(point[1]).toBeGreaterThanOrEqual(frame.y + 16)
    expect(point[1]).toBeLessThanOrEqual(frame.y + frame.height - 16)
  }
})
