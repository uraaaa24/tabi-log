import { expect, test } from '@playwright/test'

import {
  button,
  diary,
  expectAlbum,
  expectEditor,
  expectTimeline,
  goBack,
  openApp,
  pickDate,
  place,
  saveToAlbum,
  selectPlace,
  visitedCount,
} from './support/app'

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test('日付がわからなくても、新規入力画面からピンだけを残せる', async ({
  page,
}) => {
  await selectPlace(page, '宮城県')

  await button(page, '日付なしで、ピンだけ残す').click()

  expect(await visitedCount(page)).toBe(1)
  await expect(place(page, '宮城県', true)).toBeVisible()
})

test('ピンだけの県を選ぶと新規入力が開き、ピンを外すと未訪問に戻る', async ({
  page,
}) => {
  await selectPlace(page, '宮城県')
  await button(page, '日付なしで、ピンだけ残す').click()
  await selectPlace(page, '宮城県', true)
  await expectEditor(page, 'new')

  await button(page, 'ピンを外す').click()

  expect(await visitedCount(page)).toBe(0)
  await expect(place(page, '宮城県')).toBeVisible()
})

test('入力を始めると、ピンだけ残す操作は使えなくなる', async ({ page }) => {
  await selectPlace(page, '宮城県')

  await diary(page).fill('牛タン')

  await expect(button(page, '日付なしで、ピンだけ残す')).toBeDisabled()
})

test('ピンだけの県に旅を記録すると、ピンは一つのまま記録が付く', async ({
  page,
}) => {
  await selectPlace(page, '宮城県')
  await button(page, '日付なしで、ピンだけ残す').click()
  await selectPlace(page, '宮城県', true)

  await pickDate(page, '訪問日', '2025-07-07')
  await saveToAlbum(page, '宮城県')
  await goBack(page)
  await goBack(page)

  expect(await visitedCount(page)).toBe(1)
})

// The pin of a place with records may only be removed from its timeline,
// after confirming how many trips and photos will be deleted.
test('記録がある県で新しい旅を開いても、確認なしで記録を消す操作は出ない', async ({
  page,
}) => {
  await selectPlace(page, '宮城県')
  await pickDate(page, '訪問日', '2025-07-07')
  await diary(page).fill('松島の遊覧船')
  await saveToAlbum(page, '宮城県')
  await goBack(page)

  await button(page, '新しい旅を記録').click()

  await expectEditor(page, 'new')
  await expect(button(page, 'ピンを外す')).toHaveCount(0)
  await goBack(page)
  await expectTimeline(page, '宮城県')
  await button(page, '2025年7月7日の旅').click()
  await expectAlbum(page, '宮城県')
  await expect(page.getByText('松島の遊覧船')).toBeVisible()
})
