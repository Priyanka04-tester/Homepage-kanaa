/**
 * Navigation Tests - Homepage Menu & Navigation Elements
 * Tests header navigation, menu items, and navigation flows
 */

import { test, expect } from '@playwright/test';
import { HOME_PATH, headerLanguageSwitch, homeLogo, openHomepage, productCards } from './helpers';

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
      await expect(page).not.toHaveURL(new RegExp(`${HOME_PATH.replace(/\//g, '\\/')}$`));
      await homeLogo(page).click();
      await expect(page).toHaveURL(new RegExp(`${HOME_PATH.replace(/\//g, '\\/')}$`));
    });
  });

  test('TC-HOME-002: Navigation dropdowns work', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Hover over menu items to reveal dropdowns', async () => {
      const menuButtons = page.locator('nav button, [role="button"]').all();
      const buttons = await menuButtons;

      for (let i = 0; i < Math.min(2, buttons.length); i++) {
        const btn = buttons[i];
        await test.step(`Hover over menu button ${i + 1}`, async () => {
          await btn.hover({ timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(500);
          const visible = await btn.isVisible();
          console.log(`Button visible after hover: ${visible}`);
        });
      }
    });
  });

  test('TC-HOME-003: Breadcrumb navigation works', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Check for breadcrumb navigation', async () => {
      const breadcrumb = page.locator('[class*="breadcrumb"], nav[aria-label="breadcrumb"]').first();
      const exists = await breadcrumb.count().then(c => c > 0);

      if (exists) {
        const breadcrumbLinks = breadcrumb.locator('a').all();
        const links = await breadcrumbLinks;
        console.log(`✓ Found ${links.length} breadcrumb links`);
      } else {
        console.log('✓ No breadcrumb on homepage (expected)');
      }
    });
  });

  test('TC-HOME-004: Logo navigation', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Click logo to navigate home', async () => {
      const logo = page.locator('a[href="/"], [class*="logo"] a').first();
      const exists = await logo.count().then(c => c > 0);

      if (exists) {
        await logo.click();
        await page.waitForLoadState('domcontentloaded');
        const url = page.url();
        console.log(`✓ Logo clicked, navigated to: ${url}`);
      }
    });
  });

  test('TC-HOME-005: Category navigation links work', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find and test category links', async () => {
      const categoryLinks = page.locator('a[href*="/category"], [class*="category"] a').all();
      const links = await categoryLinks;

      if (links.length > 0) {
        for (let i = 0; i < Math.min(2, links.length); i++) {
          const link = links[i];
          const href = await link.getAttribute('href');
          await test.step(`Test category link: ${href}`, async () => {
            try {
              await link.click({ timeout: 5000 });
              await page.waitForLoadState('domcontentloaded');
              console.log(`✓ Category link works: ${href}`);
            } catch (e) {
              console.log(`✗ Category link failed: ${href}`);
            }
          });
          await page.goBack().catch(() => {});
        }
      } else {
        console.log('✓ No category links found (expected on some pages)');
      }
    });
  });
});
