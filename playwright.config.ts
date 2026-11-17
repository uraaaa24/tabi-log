import { defineConfig, devices } from '@playwright/test'

// Not Metro's 8081: a running `pnpm start` would otherwise be reused as the
// E2E server and serve the development bundle instead of the export.
const port = 8093

// Drives the real screens in Chromium through the E2E web export
// (`pnpm build:e2e`). See docs/e2e-testing.md for what this does not cover.
export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    ...devices['Pixel 7'],
    baseURL: `http://127.0.0.1:${port}`,
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `node e2e/support/server.ts dist/e2e-web ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
  },
})
