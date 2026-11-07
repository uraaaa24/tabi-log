import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
type Properties = Readonly<{
  id: number
  nam_ja: string
}>
type Collection = Readonly<{
  type: 'FeatureCollection'
  features: readonly Readonly<{
    type: 'Feature'
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
type Part = Readonly<{
  id: string
  name: string
  path: string
  x: number
  y: number
}>
const sourceSha256 =
  'b2fa31a9ce37c006904a06b8afcaeaf5ceeff40ae365eca167e09fbfff052f00'
const projectRing = (ring: readonly Point[]) =>
  ring.map(([x, y]) => [(x - 122) * 22, (46 - y) * 27] as const)
const projectPolygon = (polygon: Polygon) => polygon.map(projectRing)

export function generateParts(data: Collection): Part[] {
  const directory = mkdtempSync(path.join(tmpdir(), 'tabi-map-'))
  try {
    const input = path.join(directory, 'projected.geojson')
    const shapes = path.join(directory, 'pieces.geojson')
    const centers = path.join(directory, 'centers.geojson')
    const features = data.features.map((feature) => {
      const geometry = feature.geometry
      if (!geometry) {
        throw new Error('Missing source geometry')
      }
      const coordinates =
        geometry.type === 'Polygon'
          ? projectPolygon(geometry.coordinates)
          : geometry.coordinates.map(projectPolygon)
      return { ...feature, geometry: { type: geometry.type, coordinates } }
    })
    writeFileSync(
      input,
      JSON.stringify({ type: 'FeatureCollection', features }),
    )
    const command = createRequire(import.meta.url).resolve(
      'mapshaper/bin/mapshaper',
    )
    const result = spawnSync(
      process.execPath,
      [
        command,
        input,
        '-clean',
        'snap-interval=0.01',
        'gap-width=0.02',
        '-simplify',
        'dp',
        'interval=1.5',
        'planar',
        'keep-shapes',
        '-filter-islands',
        'min-area=4',
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
      ],
      { encoding: 'utf8', timeout: 30000 },
    )
    if (result.status !== 0) {
      throw new Error(result.error?.message ?? result.stderr)
    }
    const polygons = JSON.parse(readFileSync(shapes, 'utf8')) as Collection
    const points = JSON.parse(readFileSync(centers, 'utf8')) as PointCollection
    const parts = polygons.features
      .toSorted((a, b) => a.properties.id - b.properties.id)
      .map((feature) => {
        const geometry = feature.geometry
        const center = points.features.find(
          (point) => point.properties.id === feature.properties.id,
        )?.geometry?.coordinates
        if (!geometry || !center) {
          throw new Error(`Prefecture disappeared: ${feature.properties.id}`)
        }
        const rings =
          geometry.type === 'Polygon'
            ? geometry.coordinates
            : geometry.coordinates.flat()
        const svgPath = rings
          .map((ring) => {
            const first = ring[0]
            const last = ring.at(-1)
            const closed =
              first && last && first[0] === last[0] && first[1] === last[1]
            const vertices = closed ? ring.slice(0, -1) : ring
            return `M${vertices.map(([x, y]) => `${x},${y}`).join(' L')} Z`
          })
          .join(' ')
        return {
          id: `JP-${String(feature.properties.id).padStart(2, '0')}`,
          name: feature.properties.nam_ja,
          path: svgPath,
          x: center[0],
          y: center[1],
        }
      })
    if (parts.length !== data.features.length) {
      throw new Error('The number of prefectures changed during simplification')
    }
    return parts
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function main() {
  const sourcePath = process.argv[2]
  if (!sourcePath) {
    throw new Error('Usage: pnpm map:generate <pinned japan.geojson>')
  }
  const source = readFileSync(sourcePath)
  if (createHash('sha256').update(source).digest('hex') !== sourceSha256) {
    throw new Error(
      'Source checksum mismatch; review provenance before changing the map.',
    )
  }
  const parts = generateParts(JSON.parse(source.toString()) as Collection)
  if (
    parts.length !== 47 ||
    parts.some(
      (part, index) => part.id !== `JP-${String(index + 1).padStart(2, '0')}`,
    )
  ) {
    throw new Error('Expected all 47 prefectures')
  }
  writeFileSync(
    'src/features/map/domain/prefectures.json',
    `${JSON.stringify(parts)}\n`,
  )
  const vertices = parts.reduce(
    (total, part) => total + (part.path.match(/[ML]/gu) ?? []).length,
    0,
  )
  console.log(`Generated 47 prefecture pieces with ${vertices} vertices.`)
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main()
}
