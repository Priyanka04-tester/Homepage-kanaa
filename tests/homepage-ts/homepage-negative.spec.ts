/**
 * Negative Tests - Edge Cases and Error Handling
 * Tests behavior under adverse conditions
 */

import { test, expect } from '@playwright/test';
import { HOME_PATH, headerLanguageSwitch, homeLogo, isThirdPartyError, openHomepage } from './helpers';

const IMAGE_URLS = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i;
const THIRD_PARTY_URLS = /webengage|mixpanel/i;

test.describe('Negative Tests & Error Handling', () => {
  test('TC-HOME-045: Homepage stays usable when images load slowly', async ({ page }) => {
    await page.route(IMAGE_URLS, async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });
    await openHomepage(page);
    await expect(headerLanguageSwitch(page)).toBeVisible();
  });

  test('TC-HOME-046: Homepage keeps its header when images fail to load', async ({ page }) => {
    await page.route(IMAGE_URLS, (route) => route.abort());
    await page.goto('./');
    await expect(homeLogo(page)).toBeVisible({ timeout: 30000 });
    await expect(headerLanguageSwitch(page)).toBeVisible();
  });

  test('TC-HOME-047: Homepage has no uncaught JavaScript errors on load', async ({ page }) => {
    test.fail(true, 'Known site defect: React hydration error #418 on load');
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await openHomepage(page);
    await page.waitForTimeout(3000);
    const siteErrors = pageErrors.filter((m) => !isThirdPartyError(m));
    expect(siteErrors, `uncaught page errors:\n${siteErrors.join('\n')}`).toEqual([]);
  });

  test('TC-HOME-048: Homepage works when third-party analytics are blocked', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.route(THIRD_PARTY_URLS, (route) => route.abort());
    await openHomepage(page);
    await expect(headerLanguageSwitch(page)).toBeVisible();
    const ownErrors = pageErrors.filter((m) => !/webengage|mixpanel/i.test(m));
    expect(ownErrors, `errors caused by the site itself:\n${ownErrors.join('\n')}`).toEqual([]);
  });

  test('TC-HOME-049: Homepage content is in the DOM when stylesheets fail', async ({ page }) => {
    await page.route(/\.css(\?|$)/i, (route) => route.abort());
    await page.goto('./');
    await expect(page.locator(`a[href="${HOME_PATH}"]`).first()).toBeAttached({ timeout: 30000 });
    await expect(page.locator('a[href]').filter({ has: page.locator('img') }).first()).toBeAttached();
  });

  test('TC-HOME-050: Homepage renders its main content without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(process.env.BASE_URL || 'https://thekanaa.com/en-sa/');
    await expect(page.locator(`a[href="${HOME_PATH}"]`).first()).toBeAttached();
    const productLinks = await page.locator('a[href$=".html"]').count();
    expect(productLinks, 'no product links in server-rendered HTML').toBeGreaterThan(0);
    await context.close();
  });

  test('TC-HOME-051: Offline reload fails cleanly and recovers when back online', async ({ page }) => {
    await openHomepage(page);
    await page.context().setOffline(true);
    await expect(page.reload({ timeout: 10000 })).rejects.toThrow();
    await page.context().setOffline(false);
    await openHomepage(page);
    await expect(headerLanguageSwitch(page)).toBeVisible();
  });

  test('TC-HOME-052: Repeated fast homepage loads keep the header', async ({ page }) => {
    for (let i = 1; i <= 5; i++) {
      await test.step(`Load ${i}`, async () => {
        await openHomepage(page);
        await expect(headerLanguageSwitch(page)).toBeVisible();
      });
    }
  });

  test('TC-HOME-053: Homepage logs no console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await openHomepage(page);
    await page.waitForTimeout(3000);
    const siteErrors = consoleErrors.filter((m) => !isThirdPartyError(m));
    expect(siteErrors, `console errors:\n${siteErrors.join('\n')}`).toEqual([]);
  });
});
