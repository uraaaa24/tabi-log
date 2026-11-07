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
      r >= 102 && r <= 108 && g >= 63 && g <= 69 && b >= 38 && b <= 44,
  ).length
  const land = colors.filter(
    ([r = 0, g = 0, b = 0]) =>
      r >= 194 && r <= 200 && g >= 163 && g <= 169 && b >= 119 && b <= 125,
  ).length
  assert.ok(
    background > image.width * image.height * 0.1,
    'Japan map wood board background did not render',
  )
  assert.ok(
    land > image.width * image.height * 0.015,
    'Japan prefecture geometry did not render',
  )
}
