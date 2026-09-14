/**
 * Dedicated config for the homepage QA bot's own test files (tests/homepage/**).
 * Kept separate from the root playwright.config.js on two counts, both intentional:
 *  1. That config is pinned to a single chromium project at 1280x800 because
 *     tests/e2e's selectors only work at/above the site's "xl" breakpoint (see
 *     README "Known site quirks"). The homepage bot's specs set their own viewport
 *     per test case, so they can run across all three engines here.
 *  2. DIFFERENT TARGET SITE. tests/e2e and tests/api point at dev-nx.thekanaa.com
 *     (via BASE_URL) — a shared dev/staging environment, on purpose, because those
 *     suites do things like add-to-cart/checkout-adjacent flows that shouldn't run
 *     against a live storefront by default. The homepage bot was built specifically
 *     to test the public homepage itself (English + Arabic) and targets PRODUCTION
 *     (https://thekanaa.com) via HOMEPAGE_BASE_URL — a separate env var, precisely
 *     so that changing one target never silently changes the other. See CLAUDE.md
 *     "Two different targets, on purpose" before pointing either at the other's URL.
 */
require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.HOMEPAGE_BASE_URL || 'https://thekanaa.com';

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
