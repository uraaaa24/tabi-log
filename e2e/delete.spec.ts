import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

import {
  addPhotos,
  alertDialog,
  answerAlert,
  button,
  diary,
  expectAlbum,
  landscape,
  openApp,
  pickDate,
  place,
  portrait,
  saveToAlbum,
  selectPlace,
  visitedCount,
} from './support/app'

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

async function recordVisit(
  page: Page,
  date: string,
  note: string,
  photos = 0,
): Promise<void> {
  await pickDate(page, '訪問日', date)
  await diary(page).fill(note)
  if (photos) {
    await addPhotos(page, [landscape, portrait].slice(0, photos))
  }
  await saveToAlbum(page, '福岡県')
}

test('既存の記録の編集画面から旅を削除すると、確認の後に地図へ戻り、ピンは残る', async ({
  page,
}) => {
  await selectPlace(page, '福岡県')
  await recordVisit(page, '2025-10-10', '屋台めぐり', 2)
  await button(page, 'この旅を編集').click()

  await button(page, 'この旅の記録を削除').click()
  await expect(alertDialog(page, '訪問記録を削除しますか？')).toContainText(
    '写真2枚・日記・交通手段も削除されます。場所のピンは残ります。',
  )
  await answerAlert(page, '訪問記録を削除しますか？', '削除')

  expect(await visitedCount(page)).toBe(1)
  await selectPlace(page, '福岡県', true)
  await expect(page.getByText('新しい旅を記録')).toBeVisible()
})

test('旅の削除をキャンセルすると、記録は残る', async ({ page }) => {
  await selectPlace(page, '福岡県')
  await recordVisit(page, '2025-10-10', '屋台めぐり')
  await button(page, 'この旅を編集').click()

  await button(page, 'この旅の記録を削除').click()
  await answerAlert(page, '訪問記録を削除しますか？', 'キャンセル')
  await button(page, '戻る').click()

  await expectAlbum(page, '福岡県')
  await expect(page.getByText('屋台めぐり')).toBeVisible()
})

test('複数ある旅の一つを削除しても、他の旅は残る', async ({ page }) => {
  await selectPlace(page, '福岡県')
  await recordVisit(page, '2025-10-10', '屋台めぐり')
  await button(page, '新しい旅を記録').click()
  await recordVisit(page, '2024-03-01', '太宰府')
  await button(page, 'この旅を編集').click()

  await button(page, 'この旅の記録を削除').click()
  await answerAlert(page, '訪問記録を削除しますか？', '削除')
  await selectPlace(page, '福岡県', true)

  await expectAlbum(page, '福岡県')
  await expect(page.getByText('屋台めぐり')).toBeVisible()
  await expect(page.getByText('1回の旅')).toBeVisible()
})

test('新規入力画面には旅の削除操作がない', async ({ page }) => {
  await selectPlace(page, '福岡県')

  await expect(button(page, 'この旅の記録を削除')).toHaveCount(0)
})

test('訪問履歴から場所のピンと記録を削除すると、件数と写真枚数を確認したうえで全て消え、地図のピンも外れる', async ({
  page,
}) => {
  await selectPlace(page, '福岡県')
  await recordVisit(page, '2025-10-10', '屋台めぐり', 2)
  await button(page, '新しい旅を記録').click()
  await recordVisit(page, '2024-03-01', '太宰府', 1)
  await button(page, '訪問履歴を切り替える').click()

  await button(page, 'この場所のピンと記録を削除').click()
  await expect(
    alertDialog(page, 'この場所の記録を削除しますか？'),
  ).toContainText('2回の旅・写真3枚・日記と地図のピンを削除します。')
  await answerAlert(page, 'この場所の記録を削除しますか？', '削除')

  expect(await visitedCount(page)).toBe(0)
  await expect(place(page, '福岡県')).toBeVisible()
  await selectPlace(page, '福岡県')
  await expect(page.getByText('新しい旅を記録')).toBeVisible()
  await expect(button(page, '日付なしで、ピンだけ残す')).toBeVisible()
})

test('場所の記録の削除をキャンセルすると、何も消えない', async ({ page }) => {
  await selectPlace(page, '福岡県')
  await recordVisit(page, '2025-10-10', '屋台めぐり')
  await button(page, '訪問履歴を切り替える').click()

  await button(page, 'この場所のピンと記録を削除').click()
  await answerAlert(page, 'この場所の記録を削除しますか？', 'キャンセル')

  await expect(page.getByText('屋台めぐり')).toBeVisible()
  await button(page, '戻る').click()
  expect(await visitedCount(page)).toBe(1)
})
