/**
 * Navigation Tests - Homepage Menu & Navigation Elements
 * Tests header navigation, menu items, and navigation flows
 */

import { test, expect } from '@playwright/test';
import { HOME_PATH, headerLanguageSwitch, homeLogo, openHomepage, productCards } from './helpers';

const HOME_REGEX = new RegExp(`${HOME_PATH.replace(/\//g, '\\/')}$`);

test.describe('Navigation - Menu & Navigation Elements', () => {
  test('TC-HOME-001: Header controls are visible and the logo returns home', async ({ page }) => {
    await openHomepage(page);

    await test.step('Logo and language switch are visible', async () => {
      await expect(homeLogo(page)).toBeVisible();
      await expect(headerLanguageSwitch(page)).toBeVisible();
    });

    await test.step('Logo returns to the locale homepage from a product page', async () => {
      const cards = productCards(page);
      await cards.first().waitFor({ state: 'attached', timeout: 30000 });
      await cards.first().click();
      await expect(page).not.toHaveURL(HOME_REGEX);
      await homeLogo(page).click();
      await expect(page).toHaveURL(HOME_REGEX);
    });
  });

  test('TC-HOME-002: Language switch toggles locale and text direction', async ({ page }) => {
    await openHomepage(page);
    const arPath = HOME_PATH.replace(/^\/en-/, '/ar-');

    await headerLanguageSwitch(page).click();
    await page.waitForURL((u) => u.pathname === arPath, { timeout: 30000 });
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await headerLanguageSwitch(page).click();
    await page.waitForURL((u) => u.pathname === HOME_PATH, { timeout: 30000 });
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('TC-HOME-003: Product page links back to a category', async ({ page }) => {
    await openHomepage(page);
    const cards = productCards(page);
    await cards.first().waitFor({ state: 'attached', timeout: 30000 });
    await cards.first().click();
    await page.waitForLoadState('domcontentloaded');

    const categoryLinks = page
      .locator('a[href]')
      .filter({ hasText: /Toys & Games|Baby Essentials|Books & Stationery|Electronics|Gaming|Mobile Phones/ })
      .filter({ visible: true });
    expect(await categoryLinks.count(), 'no category breadcrumb on product page').toBeGreaterThan(0);
  });

  test('TC-HOME-004: Logo image has descriptive alt text', async ({ page }) => {
    await openHomepage(page);
    const alt = await homeLogo(page).locator('img').first().getAttribute('alt');
    expect(alt, 'logo image has no alt text').toMatch(/logo|kanaa/i);
  });

  test('TC-HOME-005: Category links return a working page', async ({ page }) => {
    await openHomepage(page);
    const hrefs = await page.locator('a[href]').evaluateAll((els) => {
      const names = /^(Toys & Games|Baby Essentials|Books & Stationery|Arts & Crafts|Cars & Vehicles|Super Heroes|Dolls & Collectibles|Educational)$/;
      return Array.from(
        new Set(els.filter((a) => names.test((a.textContent || '').trim())).map((a) => a.getAttribute('href') || ''))
      ).slice(0, 6);
    });
    expect(hrefs.length, 'no category links found').toBeGreaterThan(0);

    const broken: string[] = [];
    for (const href of hrefs) {
      const res = await page.request.get(new URL(href, page.url()).toString(), { failOnStatusCode: false });
      if (res.status() >= 400) broken.push(`${res.status()} ${href}`);
    }
    expect(broken, `broken category links:\n${broken.join('\n')}`).toEqual([]);
  });
});
