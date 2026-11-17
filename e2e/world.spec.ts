import { expect, test } from '@playwright/test'

import {
  button,
  expectEditor,
  goBack,
  japanMapShown,
  openApp,
  pickDate,
  place,
  restartApp,
  saveToAlbum,
  selectPlace,
  showMap,
  visitedCount,
  visitedCountries,
  worldMapShown,
} from './support/app'

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test('世界地図で国を選んで旅を記録すると、国のピンが付き、日本地図の県とは別に数えられる', async ({
  page,
}) => {
  await showMap(page, '世界地図')
  await expect.poll(() => visitedCountries(page)).toBe(0)

  await selectPlace(page, '韓国')
  await expectEditor(page, 'new')
  await pickDate(page, '訪問日', '2026-03-10')
  await saveToAlbum(page, '韓国')
  await goBack(page)
  await goBack(page)

  await expect(worldMapShown(page)).toBeVisible()
  await expect.poll(() => visitedCountries(page)).toBe(1)
  await expect(place(page, '韓国', true)).toBeVisible()
  // Countries are not counted on the Japan map.
  await showMap(page, '日本地図')
  await expect.poll(() => visitedCount(page)).toBe(0)
})

test('県を訪れると世界地図の日本にピンが付き、日本を選ぶと日本地図へ移る', async ({
  page,
}) => {
  await selectPlace(page, '宮城県')
  await button(page, '日付なしで、ピンだけ残す').click()
  await expect.poll(() => visitedCount(page)).toBe(1)

  await showMap(page, '世界地図')
  await expect.poll(() => visitedCountries(page)).toBe(1)
  await expect(place(page, '日本', true)).toBeVisible()

  await button(page, '日本の写真とピン').click()

  await expect(japanMapShown(page)).toBeVisible()
  await expect(page.getByRole('radio', { name: '日本地図' })).toBeChecked()
})

test('拡大しても押せない小さな国は、丸い駒から記録を始められる', async ({
  page,
}) => {
  await showMap(page, '世界地図')

  await button(page, 'パラオ、未訪問').click()

  await expectEditor(page, 'new')
  await expect(
    page.getByRole('heading', { name: 'パラオ、新しい旅を記録' }),
  ).toBeVisible()
})

test('195か国に含まれない地域は、形はあっても記録先として選べない', async ({
  page,
}) => {
  await showMap(page, '世界地図')

  await expect(page.getByLabel(/^台湾、/)).toHaveCount(0)
  await expect(page.getByLabel(/^中国、未訪問$/)).toHaveCount(1)
})

test('再起動すると前回見ていた世界地図を開く', async ({ page }) => {
  // The choice is written in the background as the switch is pressed. Opening
  // a place reads the store after that write, so the app is not reloaded in
  // the middle of it.
  await showMap(page, '世界地図')
  await selectPlace(page, '韓国')
  await expectEditor(page, 'new')
  await goBack(page)

  await restartApp(page)

  await expect(worldMapShown(page)).toBeVisible()
  await expect(page.getByRole('radio', { name: '世界地図' })).toBeChecked()

  await showMap(page, '日本地図')
  await selectPlace(page, '長野県')
  await expectEditor(page, 'new')
  await goBack(page)
  await restartApp(page)
  await expect(japanMapShown(page)).toBeVisible()
})

test('世界地図は全体ではなく、日本の周りを画面いっぱいに拡大して開く', async ({
  page,
}) => {
  await showMap(page, '世界地図')

  // The opening zoom is applied once the world map is first laid out.
  await expect(async () => {
    const screen = page.viewportSize()
    const japan = await place(page, '日本').boundingBox()
    const france = await place(page, 'フランス').boundingBox()
    if (!screen || !japan || !france) {
      throw new Error('地図が表示されていません。')
    }
    expect(japan.x + japan.width / 2).toBeGreaterThan(0)
    expect(japan.x + japan.width / 2).toBeLessThan(screen.width)
    // Europe is beyond the left edge until the map is pinched out.
    expect(france.x + france.width).toBeLessThan(0)
  }).toPass({ timeout: 5_000 })
})
