import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'https://thekanaa.com/en-sa/';

export default defineConfig({
  testDir: './tests',
  timeout: 60000, // 60s per test
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium-desktop-1440',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URL,
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'chromium-desktop-1920',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URL,
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox-desktop-1440',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: BASE_URL,
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'webkit-desktop-1440',
      use: {
        ...devices['Desktop Safari'],
        baseURL: BASE_URL,
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'chromium-tablet-1024',
      use: {
        ...devices['iPad Pro'],
        baseURL: BASE_URL,
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'chromium-tablet-768',
      use: {
        ...devices['iPad Pro'],
        baseURL: BASE_URL,
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'chromium-mobile-390',
      use: {
        ...devices['Pixel 5'],
        baseURL: BASE_URL,
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'chromium-mobile-393',
      use: {
        ...devices['Pixel 7'],
        baseURL: BASE_URL,
        viewport: { width: 393, height: 852 },
      },
    },
    {
      name: 'chromium-mobile-412',
      use: {
        ...devices['Samsung Galaxy S21'],
        baseURL: BASE_URL,
        viewport: { width: 412, height: 915 },
      },
    },
  ],

  webServer: undefined,
});
