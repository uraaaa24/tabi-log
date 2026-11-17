import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

import {
  button,
  diary,
  expectAlbum,
  expectEditor,
  expectTimeline,
  goBack,
  japanMapShown,
  openApp,
  pickDate,
  saveToAlbum,
  selectPlace,
  timelineTrips,
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
  await goBack(page)
  await button(page, '新しい旅を記録').click()
  await recordVisit(page, '2024-12-30', '冬の能登')
}

test('記録がある県を選ぶと、その県の旅が新しい順に年ごとに並ぶ', async ({
  page,
}) => {
  await recordTwoVisits(page)
  await goBack(page)
  await goBack(page)

  await selectPlace(page, '石川県', true)

  await expectTimeline(page, '石川県')
  await expect(timelineTrips(page)).toHaveText([
    '2025年8月14日',
    '2024年12月30日',
  ])
  await expect(page.getByRole('heading', { name: '2025年' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '2024年' })).toBeVisible()
})

test('旅の一覧で選んだ旅のアルバムが開き、戻ると一覧に戻る', async ({
  page,
}) => {
  await recordTwoVisits(page)
  await goBack(page)

  await button(page, '2025年8月14日の旅').click()

  await expectAlbum(page, '石川県')
  await expect(page.getByText('夏の兼六園')).toBeVisible()
  await expect(page.getByText('冬の能登')).toHaveCount(0)
  await goBack(page)
  await expectTimeline(page, '石川県')
})

test('アルバムから編集して保存すると、変更がアルバムに反映される', async ({
  page,
}) => {
  await selectPlace(page, '石川県')
  await recordVisit(page, '2025-08-14', '夏の兼六園')
  await button(page, 'この旅を編集').click()
  await expectEditor(page, 'edit')
  await expect(diary(page)).toHaveValue('夏の兼六園')

  await diary(page).fill('夏の兼六園と金沢カレー')
  await transport(page, '新幹線').click()
  await saveToAlbum(page, '石川県')

  await expect(page.getByText('夏の兼六園と金沢カレー')).toBeVisible()
  await expect(page.getByLabel('交通手段：新幹線')).toBeVisible()
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

  await expectEditor(page, 'edit')
})

test('アルバムから戻ると旅の一覧、一覧から戻ると地図に戻る', async ({
  page,
}) => {
  await recordTwoVisits(page)

  await goBack(page)
  await expectTimeline(page, '石川県')
  await goBack(page)

  await expect(japanMapShown(page)).toBeVisible()
})

test('存在しない記録へのリンクを開くと、読み込み中のままにせず見つからないと伝える', async ({
  page,
}) => {
  await page.goto('/album/missing-visit')

  await expect(page.getByText('記録が見つかりません。')).toBeVisible()
  await goBack(page)
  await expect(japanMapShown(page)).toBeVisible()
})
