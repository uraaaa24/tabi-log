type MapFrame = Readonly<{
  x: number
  y: number
  width: number
  height: number
}>

export function fittedMapSize(width: number, height: number, frame: MapFrame) {
  if (width * frame.height <= height * frame.width) {
    return { width, height: (width * frame.height) / frame.width }
  }
  return { width: (height * frame.width) / frame.height, height }
}

export function boundedOffset(
  offset: number,
  viewportSize: number,
  scale: number,
  contentSize = viewportSize,
) {
  'worklet'
  const limit = Math.max(0, (contentSize * scale - viewportSize) / 2)
  if (limit === 0) {
    return 0
  }
  return Math.max(-limit, Math.min(limit, offset))
}

export function anchoredOffset(
  focal: number,
  initialFocal: number,
  initialOffset: number,
  initialScale: number,
  scale: number,
) {
  'worklet'
  return focal - ((initialFocal - initialOffset) / initialScale) * scale
}

export function mapTransform(
  scale: number,
  offsetX: number,
  offsetY: number,
  drawingScale: number,
  frame: MapFrame,
): [number, number, number, number, number, number] {
  'worklet'
  const ratio = drawingScale || 1
  return [
    scale,
    0,
    0,
    scale,
    (frame.x + frame.width / 2) * (1 - scale) + offsetX / ratio,
    (frame.y + frame.height / 2) * (1 - scale) + offsetY / ratio,
  ]
}

// Screen position of a map coordinate under the same pan/zoom as mapTransform:
// the frame centre sits at the viewport centre, moved by the pan offset.
export function projectPoint(
  point: number,
  frameCenter: number,
  viewportSize: number,
  drawingScale: number,
  scale: number,
  offset: number,
) {
  'worklet'
  return (
    viewportSize / 2 + drawingScale * scale * (point - frameCenter) + offset
  )
}

// A camera that fills the whole viewport with the map (no bands of empty
// board above and below a wide map), centred as close to `focus` (map units)
// as the map's edges allow.
export function filledCamera(
  width: number,
  height: number,
  frame: MapFrame,
  focus: Readonly<{ x: number; y: number }>,
) {
  const content = fittedMapSize(width, height, frame)
  if (content.width === 0 || content.height === 0) {
    return { scale: 1, x: 0, y: 0 }
  }
  const scale = Math.max(width / content.width, height / content.height)
  const ratio = content.width / frame.width
  return {
    scale,
    x: boundedOffset(
      -ratio * scale * (focus.x - (frame.x + frame.width / 2)),
      width,
      scale,
      content.width,
    ),
    y: boundedOffset(
      -ratio * scale * (focus.y - (frame.y + frame.height / 2)),
      height,
      scale,
      content.height,
    ),
  }
}
