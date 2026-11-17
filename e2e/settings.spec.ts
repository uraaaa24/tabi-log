import { expect, test } from '@playwright/test'

import { button, goBack, japanMapShown, openApp } from './support/app'

test('設定から地図の出典を確認し、地図に戻れる', async ({ page }) => {
  await openApp(page)

  await button(page, '設定').click()

  await expect(
    page.getByText(/^日本地図の出典：地球地図日本（国土地理院）/),
  ).toBeVisible()
  await expect(
    page.getByText(/^世界地図の出典：Made with Natural\s*Earth/),
  ).toBeVisible()
  await goBack(page)
  await expect(japanMapShown(page)).toBeVisible()
})
