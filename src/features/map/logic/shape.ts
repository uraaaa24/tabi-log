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
