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
  const wood = colors.filter(
    ([r = 0, g = 0, b = 0]) =>
      r > 80 && r < 130 && g > 50 && g < 100 && b > 25 && b < 70,
  ).length
  const land = colors.filter(
    ([r = 0, g = 0, b = 0]) =>
      r > 170 && r < 240 && g > 120 && g < 205 && b > 65 && b < 160,
  ).length
  assert.ok(
    wood > image.width * image.height * 0.1,
    'Japan map wood background did not render',
  )
  assert.ok(
    land > image.width * image.height * 0.015,
    'Japan prefecture geometry did not render',
  )
}
