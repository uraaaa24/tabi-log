import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import countries from '../../src/features/map/domain/countries.json'
import frame from '../../src/features/map/domain/world-frame.json'
import land from '../../src/features/map/domain/world-land.json'
import { generateWorld, labelFeatures } from './world-map'

type Point = readonly [number, number]
type Shape = Readonly<{ path: string; x: number; y: number }>
const rings = (shape: Readonly<{ path: string }>): Point[][] =>
  (shape.path.match(/M[^Z]+Z/gu) ?? []).map((ring) =>
    [...ring.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/gu)].map((match) => [
      Number(match[1]),
      Number(match[2]),
    ]),
  )
const edges = (shape: Shape) =>
  new Set(
    rings(shape).flatMap((ring) =>
      ring.map((point, index) => {
        const a = point.join(',')
        const b = ring[(index + 1) % ring.length]?.join(',') ?? ''
        return a < b ? `${a}/${b}` : `${b}/${a}`
      }),
    ),
  )
const containsPin = (shape: Shape) =>
  rings(shape).filter(
    (ring) =>
      ring.filter(([x, y], index) => {
        const next = ring[(index + 1) % ring.length]
        if (!next) {
          return false
        }
        const [nx, ny] = next
        return (
          y > shape.y !== ny > shape.y &&
          shape.x < ((nx - x) * (shape.y - y)) / (ny - y) + x
        )
      }).length %
        2 ===
      1,
  ).length %
    2 ===
  1
const country = (id: string) => {
  const found = countries.find((place) => place.id === id)
  if (!found) {
    throw new Error(`missing ${id}`)
  }
  return found
}

describe('木製パーツ用に簡略化した世界195か国', () => {
  it('国連加盟国193とオブザーバー国2を固定IDで欠かさず持ち、地域は選べない', () => {
    expect(countries).toHaveLength(195)
    expect(new Set(countries.map((place) => place.id)).size).toBe(195)
    expect(new Set(countries.map((place) => place.name)).size).toBe(195)
    for (const place of countries) {
      expect(place.id).toMatch(/^[A-Z]{2}$/u)
    }
    for (const id of ['JP', 'VA', 'PS', 'SS', 'TV', 'FR', 'NO']) {
      expect(countries.map((place) => place.id)).toContain(id)
    }
    for (const id of ['TW', 'XK', 'HK', 'GL', 'EH', 'AQ']) {
      expect(countries.map((place) => place.id)).not.toContain(id)
    }
    // Territories and disputed areas are drawn, but only as plain land.
    expect(rings(land).length).toBeGreaterThan(10)
  })

  it('全ての国のピンを輪郭の内側に置き、頂点数を抑える', () => {
    const count = [...countries, land]
      .flatMap(rings)
      .reduce((total, ring) => total + ring.length, 0)
    expect(count).toBeLessThan(10000)
    for (const place of countries) {
      expect(containsPin(place), place.name).toBe(true)
    }
  })

  it('拡大しても押せない小さな国だけに選択駒を置く', () => {
    for (const id of ['VA', 'MC', 'SM', 'LI', 'AD', 'MT', 'SG', 'TV', 'NR']) {
      expect(country(id).small, id).toBe(true)
    }
    for (const id of ['FR', 'DE', 'JP', 'BE', 'CH', 'IL', 'QA']) {
      expect(country(id).small, id).toBe(false)
    }
  })

  it('隣り合う国が、ずれのない同じ国境線を共有する', () => {
    for (const [left, right] of [
      ['FR', 'DE'],
      ['US', 'CA'],
      ['CN', 'MN'],
      ['BR', 'AR'],
      ['IT', 'VA'],
    ] as const) {
      const boundary = edges(country(right))
      expect(
        [...edges(country(left))].filter((edge) => boundary.has(edge)).length,
        `${left}/${right}`,
      ).toBeGreaterThan(0)
    }
  })

  it('太平洋中心で日本が中央付近、ヨーロッパが左、アメリカ大陸が右に来る', () => {
    const centre = frame.x + frame.width / 2
    expect(Math.abs(country('JP').x - centre)).toBeLessThan(frame.width * 0.06)
    expect(country('FR').x).toBeLessThan(centre - frame.width * 0.3)
    expect(country('BR').x).toBeGreaterThan(centre + frame.width * 0.3)
    // Fiji and Kiribati straddle 180° and must stay whole near the centre.
    expect(Math.abs(country('FJ').x - centre)).toBeLessThan(frame.width * 0.2)
  })

  it('平面の長方形の地図として、全ての輪郭が余白付きの表示範囲に収まる', () => {
    expect(frame.width / frame.height).toBeGreaterThan(1.7)
    for (const point of [...countries, land].flatMap(rings).flat()) {
      expect(point[0]).toBeGreaterThanOrEqual(frame.x + 16)
      expect(point[0]).toBeLessThanOrEqual(frame.x + frame.width - 16)
      expect(point[1]).toBeGreaterThanOrEqual(frame.y + 16)
      expect(point[1]).toBeLessThanOrEqual(frame.y + frame.height - 16)
    }
  })
})

