import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

import {
  button,
  diary,
  expectAlbum,
  goBack,
  openApp,
  pickDate,
  saveToAlbum,
  selectPlace,
  transport,
} from './support/app'

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

async function recordVisit(
  page: Page,
  date: string,
  note: string,
): Promise<void> {
  await pickDate(page, '訪問日', date)
  await diary(page).fill(note)
  await saveToAlbum(page, '石川県')
}

async function recordTwoVisits(page: Page): Promise<void> {
  await selectPlace(page, '石川県')
  await recordVisit(page, '2025-08-14', '夏の兼六園')
  await button(page, '新しい旅を記録').click()
  await recordVisit(page, '2024-12-30', '冬の能登')
}

test('記録がある県を選ぶと、訪問日が最も新しい旅のアルバムが開く', async ({
  page,
}) => {
  await recordTwoVisits(page)
  await goBack(page)

  await selectPlace(page, '石川県', true)

  await expectAlbum(page, '石川県')
  await expect(page.getByText('夏の兼六園')).toBeVisible()
  await expect(page.getByText('2回の旅')).toBeVisible()
})

test('訪問履歴は新しい順に並び、選んだ旅のアルバムに切り替わる', async ({
  page,
}) => {
  await recordTwoVisits(page)
  await button(page, '訪問履歴を切り替える').click()
  const sheet = page.getByRole('button', { name: /^\d{4}-\d{2}-\d{2}$/ })
  await expect(sheet).toHaveText(['2025-08-14', '2024-12-30'])

  await button(page, '2025-08-14').click()

  await expectAlbum(page, '石川県')
  await expect(page.getByText('夏の兼六園')).toBeVisible()
  await expect(page.getByText('冬の能登')).toHaveCount(0)
})

test('訪問履歴のシートは閉じるとアルバムに戻る', async ({ page }) => {
  await recordTwoVisits(page)
  await button(page, '訪問履歴を切り替える').click()

  await button(page, '閉じる').first().click()

  await expect(button(page, '2025-08-14')).toHaveCount(0)
  await expect(page.getByText('冬の能登')).toBeVisible()
})

test('アルバムから編集して保存すると、変更がアルバムに反映される', async ({
  page,
}) => {
  await selectPlace(page, '石川県')
  await recordVisit(page, '2025-08-14', '夏の兼六園')
  await button(page, 'この旅を編集').click()
  await expect(page.getByText('旅の思い出を編集')).toBeVisible()
  await expect(diary(page)).toHaveValue('夏の兼六園')

  await diary(page).fill('夏の兼六園と金沢カレー')
  await transport(page, '新幹線').click()
  await saveToAlbum(page, '石川県')

  await expect(page.getByText('夏の兼六園と金沢カレー')).toBeVisible()
  await expect(page.getByText('新幹線', { exact: true })).toBeVisible()
  await expect(page.getByText('1回の旅')).toBeVisible()
})

test('日記も写真もない旅では、思い出の追加を促し編集画面へ進める', async ({
  page,
}) => {
  await selectPlace(page, '石川県')
  await pickDate(page, '訪問日', '2025-08-14')
  await saveToAlbum(page, '石川県')
  await expect(
    page.getByText('この旅の思い出を、写真や言葉で残しましょう。'),
  ).toBeVisible()

  await button(page, '思い出を追加').click()

  await expect(page.getByText('旅の思い出を編集')).toBeVisible()
})

test('アルバムから戻ると地図に戻る', async ({ page }) => {
  await recordTwoVisits(page)

  await goBack(page)

  await expect(page.getByText('/ 47　訪れた場所')).toBeVisible()
})

test('存在しない記録へのリンクを開くと、読み込み中のままにせず見つからないと伝える', async ({
  page,
}) => {
  await page.goto('/album/missing-visit')

  await expect(page.getByText('記録が見つかりません。')).toBeVisible()
  await goBack(page)
  await expect(page.getByText('/ 47　訪れた場所')).toBeVisible()
})
