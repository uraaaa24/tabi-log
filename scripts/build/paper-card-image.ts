import assert from 'node:assert/strict'
import { PNG } from 'pngjs'

// Check the agreed paper token and Lucide stroke in an actual device screenshot.
// Pixel counts allow density/font differences; this is not a golden-image test.
export function assertPaperCardImage(buffer: Buffer, label: string): void {
  const image = PNG.sync.read(buffer)
  for (const [name, red, green, blue, minimum] of [
    ['paper background', 255, 249, 235, 500],
    ['Lucide stroke', 153, 115, 78, 5],
  ] as const) {
    const count = image.data.reduce((pixels, value, index, data) => {
      return index % 4 === 0 &&
        value === red &&
        data[index + 1] === green &&
        data[index + 2] === blue &&
        data[index + 3] === 255
        ? pixels + 1
        : pixels
    }, 0)
    assert.ok(
      count >= minimum,
      `${label}: ${name} not rendered (${count} matching pixels, expected at least ${minimum})`,
    )
  }
}
