import { PNG } from 'pngjs'
import { describe, expect, it } from 'vitest'

import { assertPaperCardImage } from './paper-card-image'

function screenshot(paper: boolean, icon: boolean) {
  const image = new PNG({ width: 32, height: 32 })
  for (const pixel of Array.from({ length: 1024 }, (_, index) => index)) {
    const background =
      paper && pixel < 600 ? [255, 249, 235, 255] : [255, 255, 255, 255]
    const color = icon && pixel >= 1000 ? [153, 115, 78, 255] : background
    image.data.set(color, pixel * 4)
  }
  return PNG.sync.write(image)
}

describe('native PaperCard screenshot acceptance', () => {
  it('accepts the paper token and icon stroke together', () => {
    expect(() =>
      assertPaperCardImage(screenshot(true, true), 'card'),
    ).not.toThrow()
  })
  it('rejects an unstyled card even if the icon renders', () => {
    expect(() => assertPaperCardImage(screenshot(false, true), 'card')).toThrow(
      'paper background',
    )
  })
  it('rejects a missing icon even if NativeWind works', () => {
    expect(() => assertPaperCardImage(screenshot(true, false), 'card')).toThrow(
      'Lucide stroke',
    )
  })
  it('rejects a blank screen and a corrupt screenshot', () => {
    expect(() =>
      assertPaperCardImage(screenshot(false, false), 'card'),
    ).toThrow()
    expect(() =>
      assertPaperCardImage(Buffer.from('not a PNG'), 'card'),
    ).toThrow()
  })
})
