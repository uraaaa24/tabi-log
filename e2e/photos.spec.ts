import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

import {
  addPhotos,
  answerAlert,
  button,
  expectImagesLoaded,
  landscape,
  openApp,
  pictureFile,
  pickDate,
  portrait,
  restartApp,
  saveToAlbum,
  selectPlace,
} from './support/app'

test.beforeEach(async ({ page }) => {
  await openApp(page)
  await selectPlace(page, '広島県')
  await pickDate(page, '訪問日', '2026-01-03')
})

const editorPhotos = (page: Page) =>
  page.getByRole('button', { name: '外す', exact: true })

test('選んだ写真は保存前から編集画面に並ぶ', async ({ page }) => {
  await addPhotos(page, [landscape, portrait])

  await expect(editorPhotos(page)).toHaveCount(2)
  await expectImagesLoaded(page.locator('main, body').first(), 2)
  await expect(button(page, '写真を追加')).toBeVisible()
})

test('写真2枚の旅は、アルバムに2枚とも表示され一覧への導線は出ない', async ({
  page,
}) => {
  await addPhotos(page, [landscape, portrait])

  await saveToAlbum(page, '広島県')

  // Each photo is announced with its own position.
  await expect(button(page, '写真1を拡大')).toBeVisible()
  await expect(button(page, '写真2を拡大')).toBeVisible()
  await expectImagesLoaded(page.locator('body'), 2)
  await expect(button(page, /^写真をすべて見る/)).toHaveCount(0)
})

test('写真3枚以上の旅は、アルバムに先頭2枚と一覧への導線を出し、一覧には全枚数が並ぶ', async ({
  page,
}) => {
  await addPhotos(page, [landscape, portrait, landscape])
  await saveToAlbum(page, '広島県')
  await expect(button(page, /^写真[12]を拡大$/)).toHaveCount(2)

  await button(page, '写真をすべて見る · 3枚').click()

  await expect(page.getByText('旅の写真')).toBeVisible()
  await expect(button(page, /^写真[123]を拡大$/)).toHaveCount(3)
  await expectImagesLoaded(page.locator('body'), 3)
})

test('写真一覧で写真を選ぶと全画面で表示し、一覧へ戻れる', async ({ page }) => {
  await addPhotos(page, [landscape, portrait, landscape])
  await saveToAlbum(page, '広島県')
  await button(page, '写真をすべて見る · 3枚').click()
  // Wait until the album underneath has slid away and only the list is shown.
  await expect(button(page, /^写真[123]を拡大$/)).toHaveCount(3)

  await button(page, '写真2を拡大').click()

  await expect(button(page, '写真一覧へ戻る')).toBeVisible()
  await button(page, '写真一覧へ戻る').click()
  await expect(button(page, '写真一覧へ戻る')).toHaveCount(0)
  await expect(button(page, '写真2を拡大')).toBeVisible()
})

test('アルバムの写真を選ぶと、その写真の全画面表示が開く', async ({ page }) => {
  await addPhotos(page, [landscape])
  await saveToAlbum(page, '広島県')

  await button(page, '写真1を拡大').click()

  await expect(button(page, '写真一覧へ戻る')).toBeVisible()
})

test('写真を外して保存すると、アルバムの枚数が減る', async ({ page }) => {
  await addPhotos(page, [landscape, portrait, landscape])
  await saveToAlbum(page, '広島県')
  await button(page, 'この旅を編集').click()

  await editorPhotos(page).first().click()
  await answerAlert(page, '写真を外しますか？', '外す')
  await saveToAlbum(page, '広島県')

  await expect(button(page, /^写真[12]を拡大$/)).toHaveCount(2)
  await expect(button(page, /^写真をすべて見る/)).toHaveCount(0)
})

test('写真を外す確認でキャンセルすると、写真は残る', async ({ page }) => {
  await addPhotos(page, [landscape, portrait])

  await editorPhotos(page).first().click()
  await answerAlert(page, '写真を外しますか？', 'キャンセル')

  await expect(editorPhotos(page)).toHaveCount(2)
})

test('写真の選択を取り消しても、入力中の記録はそのまま', async ({ page }) => {
  const chooser = page.waitForEvent('filechooser')
  await button(page, '思い出の写真を選ぶ').click()

  await (await chooser).setFiles([])

  await expect(editorPhotos(page)).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '訪問日：2026-01-03' }),
  ).toBeVisible()
  await expect(button(page, '旅の記録を保存')).toBeEnabled()
})

test('保存した写真はアプリを再起動しても表示される', async ({ page }) => {
  await addPhotos(page, [landscape, portrait])
  await saveToAlbum(page, '広島県')

  await restartApp(page)
  await selectPlace(page, '広島県', true)

  await expect(button(page, /^写真[12]を拡大$/)).toHaveCount(2)
  await expectImagesLoaded(page.locator('body'), 2)
})

test('読み込めない写真が混ざっていても、読み込めた写真は残り、失敗した枚数を知らせる', async ({
  page,
}) => {
  const chooser = page.waitForEvent('filechooser')
  await button(page, '思い出の写真を選ぶ').click()

  await (
    await chooser
  ).setFiles([
    {
      name: 'broken.png',
      mimeType: 'image/png',
      buffer: Buffer.from('壊れた画像'),
    },
    pictureFile(landscape),
  ])

  await expect(page.getByRole('alert')).toHaveText(
    '1枚を取り込めませんでした。成功した1枚は編集画面に残っています。',
  )
  await expect(editorPhotos(page)).toHaveCount(1)
  await saveToAlbum(page, '広島県')
  await expect(button(page, /^写真[12]を拡大$/)).toHaveCount(1)
})
