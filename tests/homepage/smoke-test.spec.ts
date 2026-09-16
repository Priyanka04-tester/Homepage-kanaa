/**
 * Smoke Test - Homepage Accessibility
 * Minimal test: Does the homepage respond?
 */

import { test, expect } from '@playwright/test';

test('SC-001: Homepage responds with 200', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  console.log('✓ Homepage returns 200 OK');
});

test('SC-002: English version responds', async ({ page }) => {
  const response = await page.goto('/en-sa/');
  expect(response?.status()).toBeLessThan(400);
  console.log(`✓ English version: ${response?.status()}`);
});

test('SC-003: Arabic version responds', async ({ page }) => {
  const response = await page.goto('/ar-sa/');
  expect(response?.status()).toBeLessThan(400);
  console.log(`✓ Arabic version: ${response?.status()}`);
});

test('SC-004: Page has content', async ({ page }) => {
  await page.goto('/');

  // Wait briefly for rendering
  await page.locator('body').waitFor({ state: 'visible', timeout: 5000 });

  const content = await page.locator('body').innerHTML();
  expect(content.length).toBeGreaterThan(100);
  console.log(`✓ Page content: ${content.length} bytes`);
});

test('SC-005: Page has interactive elements', async ({ page }) => {
  await page.goto('/');

  const buttons = await page.locator('button').count();
  const links = await page.locator('a[href]').count();

  const hasElements = buttons > 0 || links > 0;
  expect(hasElements).toBe(true);

  console.log(`✓ Found ${buttons} buttons, ${links} links`);
});
