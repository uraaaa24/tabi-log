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
