/**
 * Dedicated config for the homepage QA bot's own test files (tests/homepage/**).
 * Kept separate from the root playwright.config.js on purpose: that config is
 * pinned to a single chromium project at 1280x800 because tests/e2e's selectors
 * only work at/above the site's "xl" breakpoint (see README "Known site quirks").
 * The homepage bot's specs are viewport-agnostic (they set their own viewport per
 * test case, or don't care), so they can run across all three engines here without
 * touching that constraint.
 */
require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://dev-nx.thekanaa.com';

module.exports = defineConfig({
  testDir: './tests/homepage',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-homepage', open: 'never' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } } },
  ],
});
