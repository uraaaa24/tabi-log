export function fittedMapSize(width: number, height: number) {
  if (width * 760 <= height * 550) {
    return { width, height: (width * 760) / 550 }
  }
  return { width: (height * 550) / 760, height }
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
): [number, number, number, number, number, number] {
  'worklet'
  const ratio = drawingScale || 1
  return [
    scale,
    0,
    0,
    scale,
    275 * (1 - scale) + offsetX / ratio,
    380 * (1 - scale) + offsetY / ratio,
  ]
}
