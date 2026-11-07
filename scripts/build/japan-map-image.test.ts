import { PNG } from 'pngjs'
import { expect, it } from 'vitest'

import { assertJapanMapImage } from './japan-map-image'

it('木だけの空画面と実際に県が描かれた画面を区別する', () => {
  const image = new PNG({ width: 100, height: 100 })
  for (const index of Array.from({ length: 10000 }, (_value, i) => i)) {
    image.data.set([101, 70, 46, 255], index * 4)
  }
  expect(() => assertJapanMapImage(PNG.sync.write(image))).toThrow('geometry')
  for (const index of Array.from({ length: 1000 }, (_value, i) => i)) {
    image.data.set([205, 165, 110, 255], index * 4)
  }
  expect(() => assertJapanMapImage(PNG.sync.write(image))).not.toThrow()
})
