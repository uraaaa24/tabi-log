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
  // colors.board (#E5D7BF) and colors.land (#C99A66), with ±3 for rendering.
  const background = colors.filter(
    ([r = 0, g = 0, b = 0]) =>
      r >= 226 && r <= 232 && g >= 212 && g <= 218 && b >= 188 && b <= 194,
  ).length
  const land = colors.filter(
    ([r = 0, g = 0, b = 0]) =>
      r >= 198 && r <= 204 && g >= 151 && g <= 157 && b >= 99 && b <= 105,
  ).length
  assert.ok(
    background > image.width * image.height * 0.1,
    'Japan map board background did not render',
  )
  assert.ok(
    land > image.width * image.height * 0.015,
    'Japan prefecture geometry did not render',
  )
}
