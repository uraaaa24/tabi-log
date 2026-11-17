type Bounds = Readonly<{
  x: number
  y: number
  width: number
  height: number
}>

// Prefecture paths only use absolute M/L/Z commands, so every number pair is
// a vertex and the extremes of those pairs are the shape's bounding box.
export function pathBounds(path: string): Bounds {
  const values = (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
  const xs = values.filter((_value, index) => index % 2 === 0)
  const ys = values.filter((_value, index) => index % 2 === 1)
  if (xs.length === 0 || xs.length !== ys.length) {
    throw new Error('輪郭の座標を読み取れません。')
  }
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

// A square viewBox around the shape with a margin, so silhouettes of very
// different proportions sit centred at a consistent visual size.
export function squareViewBox(bounds: Bounds, margin = 0.06) {
  const side = Math.max(bounds.width, bounds.height) * (1 + margin * 2)
  const x = bounds.x + bounds.width / 2 - side / 2
  const y = bounds.y + bounds.height / 2 - side / 2
  return `${x} ${y} ${side} ${side}`
}

const ringArea = (points: readonly (readonly [number, number])[]) =>
  Math.abs(
    points.reduce((sum, [x, y], index) => {
      const [nx, ny] = points[(index + 1) % points.length] ?? [x, y]
      return sum + x * ny - nx * y
    }, 0),
  ) / 2

// The box around a shape's major parts only: rings at least `share` of the
// largest. A country's distant small territories (Hawaii, French Guiana)
// would otherwise shrink its main land to a speck in a silhouette.
export function mainBounds(path: string, share = 0.2): Bounds {
  const rings = (path.match(/M[^Z]+Z/g) ?? []).map((ring) =>
    [...ring.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(
      (match) => [Number(match[1]), Number(match[2])] as const,
    ),
  )
  const areas = rings.map(ringArea)
  const largest = Math.max(...areas)
  return pathBounds(
    rings
      .filter((_ring, index) => (areas[index] ?? 0) >= largest * share)
      .map((ring) => `M${ring.map(([x, y]) => `${x},${y}`).join(' L')} Z`)
      .join(' '),
  )
}
