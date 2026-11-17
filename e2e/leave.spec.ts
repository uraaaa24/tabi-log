import { expect, test } from '@playwright/test'

import {
  alertDialog,
  answerAlert,
  button,
  diary,
  goBack,
  openApp,
  pickDate,
  saveToAlbum,
  selectPlace,
  visitedCount,
} from './support/app'

const unsaved = '未保存の変更があります'

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test('何も入力していなければ、確認なしで地図に戻れる', async ({ page }) => {
  await selectPlace(page, '青森県')

  await goBack(page)

  await expect(alertDialog(page, unsaved)).toHaveCount(0)
  expect(await visitedCount(page)).toBe(0)
})

test('入力途中で戻ると確認が出て、「編集を続ける」なら入力が残る', async ({
  page,
}) => {
  await selectPlace(page, '青森県')
  await diary(page).fill('ねぶた祭')

  await goBack(page)
  await answerAlert(page, unsaved, '編集を続ける')

  await expect(diary(page)).toHaveValue('ねぶた祭')
  await expect(page.getByText('新しい旅を記録')).toBeVisible()
})

test('入力途中で戻り「変更を破棄して戻る」を選ぶと、何も保存されずに地図に戻る', async ({
  page,
}) => {
  await selectPlace(page, '青森県')
  await pickDate(page, '訪問日', '2025-08-03')
  await diary(page).fill('ねぶた祭')

  await goBack(page)
  await answerAlert(page, unsaved, '変更を破棄して戻る')

  expect(await visitedCount(page)).toBe(0)
  await selectPlace(page, '青森県')
  await expect(diary(page)).toHaveValue('')
})

test('既存の記録を編集途中で破棄すると、アルバムは元の内容のまま', async ({
  page,
}) => {
  await selectPlace(page, '青森県')
  await pickDate(page, '訪問日', '2025-08-03')
  await diary(page).fill('ねぶた祭')
  await saveToAlbum(page, '青森県')
  await button(page, 'この旅を編集').click()
  await diary(page).fill('書きかけ')

  await goBack(page)
  await answerAlert(page, unsaved, '変更を破棄して戻る')

  await expect(page.getByText('ねぶた祭')).toBeVisible()
  await expect(page.getByText('書きかけ')).toHaveCount(0)
})

test('ブラウザ・OSの戻る操作でも未保存の変更は確認される', async ({ page }) => {
  await selectPlace(page, '青森県')
  await diary(page).fill('ねぶた祭')

  await page.goBack()

  await expect(alertDialog(page, unsaved)).toBeVisible()
})
