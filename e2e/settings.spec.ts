import { expect, test } from '@playwright/test'

import { button, goBack, mapCount, openApp } from './support/app'

test('設定から地図の出典を確認し、地図に戻れる', async ({ page }) => {
  await openApp(page)

  await button(page, '設定').click()

  await expect(
    page.getByText(/^出典：地球地図日本（国土地理院）/),
  ).toBeVisible()
  await goBack(page)
  await expect(mapCount(page)).toBeVisible()
})
