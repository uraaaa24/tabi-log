import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { partsFrame } from './japan-map.ts'
import { countries, mergedInto } from './world-countries.ts'

type Point = readonly [number, number]
type Polygon = readonly (readonly Point[])[]
type Area =
  | Readonly<{
      type: 'Polygon'
      coordinates: Polygon
    }>
  | Readonly<{
      type: 'MultiPolygon'
      coordinates: readonly Polygon[]
    }>
type SourceCollection = Readonly<{
  features: readonly Readonly<{
    properties: Readonly<{ ADM0_A3: string }>
    geometry: Area | null
  }>[]
}>
type Properties = Readonly<{
  id: string
  name: string
  selectable: boolean
}>
type Collection = Readonly<{
  features: readonly Readonly<{
    properties: Properties
    geometry: Area | null
  }>[]
}>
type PointCollection = Readonly<{
  features: readonly Readonly<{
    properties: Properties
    geometry: Readonly<{ type: 'Point'; coordinates: Point }> | null
  }>[]
}>
export type Country = Readonly<{
  id: string
  name: string
  path: string
  x: number
  y: number
  // Too small to tap even at the largest zoom; drawn with a round token.
  small: boolean
}>

const sourceSha256 =
  '3e458fc036ad0a66411f2c1e6cac49c5d7bfb81cb1123bc513b22511a2b7fdeb'
// 木の板に置く平面の長方形の地図。日本の学校地図と同じミラー図法の太平洋中心で、
// 大西洋（西経30度）で切れ、日本が中央付近に来る。
const projection = '+proj=mill +lon_0=150'
// 全幅約4,008万mを、およそ1,000単位の地図座標にする。
const worldMeters = 40_075_017
const metersPerUnit = 40_000
// 1単位は赤道付近で約40km。赤道付近で約800km²未満の島は、国の最大パーツを除いて省く。
const minimumPartArea = 0.5
// 最大20倍でも指で押せる大きさにならない国には、丸い選択駒を置く。
const smallCountrySize = 2.5

const ringArea = (ring: readonly Point[]) =>
  Math.abs(
    ring.reduce((sum, point, index) => {
      const next = ring[(index + 1) % ring.length]
      return next ? sum + point[0] * next[1] - next[0] * point[1] : sum
    }, 0),
  ) / 2
const polygonArea = (polygon: Polygon) => {
  const outer = polygon[0]
  return outer
    ? ringArea(outer) -
        polygon.slice(1).reduce((sum, ring) => sum + ringArea(ring), 0)
    : 0
}
const polygonsOf = (geometry: Area) =>
  geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
const ringBounds = (ring: readonly Point[]) => {
  const xs = ring.map((point) => point[0])
  const ys = ring.map((point) => point[1])
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  }
}

const runMapshaper = (args: readonly string[]) => {
  const command = createRequire(import.meta.url).resolve(
    'mapshaper/bin/mapshaper',
  )
  const result = spawnSync(process.execPath, [command, ...args], {
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 64 * 1024 * 1024,
  })
  if (result.status !== 0) {
    throw new Error(result.error?.message ?? result.stderr)
  }
}

// Each source feature becomes one of the 195 countries, part of one, or land
// that is drawn but cannot be chosen (territories, disputed areas).
export function labelFeatures(data: SourceCollection): Collection {
  return {
    features: data.features
      .filter((feature) => feature.properties.ADM0_A3 !== 'ATA')
      .map((feature) => {
        const code =
          mergedInto[feature.properties.ADM0_A3] ?? feature.properties.ADM0_A3
        const country = countries[code]
        return {
          properties: country
            ? { id: country[0], name: country[1], selectable: true }
            : { id: `x-${code}`, name: '', selectable: false },
          geometry: feature.geometry,
        }
      }),
  }
}

