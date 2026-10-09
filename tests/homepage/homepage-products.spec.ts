/**
 * Product Tests - Product Cards & Product Display
 * Tests product listings, product cards, and product interactions
 */

import { test, expect } from '@playwright/test';
import { openHomepage, productCards } from './helpers';

test.describe('Products & Product Cards', () => {
  test('TC-HOME-023: Product cards are displayed with name and price', async ({ page }) => {
    await openHomepage(page);
    const cards = productCards(page);
    await cards.first().waitFor({ state: 'attached', timeout: 30000 });
    const count = await cards.count();
    expect(count, 'no product cards found').toBeGreaterThan(0);

    for (let i = 0; i < Math.min(5, count); i++) {
      const card = cards.nth(i);
      await expect(card).toBeVisible();
      const text = (await card.innerText()).replace(/\s+/g, ' ').trim();
      expect(text, `product card ${i + 1} has no name or price`).toMatch(/[A-Za-z].*\d/);
      console.log(`Product ${i + 1}: ${text.slice(0, 80)}`);
    }
  });

  test('TC-HOME-024: Product card images load', async ({ page }) => {
    await openHomepage(page);
    const cards = productCards(page);
    await cards.first().waitFor({ state: 'attached', timeout: 30000 });
    const images = cards.locator('img');
    const n = Math.min(10, await images.count());
    expect(n, 'product cards have no images').toBeGreaterThan(0);

    for (let i = 0; i < n; i++) {
      await images.nth(i).scrollIntoViewIfNeeded();
      await expect
        .poll(() => images.nth(i).evaluate((img) => (img as HTMLImageElement).naturalWidth), {
          message: `product image ${i + 1} did not load`,
          timeout: 15000,
        })
        .toBeGreaterThan(0);
    }
  });

  test('TC-HOME-025: Product card links open a working product page', async ({ page }) => {
    await openHomepage(page);
    const cards = productCards(page);
    await cards.first().waitFor({ state: 'attached', timeout: 30000 });
    const hrefs = await cards.evaluateAll((els) => els.slice(0, 5).map((a) => a.getAttribute('href') || ''));

    const broken: string[] = [];
    for (const href of hrefs) {
      const res = await page.request.get(new URL(href, page.url()).toString(), { failOnStatusCode: false });
      if (res.status() >= 400) broken.push(`${res.status()} ${href}`);
    }
    expect(broken, `broken product links:\n${broken.join('\n')}`).toEqual([]);
  });

  test('TC-HOME-026: Product prices are shown as numbers', async ({ page }) => {
    await openHomepage(page);
    const cards = productCards(page);
    await cards.first().waitFor({ state: 'attached', timeout: 30000 });
    const n = Math.min(10, await cards.count());

    for (let i = 0; i < n; i++) {
      const text = (await cards.nth(i).innerText()).replace(/\s+/g, ' ');
      expect(text, `product card ${i + 1} has no numeric price`).toMatch(/\d{1,3}(,\d{3})*(\.\d+)?/);
    }
  });

  test('TC-HOME-027: Product page shows an enabled Add to Cart button', async ({ page }) => {
    await openHomepage(page);
    const cards = productCards(page);
    await cards.first().waitFor({ state: 'attached', timeout: 30000 });
    await cards.first().click();
    await page.waitForLoadState('domcontentloaded');
    const addToCart = page.locator('button[aria-label="Add to Cart"]').filter({ visible: true }).first();
    await expect(addToCart).toBeEnabled({ timeout: 30000 });
  });

  test('TC-HOME-028: Product cards show a numeric rating', async ({ page }) => {
    await openHomepage(page);
    const cards = productCards(page);
    await cards.first().waitFor({ state: 'attached', timeout: 30000 });
    const rated = await cards.evaluateAll((els) =>
      els.slice(0, 16).filter((a) => /\b[0-5]\.\d\b/.test((a as HTMLElement).innerText)).length
    );
    expect(rated, 'no product card shows a rating').toBeGreaterThan(0);
  });

  test('TC-HOME-029: "Most popular" category tab opens its listing', async ({ page }) => {
    await openHomepage(page);
    const tab = page.locator('a').filter({ hasText: /^Electronics$/ }).filter({ visible: true }).first();
    await expect(tab).toBeVisible({ timeout: 30000 });
    const path = new URL((await tab.getAttribute('href')) || '', page.url()).pathname;
    await tab.click();
    await page.waitForURL((u) => u.pathname === path, { timeout: 30000 });
    const res = await page.request.get(page.url(), { failOnStatusCode: false });
    expect(res.status(), `tab listing ${path}`).toBeLessThan(400);
  });
});
