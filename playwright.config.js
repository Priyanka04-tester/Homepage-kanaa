require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://dev-nx.thekanaa.com';

module.exports = defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  // This hits a shared dev/staging environment, not an isolated test
  // instance. Running specs concurrently caused cart/checkout tests to
  // contend with each other and fail intermittently, so keep this at 1.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Pinned at/above the site's 1280px "xl" breakpoint: below it,
        // the header switches to a stripped-down mobile layout (hamburger
        // menu, icon-only header) that these selectors don't target.
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