export function generateWorld(data: Collection) {
  const directory = mkdtempSync(path.join(tmpdir(), 'tabi-world-'))
  try {
    const source = path.join(directory, 'source.geojson')
    const projected = path.join(directory, 'projected.geojson')
    const input = path.join(directory, 'input.geojson')
    const shapes = path.join(directory, 'pieces.geojson')
    const centers = path.join(directory, 'centers.geojson')
    writeFileSync(
      source,
      JSON.stringify({
        type: 'FeatureCollection',
        features: data.features.map((feature) => ({
          type: 'Feature',
          ...feature,
        })),
      }),
    )
    runMapshaper([
      source,
      '-proj',
      projection,
      '-o',
      projected,
      'format=geojson',
    ])
    const world = JSON.parse(readFileSync(projected, 'utf8')) as Collection
    const worldWidth = worldMeters / metersPerUnit
    const features = world.features.flatMap((feature) => {
      if (!feature.geometry) {
        return []
      }
      // SVG座標は下向きなので南北を反転する。
      const polygons = polygonsOf(feature.geometry).map((polygon) =>
        polygon.map((ring) =>
          ring.map(
            ([x, y]) => [x / metersPerUnit, -y / metersPerUnit] as const,
          ),
        ),
      )
      const areas = polygons.map(polygonArea)
      const largest = areas.indexOf(Math.max(...areas))
      const anchor = ringBounds(polygons[largest]?.[0] ?? [])
      const anchorX = anchor.x + anchor.width / 2
      const kept = polygons.filter((polygon, index) => {
        if (index === largest) {
          return true
        }
        const box = ringBounds(polygon[0] ?? [])
        // 大西洋の切れ目の反対側へ回った小島（アゾレス諸島の西端など）は、
        // 同じ国の駒が地図の両端に分かれないよう省く。
        const wrapped =
          feature.properties.selectable &&
          Math.abs(box.x + box.width / 2 - anchorX) > worldWidth / 2
        return !wrapped && (areas[index] ?? 0) >= minimumPartArea
      })
      return [
        {
          type: 'Feature',
          properties: feature.properties,
          geometry: { type: 'MultiPolygon' as const, coordinates: kept },
        },
      ]
    })
    writeFileSync(
      input,
      JSON.stringify({ type: 'FeatureCollection', features }),
    )
    runMapshaper([
      input,
      '-clean',
      'snap-interval=0.005',
      'gap-width=0.01',
      '-explode',
      '-simplify',
      'weighted',
      'variable',
      'interval=Math.min(1.4, Math.sqrt($.area)*0.12)',
      'planar',
      'keep-shapes',
      '-dissolve',
      'id',
      'copy-fields=name,selectable',
      '-o',
      shapes,
      'format=geojson',
      'precision=0.01',
      '-points',
      'inner',
      '-o',
      centers,
      'format=geojson',
      'precision=0.01',
    ])
    const pieces = JSON.parse(readFileSync(shapes, 'utf8')) as Collection
    const points = JSON.parse(readFileSync(centers, 'utf8')) as PointCollection
    const toPath = (geometry: Area) =>
      polygonsOf(geometry)
        .flat()
        .map((ring) => {
          const first = ring[0]
          const last = ring.at(-1)
          const closed =
            first && last && first[0] === last[0] && first[1] === last[1]
          const vertices = closed ? ring.slice(0, -1) : ring
          return `M${vertices.map(([x, y]) => `${x},${y}`).join(' L')} Z`
        })
        .join(' ')
    const placed: Country[] = pieces.features
      .filter((feature) => feature.properties.selectable)
      .toSorted((a, b) => a.properties.id.localeCompare(b.properties.id))
      .map((feature) => {
        const geometry = feature.geometry
        const center = points.features.find(
          (point) => point.properties.id === feature.properties.id,
        )?.geometry?.coordinates
        if (!geometry || !center) {
          throw new Error(`Country disappeared: ${feature.properties.id}`)
        }
        // キプロス・ソマリアは元の2地物を合わせた面積と比べる。
        const originalArea = features
          .filter((item) => item.properties.id === feature.properties.id)
          .flatMap((item) => item.geometry.coordinates)
          .reduce((sum, polygon) => sum + polygonArea(polygon), 0)
        const displayed = polygonsOf(geometry)
        const ratio =
          displayed.reduce((sum, polygon) => sum + polygonArea(polygon), 0) /
          originalArea
        // 小さな国は駒で選ぶため、大きな国だけで形の過度な変化を拒否する。
        if (
          originalArea >= 4 &&
          (!Number.isFinite(ratio) || ratio < 0.8 || ratio > 1.2)
        ) {
          throw new Error(
            `Country area distorted: ${feature.properties.id} (${ratio})`,
          )
        }
        const largest = displayed
          .map((polygon) => polygon[0] ?? [])
          .toSorted((a, b) => ringArea(b) - ringArea(a))[0]
        const box = ringBounds(largest ?? [])
        return {
          id: feature.properties.id,
          name: feature.properties.name,
          path: toPath(geometry),
          x: center[0],
          y: center[1],
          small: Math.max(box.width, box.height) < smallCountrySize,
        }
      })
    const land = pieces.features
      .filter((feature) => !feature.properties.selectable)
      .flatMap((feature) =>
        feature.geometry ? [toPath(feature.geometry)] : [],
      )
      .join(' ')
    const expected = new Set(
      data.features
        .filter((feature) => feature.properties.selectable)
        .map((feature) => feature.properties.id),
    )
    if (placed.length !== expected.size) {
      throw new Error('The number of countries changed during simplification')
    }
    return { countries: placed, land }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function main() {
  const sourcePath = process.argv[2]
  if (!sourcePath) {
    throw new Error(
      'Usage: pnpm map:world <pinned ne_50m_admin_0_countries.geojson>',
    )
  }
  const source = readFileSync(sourcePath)
  if (createHash('sha256').update(source).digest('hex') !== sourceSha256) {
    throw new Error(
      'Source checksum mismatch; review provenance before changing the map.',
    )
  }
  const { countries: placed, land } = generateWorld(
    labelFeatures(JSON.parse(source.toString()) as SourceCollection),
  )
  if (placed.length !== 195) {
    throw new Error(`Expected 195 countries, got ${placed.length}`)
  }
  writeFileSync(
    'src/features/map/domain/countries.json',
    `${JSON.stringify(placed)}\n`,
  )
  writeFileSync(
    'src/features/map/domain/world-land.json',
    `${JSON.stringify({ path: land })}\n`,
  )
  writeFileSync(
    'src/features/map/domain/world-frame.json',
    `${JSON.stringify(partsFrame([...placed, { path: land }]))}\n`,
  )
  const vertices = [...placed.map((place) => place.path), land].reduce(
    (total, value) => total + (value.match(/[ML]/gu) ?? []).length,
    0,
  )
  console.log(
    `Generated 195 countries (${placed.filter((place) => place.small).length} small) with ${vertices} vertices.`,
  )
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main()
}
