/**
 * Regression Tests - Critical Functionality Verification
 * Tests for previously found bugs and critical features
 */

import { test, expect } from '@playwright/test';
import { HOME_PATH, headerLanguageSwitch, homeLogo, openHomepage } from './helpers';

test.describe('Regression Tests - Critical Features', () => {
  test('TC-HOME-054: Core homepage loads every time', async ({ page }) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      await test.step(`Load attempt ${attempt}`, async () => {
        const response = await page.goto('./');
        expect(response?.status(), `attempt ${attempt} status`).toBeLessThan(400);
        await expect(homeLogo(page)).toBeVisible({ timeout: 30000 });
      });
    }
  });

  test('TC-HOME-055: Essential header elements always present', async ({ page }) => {
    await openHomepage(page);
    await expect(homeLogo(page)).toBeVisible();
    await expect(headerLanguageSwitch(page)).toBeVisible();
  });

  test('TC-HOME-056: Homepage returns no server errors on load', async ({ page }) => {
    const serverErrors: string[] = [];
    page.on('response', (res) => {
      if (res.status() >= 500) serverErrors.push(`${res.status()} ${res.url()}`);
    });
    await openHomepage(page);
    await page.waitForTimeout(2000);
    expect(serverErrors, `server errors:\n${serverErrors.join('\n')}`).toEqual([]);
  });

  test('TC-HOME-057: Homepage header is consistent across repeated loads', async ({ page }) => {
    for (let i = 1; i <= 3; i++) {
      await test.step(`Load ${i}`, async () => {
        await openHomepage(page);
        await expect(headerLanguageSwitch(page)).toBeVisible();
      });
    }
  });

  test('TC-HOME-058: Header controls remain visible after scrolling', async ({ page }) => {
    await openHomepage(page);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(homeLogo(page)).toBeVisible();
    await expect(headerLanguageSwitch(page)).toBeVisible();
  });

  test('TC-HOME-059: Homepage DOM is ready within 10 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    console.log(`DOMContentLoaded in ${elapsed}ms`);
    expect(elapsed, 'DOMContentLoaded time').toBeLessThan(10000);
  });

  test('TC-HOME-060: No link drops the locale or points to another locale', async ({ page }) => {
    await openHomepage(page);

    await test.step('No root link that drops the locale prefix', async () => {
      await expect(page.locator('a[href="/"]')).toHaveCount(0);
    });

    await test.step('No links to the other locale on the English page', async () => {
      const otherLocale = HOME_PATH.startsWith('/en-') ? '/ar-' : '/en-';
      await expect(page.locator(`a[href^="${otherLocale}"]`)).toHaveCount(0);
    });
  });

  test('TC-HOME-061: Hero carousel shows a loaded image', async ({ page }) => {
    await openHomepage(page);
    await expect
      .poll(
        () => page.locator('.slick-slide.slick-active img').first().evaluate((img) => (img as HTMLImageElement).naturalWidth),
        { timeout: 30000 }
      )
      .toBeGreaterThan(0);
  });

  test('TC-HOME-063: Footer legal links have accessible text', async ({ page }) => {
    await openHomepage(page);
    const legal = page.locator('a[href]').filter({ hasText: /Privacy Policy|Terms & Conditions|Shipping Policy|Warranty Policy/ });
    expect(await legal.count(), 'footer legal links').toBeGreaterThanOrEqual(4);
    for (let i = 0; i < (await legal.count()); i++) {
      await expect(legal.nth(i)).toHaveText(/\S/);
    }
  });

  test('TC-HOME-064: English and Arabic homepages both load', async ({ page }) => {
    const origin = new URL(process.env.BASE_URL || 'https://thekanaa.com/en-sa/').origin;
    const arPath = HOME_PATH.replace(/^\/en-/, '/ar-');
    const en = await page.request.get(origin + HOME_PATH, { failOnStatusCode: false });
    const ar = await page.request.get(origin + arPath, { failOnStatusCode: false });
    expect(en.status(), 'English homepage').toBeLessThan(400);
    expect(ar.status(), 'Arabic homepage').toBeLessThan(400);
    await page.goto(arPath);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});
