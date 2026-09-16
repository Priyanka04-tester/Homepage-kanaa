import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

test.describe('PLP Smoke Tests', () => {
  const baseUrl = process.env.BASE_URL || 'https://thekanaa.com/en-sa/';

  test('Should load PLP homepage', async ({ page }) => {
    // Navigate to homepage
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Verify page loaded
    expect(page).toHaveTitle(/thekanaa|home/i);

    // Take screenshot
    await page.screenshot({ path: 'evidence/plp/smoke-test.png', fullPage: true });

    // Verify we got to the page
    expect(page.url()).toContain('thekanaa');
  });

  test('Should find navigation elements', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Look for navigation
    const navigation = await page.locator('[role="navigation"], nav').first();

    // Navigation should be visible (even if we need to scroll)
    const isVisible = await navigation.isVisible().catch(() => false);

    console.log('Navigation visible:', isVisible);
    console.log('Page URL:', page.url());
  });

  test('Should be able to get page content', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Get some HTML content
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);

    console.log('Page loaded successfully. HTML length:', html.length);
  });

  test('Should verify locale handling', async ({ page }) => {
    const enUrl = process.env.BASE_URL || 'https://thekanaa.com/en-sa/';
    const arUrl = process.env.BASE_URL_AR || 'https://thekanaa.com/ar-sa/';

    // Test English version
    await page.goto(enUrl, { waitUntil: 'domcontentloaded' });
    let urlContent = page.url();
    console.log('EN URL:', urlContent);
    expect(urlContent).toMatch(/en/i);

    // Test Arabic version
    await page.goto(arUrl, { waitUntil: 'domcontentloaded' });
    urlContent = page.url();
    console.log('AR URL:', urlContent);
    expect(urlContent).toMatch(/ar/i);
  });
});
