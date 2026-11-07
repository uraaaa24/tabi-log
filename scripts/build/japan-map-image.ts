import assert from 'node:assert/strict'
import { PNG } from 'pngjs'

export function assertJapanMapImage(buffer: Buffer) {
  const image = PNG.sync.read(buffer)
  const colors = Array.from(
    { length: image.width * image.height },
    (_value, index) => {
      const offset = index * 4
      return [
        image.data[offset] ?? 0,
        image.data[offset + 1] ?? 0,
        image.data[offset + 2] ?? 0,
      ]
    },
  )
  const background = colors.filter(
    ([r = 0, g = 0, b = 0]) =>
      r >= 244 && r <= 249 && g >= 245 && g <= 250 && b >= 240 && b <= 246,
  ).length
  const land = colors.filter(
    ([r = 0, g = 0, b = 0]) =>
      r >= 168 &&
      r <= 218 &&
      g >= 185 &&
      g <= 225 &&
      b >= 168 &&
      b <= 212 &&
      g > r,
  ).length
  assert.ok(
    background > image.width * image.height * 0.1,
    'Japan map neutral background did not render',
  )
  assert.ok(
    land > image.width * image.height * 0.015,
    'Japan prefecture geometry did not render',
  )
}
