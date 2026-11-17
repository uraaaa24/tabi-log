import { expect, test } from '@playwright/test'

import {
  diary,
  expectAlbum,
  goBack,
  openApp,
  pickDate,
  place,
  restartApp,
  save,
  saveToAlbum,
  selectPlace,
  today,
  transport,
  visitedCount,
} from './support/app'

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test('未訪問の県を選ぶと新規入力が開き、日付だけで保存するとアルバムと地図のピンに反映される', async ({
  page,
}) => {
  await selectPlace(page, '長野県')
  await expect(page.getByText('新しい旅を記録')).toBeVisible()
  await pickDate(page, '訪問日', '2026-05-03')

  await saveToAlbum(page, '長野県')

  await expect(page.getByText('2026-05-03', { exact: true })).toBeVisible()
  await expect(page.getByText('1回の旅')).toBeVisible()
  await goBack(page)
  await expect(place(page, '長野県', true)).toBeVisible()
  expect(await visitedCount(page)).toBe(1)
})

test('訪問日を選ばずに保存すると、理由を示して入力画面に留まる', async ({
  page,
}) => {
  await selectPlace(page, '長野県')
  await diary(page).fill('日付を忘れた')

  await save(page)

  await expect(page.getByRole('alert')).toHaveText('訪問日を選んでください。')
  await expect(page.getByText('新しい旅を記録')).toBeVisible()
  await expect(diary(page)).toHaveValue('日付を忘れた')
})

test('日記と交通手段（その他を含む）を保存すると、アルバムに表示される', async ({
  page,
}) => {
  await selectPlace(page, '北海道')
  await pickDate(page, '訪問日', '2026-04-29')
  await diary(page).fill('朝市で海鮮丼を食べた。')
  await transport(page, '飛行機').click()
  await transport(page, 'その他').click()
  await page.getByLabel('その他の交通手段').fill('レンタサイクル')

  await saveToAlbum(page, '北海道')

  await expect(page.getByText('朝市で海鮮丼を食べた。')).toBeVisible()
  await expect(page.getByText('飛行機 · レンタサイクル')).toBeVisible()
})

test('交通手段の「その他」を選んで内容が空なら保存できない', async ({
  page,
}) => {
  await selectPlace(page, '北海道')
  await pickDate(page, '訪問日', '2026-04-29')
  await transport(page, 'その他').click()

  await save(page)

  await expect(page.getByRole('alert')).toHaveText(
    'その他の交通手段を入力してください。',
  )
})

test('複数日の旅は期間で表示される', async ({ page }) => {
  await selectPlace(page, '沖縄県')
  await pickDate(page, '訪問日', '2026-03-10')
  await page.getByRole('switch', { name: '複数日の旅' }).click()
  await pickDate(page, '終了日', '2026-03-13')

  await saveToAlbum(page, '沖縄県')

  await expect(page.getByText('2026-03-10 〜 2026-03-13')).toBeVisible()
})

test('終了日が開始日より前なら保存できない', async ({ page }) => {
  await selectPlace(page, '沖縄県')
  await pickDate(page, '訪問日', '2026-03-10')
  await page.getByRole('switch', { name: '複数日の旅' }).click()
  await pickDate(page, '終了日', '2026-03-09')

  await save(page)

  await expect(page.getByRole('alert')).toHaveText(
    '終了日は開始日以降にしてください。',
  )
})

test('今日より後の日付は日付選択で選べない', async ({ page }) => {
  await selectPlace(page, '沖縄県')
  await page.getByRole('button', { name: '訪問日：未選択' }).click()
  const dialog = page.getByRole('dialog', { name: '日付を選択' })

  await dialog.getByLabel('日付（年-月-日）').fill('2026-05-21')

  await expect(dialog.getByRole('button', { name: 'OK' })).toBeDisabled()
  await dialog.getByLabel('日付（年-月-日）').fill(today)
  await expect(dialog.getByRole('button', { name: 'OK' })).toBeEnabled()
})

test('複数日をやめて保存すると、終了日は開始日と同じ日として保存される', async ({
  page,
}) => {
  await selectPlace(page, '沖縄県')
  await pickDate(page, '訪問日', '2026-03-10')
  await page.getByRole('switch', { name: '複数日の旅' }).click()
  await pickDate(page, '終了日', '2026-03-13')
  await page.getByRole('switch', { name: '複数日の旅' }).click()

  await saveToAlbum(page, '沖縄県')

  await expect(page.getByText('2026-03-10', { exact: true })).toBeVisible()
})

test('保存した記録はアプリを再起動しても残っている', async ({ page }) => {
  await selectPlace(page, '京都府')
  await pickDate(page, '訪問日', '2026-02-11')
  await diary(page).fill('雪の金閣寺')
  await saveToAlbum(page, '京都府')

  await restartApp(page)

  expect(await visitedCount(page)).toBe(1)
  await selectPlace(page, '京都府', true)
  await expectAlbum(page, '京都府')
  await expect(page.getByText('雪の金閣寺')).toBeVisible()
})
