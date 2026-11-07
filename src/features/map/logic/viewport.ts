export function boundedOffset(offset: number, size: number, scale: number) {
  'worklet'
  const limit = (size * (scale - 1)) / 2
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
