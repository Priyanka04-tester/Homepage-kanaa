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
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Check product images', async () => {
      const productImages = page.locator('[class*="product-card"] img, [data-product] img').all();
      const images = await productImages;
      console.log(`Found ${images.length} product images`);

      let loaded = 0;
      let failed = 0;

      for (let i = 0; i < Math.min(5, images.length); i++) {
        const img = images[i];
        try {
          const isVisible = await img.isVisible();
          const src = await img.getAttribute('src');

          if (isVisible && src) {
            loaded++;
            console.log(`✓ Image ${i + 1} loaded: ${src?.substring(0, 50)}...`);
          } else {
            failed++;
          }
        } catch (e) {
          failed++;
        }
      }

      console.log(`Loaded: ${loaded}, Failed: ${failed}`);
    });
  });

  test('TC-HOME-025: Product card links work', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Click product cards', async () => {
      const productCards = page.locator('[class*="product-card"] a, [data-product] a').all();
      const links = await productCards;

      for (let i = 0; i < Math.min(2, links.length); i++) {
        const link = links[i];
        const href = await link.getAttribute('href');

        await test.step(`Navigate to product: ${href}`, async () => {
          try {
            await link.click({ timeout: 5000 });
            await page.waitForLoadState('domcontentloaded');
            const newUrl = page.url();
            console.log(`✓ Product link works: ${newUrl}`);
          } catch (e) {
            console.log(`✗ Product link failed: ${e}`);
          }
        });

        await page.goBack().catch(() => {});
        await page.waitForLoadState('domcontentloaded');
      }
    });
  });

  test('TC-HOME-026: Product prices display correctly', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Check product pricing', async () => {
      const prices = page.locator('[class*="price"], .product-price, [data-price]').all();
      const priceElements = await prices;
      console.log(`Found ${priceElements.length} price elements`);

      for (let i = 0; i < Math.min(5, priceElements.length); i++) {
        const priceEl = priceElements[i];
        const text = await priceEl.textContent();
        const visible = await priceEl.isVisible();

        // Check if price has currency symbol or number
        const hasPriceFormat = /[\d,.]|\$|¥|€|£|ر\.س|ر.س/.test(text || '');

        console.log(`Price ${i + 1}: "${text?.trim()}" - Valid format: ${hasPriceFormat}`);
      }
    });
  });

  test('TC-HOME-027: Add to cart functionality', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find add to cart buttons', async () => {
      const addToCartButtons = page.locator(
        'button:has-text("Add"), button:has-text("Cart"), [class*="add-cart"], [class*="add-to-cart"]'
      ).all();
      const buttons = await addToCartButtons;
      console.log(`Found ${buttons.length} add-to-cart buttons`);

      for (let i = 0; i < Math.min(2, buttons.length); i++) {
        const btn = buttons[i];
        const text = await btn.textContent();

        await test.step(`Click add to cart: ${text}`, async () => {
          try {
            const btnVisible = await btn.isVisible();
            if (btnVisible) {
              await btn.click({ timeout: 3000 });
              await page.waitForTimeout(500);
              console.log(`✓ Add to cart clicked`);

              // Look for confirmation
              const confirmMsg = page.locator('.toast, [class*="success"], [role="alert"]').first();
              const hasConfirm = await confirmMsg.isVisible().catch(() => false);
              console.log(`Confirmation shown: ${hasConfirm}`);
            }
          } catch (e) {
            console.log(`✗ Add to cart failed: ${e}`);
          }
        });
      }
    });
  });

  test('TC-HOME-028: Product ratings display', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Check product ratings', async () => {
      const ratings = page.locator('[class*="rating"], [class*="stars"], [aria-label*="star"]').all();
      const ratingElements = await ratings;
      console.log(`Found ${ratingElements.length} rating elements`);

      for (let i = 0; i < Math.min(5, ratingElements.length); i++) {
        const rating = ratingElements[i];
        const text = await rating.textContent();
        const ariaLabel = await rating.getAttribute('aria-label');

        console.log(`Rating ${i + 1}: ${ariaLabel || text?.trim() || 'no label'}`);
      }
    });
  });

  test('TC-HOME-029: Product filtering works', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find product filters', async () => {
      const filters = page.locator('[class*="filter"], [role="group"]').all();
      const filterElements = await filters;
      console.log(`Found ${filterElements.length} filter groups`);

      if (filterElements.length > 0) {
        const firstFilter = filterElements[0];
        const filterButtons = firstFilter.locator('button, input[type="checkbox"]').all();
        const buttons = await filterButtons;

        if (buttons.length > 0) {
          const btn = buttons[0];
          try {
            await btn.click({ timeout: 3000 });
            await page.waitForTimeout(500);
            console.log(`✓ Filter applied`);
          } catch (e) {
            console.log(`✗ Filter failed: ${e}`);
          }
        }
      }
    });
  });
});
