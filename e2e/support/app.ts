import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { PNG } from 'pngjs'

// User-level actions shared by the specs. They operate the app only through
// what a person can see or a screen reader can announce (roles, labels and
// text), never through component internals, so refactoring the screens does
// not break the tests unless the behaviour changes.

export const today = '2026-05-20'

export async function openApp(page: Page): Promise<void> {
  // "Today" is fixed so that date limits and defaults are deterministic.
  await page.clock.setFixedTime(new Date(`${today}T10:00:00+09:00`))
  await page.goto('/')
  await expect(mapCount(page)).toBeVisible()
}

export async function restartApp(page: Page): Promise<void> {
  await page.goto('/')
  await expect(mapCount(page)).toBeVisible()
}

// The count burned into the board is announced as "訪れた場所 N / 47".
export const mapCount = (page: Page) =>
  page.getByLabel(/^訪れた場所 \d+ \/ 47$/).filter({ visible: true })

export async function visitedCount(page: Page): Promise<number> {
  await expect(mapCount(page)).toBeVisible()
  const label = (await mapCount(page).getAttribute('aria-label')) ?? ''
  return Number(/(\d+) \//.exec(label)?.[1])
}

export function place(page: Page, name: string, visited = false): Locator {
  return page.getByLabel(`${name}、${visited ? '訪問済み' : '未訪問'}`, {
    exact: true,
  })
}

// Opens a place like a person would. A visited place is opened from its pin
// (or the print hanging from it), which may cover a small prefecture's land;
// the spec lets either the pin or the shape select it.
//
// Otherwise it taps the land of the prefecture. Shapes made of islands
// (e.g. Okinawa) have the centre of their bounding box in the sea, so the
// point is taken from the shape's own fill nearest that centre. The point is
// recomputed on each attempt because the map may still be moving (screen
// transition or layout) when it first appears.
export async function selectPlace(
  page: Page,
  name: string,
  visited = false,
): Promise<void> {
  if (visited) {
    await button(page, `${name}の写真とピン`).click()
    return
  }
  const target = place(page, name, visited)
  await expect(async () => {
    const point = await target.evaluate(landPoint)
    const box = await target.boundingBox()
    if (!point || !box) {
      throw new Error(`${name}の陸地が画面に見えていません。`)
    }
    await target.click({
      position: { x: point.x - box.x, y: point.y - box.y },
      timeout: 2_000,
    })
  }).toPass({ timeout: 15_000 })
}

function landPoint(group: SVGGElement): { x: number; y: number } | null {
  const path = group.querySelector('path')
  const matrix = path?.getScreenCTM()
  if (!path || !matrix) {
    return null
  }
  const box = path.getBBox()
  const centre = new DOMPoint(
    box.x + box.width / 2,
    box.y + box.height / 2,
  ).matrixTransform(matrix)
  const steps = 60
  const candidates = Array.from(
    { length: (steps + 1) ** 2 },
    (_, index) =>
      new DOMPoint(
        box.x + (box.width * (index % (steps + 1))) / steps,
        box.y + (box.height * Math.floor(index / (steps + 1))) / steps,
      ),
  )
    .filter((candidate) => path.isPointInFill(candidate))
    .map((candidate) => candidate.matrixTransform(matrix))
    .filter(
      (screen) =>
        document
          .elementFromPoint(screen.x, screen.y)
          ?.closest('g[aria-label]') === group,
    )
    .sort(
      (a, b) =>
        Math.hypot(a.x - centre.x, a.y - centre.y) -
        Math.hypot(b.x - centre.x, b.y - centre.y),
    )
  const nearest = candidates[0]
  return nearest ? { x: nearest.x, y: nearest.y } : null
}

// Only what is on screen can be pressed. On the web, screens lower in the
// navigation stack remain in the DOM (hidden), so matches are limited to
// visible elements.
export const button = (page: Page, name: string | RegExp) =>
  page
    .getByRole('button', { name, exact: typeof name === 'string' })
    .filter({ visible: true })

export async function pickDate(
  page: Page,
  field: '訪問日' | '終了日',
  date: string,
): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^${field}：`) }).click()
  const dialog = page.getByRole('dialog', { name: '日付を選択' })
  await dialog.getByLabel('日付（年-月-日）').fill(date)
  await dialog.getByRole('button', { name: 'OK' }).click()
  await expect(
    page.getByRole('button', { name: `${field}：${date}` }),
  ).toBeVisible()
}

export async function save(page: Page): Promise<void> {
  await button(page, '旅の記録を保存').click()
}

const heading = (page: Page, name: RegExp) =>
  page.getByRole('heading', { name }).filter({ visible: true })

// The album is identified by its edit button and its place heading, which no
// other screen has together. Text such as the diary also appears in the
// editor's input, so it cannot prove that the save finished.
export async function expectAlbum(
  page: Page,
  placeName: string,
): Promise<void> {
  await expect(button(page, 'この旅を編集')).toBeVisible()
  await expect(heading(page, new RegExp(`^${placeName}、`))).toBeVisible()
}

// The list of every trip to one place, opened from its pin on the map.
export async function expectTimeline(
  page: Page,
  placeName: string,
): Promise<void> {
  await expect(button(page, '地図へ戻る')).toBeVisible()
  await expect(heading(page, new RegExp(`^${placeName}$`))).toBeVisible()
}

// Trips listed on the place timeline, newest first.
export const timelineTrips = (page: Page) => button(page, /の旅(、写真\d+枚)?$/)

export async function expectEditor(
  page: Page,
  mode: 'new' | 'edit',
): Promise<void> {
  await expect(
    heading(page, mode === 'new' ? /、新しい旅を記録$/ : /、旅の思い出を編集$/),
  ).toBeVisible()
}

export async function saveToAlbum(
  page: Page,
  placeName: string,
): Promise<void> {
  await save(page)
  await expectAlbum(page, placeName)
}

// Each screen names its way back after where it leads.
export async function goBack(page: Page): Promise<void> {
  await button(
    page,
    /^(戻る|地図へ戻る|旅の一覧へ戻る|編集をやめて戻る)$/,
  ).click()
}

export function alertDialog(page: Page, title: string): Locator {
  return page.getByRole('alertdialog', { name: title })
}

export async function answerAlert(
  page: Page,
  title: string,
  choice: string,
): Promise<void> {
  const dialog = alertDialog(page, title)
  await dialog.getByRole('button', { name: choice, exact: true }).click()
  await expect(dialog).toHaveCount(0)
}

export const transport = (page: Page, name: string) =>
  page.getByRole('checkbox', { name, exact: true })

export const diary = (page: Page) => page.getByLabel('日記・メモ')

type Picture = Readonly<{
  name: string
  width: number
  height: number
}>

function png({ width, height }: Picture, seed: number): Buffer {
  const image = new PNG({ width, height })
  for (const [index] of Array.from({ length: width * height }).entries()) {
    const offset = index * 4
    image.data[offset] = (seed * 80 + index) % 256
    image.data[offset + 1] = (seed * 40) % 256
    image.data[offset + 2] = 255 - ((seed * 60) % 256)
    image.data[offset + 3] = 255
  }
  return PNG.sync.write(image)
}

export const landscape = { name: 'landscape.png', width: 64, height: 48 }
export const portrait = { name: 'portrait.png', width: 30, height: 60 }

export const pictureFile = (picture: Picture, seed = 1) => ({
  name: picture.name,
  mimeType: 'image/png',
  buffer: png(picture, seed),
})

// Chooses photos through the browser's file chooser, which the real
// expo-image-picker web implementation opens.
export async function addPhotos(
  page: Page,
  pictures: readonly Picture[],
): Promise<void> {
  const chooser = page.waitForEvent('filechooser')
  await button(page, /^(思い出の写真を選ぶ|写真を追加)$/).click()
  await (
    await chooser
  ).setFiles(pictures.map((picture, seed) => pictureFile(picture, seed + 1)))
}

// A photo counts as shown only when the browser actually decoded the stored
// image, not merely when an <img> element exists.
export async function expectImagesLoaded(
  scope: Locator,
  count: number,
): Promise<void> {
  // Screens below the top of the stack stay in the DOM but hidden.
  const images = scope.locator('img:visible')
  await expect(images).toHaveCount(count)
  for (const image of await images.all()) {
    await expect
      .poll(() =>
        image.evaluate((element: HTMLImageElement) => element.naturalWidth),
      )
      .toBeGreaterThan(0)
  }
}
