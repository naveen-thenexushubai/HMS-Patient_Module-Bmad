import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,       // run tests sequentially so you can watch
  workers: 1,                 // single browser window — one test at a time
  retries: 0,
  timeout: 120_000,           // 120 s per test (for 5000 ms slowMo) (increased for 1800 ms slowMo)
  expect: { timeout: 8_000 },
  reporter: [
    ['list'],                 // real-time console output
    ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
  ],

  use: {
    baseURL: 'http://localhost:80',
    headless: false,          // ← visible browser window
    slowMo: 5000,             // ← 5000 ms between actions — comfortable watching pace
    viewport: { width: 1400, height: 900 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'Hospital v3.0 E2E',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