const square = (lon: number, lat: number, size: number) => [
  [
    [lon, lat],
    [lon + size, lat],
    [lon + size, lat + size],
    [lon, lat + size],
    [lon, lat],
  ] as Point[],
]

describe('元データの国への対応付け', () => {
  it('南極を除き、195か国以外は選べない陸地にし、北キプロス・ソマリランドは国連の認める国に含める', () => {
    const labelled = labelFeatures({
      features: [
        ['FRA', 0],
        ['TWN', 10],
        ['CYN', 20],
        ['SOL', 30],
        ['ATA', 40],
      ].map(([code, lon]) => ({
        properties: { ADM0_A3: String(code) },
        geometry: { type: 'Polygon', coordinates: square(Number(lon), 0, 1) },
      })),
    })
    expect(labelled.features.map((feature) => feature.properties)).toEqual([
      { id: 'FR', name: 'フランス', selectable: true },
      { id: 'x-TWN', name: '', selectable: false },
      { id: 'CY', name: 'キプロス', selectable: true },
      { id: 'SO', name: 'ソマリア', selectable: true },
    ])
  })
})

it('生成処理は大西洋の切れ目の反対側へ回った小島を省き、国と選べない陸地を分ける', () => {
  const { countries: placed, land: other } = generateWorld({
    features: [
      {
        properties: { id: 'AA', name: '左の国', selectable: true },
        geometry: {
          type: 'MultiPolygon',
          // The island west of 30°W wraps to the far right edge.
          coordinates: [square(-20, 30, 8), square(-36, 30, 2)],
        },
      },
      {
        properties: { id: 'BB', name: '右の国', selectable: true },
        geometry: { type: 'Polygon', coordinates: square(-12, 30, 8) },
      },
      {
        properties: { id: 'x-CCC', name: '', selectable: false },
        geometry: { type: 'Polygon', coordinates: square(100, 0, 4) },
      },
    ],
  })
  expect(placed.map((place) => place.id)).toEqual(['AA', 'BB'])
  const [left, right] = placed
  if (!left || !right) {
    throw new Error('missing countries')
  }
  expect(rings(left)).toHaveLength(1)
  expect(placed.every(containsPin)).toBe(true)
  expect([...edges(left)].filter((edge) => edges(right).has(edge)).length).toBe(
    1,
  )
  expect(rings({ path: other })).toHaveLength(1)
}, 30000)

it('出典ファイルのチェックサムが違う場合は生成を拒否する', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'tabi-world-test-'))
  try {
    const source = path.join(directory, 'untrusted.geojson')
    writeFileSync(source, JSON.stringify({ features: [] }))
    const result = spawnSync(
      process.execPath,
      ['scripts/build/world-map.ts', source],
      { encoding: 'utf8' },
    )
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Source checksum mismatch')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
