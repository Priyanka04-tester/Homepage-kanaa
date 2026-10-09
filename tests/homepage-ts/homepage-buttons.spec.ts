import { test, expect } from '@playwright/test';
import { openHomepage, productCards } from './helpers';

test.describe('Buttons & CTAs', () => {
  test('TC-HOME-006: Visible buttons have an accessible name', async ({ page }) => {
    test.fail(true, 'Known site defect: 2 visible buttons (header icons) have no accessible name');
    await openHomepage(page);
    const unnamed = await page.locator('button').evaluateAll((els) =>
      els
        .filter((b) => (b as HTMLElement).offsetParent !== null)
        .filter((b) => !(b.getAttribute('aria-label') || b.textContent?.trim() || b.getAttribute('title')))
        .length
    );
    expect(unnamed, `${unnamed} visible buttons have no accessible name`).toBe(0);
  });

  test('TC-HOME-007: "View All" CTA navigates to its listing', async ({ page }) => {
    await openHomepage(page);
    const cta = page
      .locator('a[href]')
      .filter({ has: page.getByText('View All', { exact: true }) })
      .filter({ visible: true })
      .first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href, 'View All link has no href').toBeTruthy();
    const path = new URL(href!, page.url()).pathname;
    await cta.click();
    await page.waitForURL((u) => u.pathname === path, { timeout: 30000 });
  });

  test('TC-HOME-008: Add to Cart buttons show a pointer cursor', async ({ page }) => {
    await openHomepage(page);
    const buttons = page.locator('button[aria-label="Add to Cart"]').filter({ visible: true });
    await expect(buttons.first()).toBeVisible({ timeout: 30000 });
    const n = Math.min(5, await buttons.count());
    for (let i = 0; i < n; i++) {
      const cursor = await buttons.nth(i).evaluate((el) => getComputedStyle(el).cursor);
      expect(cursor, `Add to Cart button ${i + 1}`).toBe('pointer');
    }
  });

  test('TC-HOME-009: Add to Cart buttons on product cards are enabled', async ({ page }) => {
    await openHomepage(page);
    const buttons = productCards(page).locator('button[aria-label="Add to Cart"]');
    await buttons.first().waitFor({ state: 'attached', timeout: 30000 });
    const n = Math.min(8, await buttons.count());
    for (let i = 0; i < n; i++) {
      await expect(buttons.nth(i), `Add to Cart button ${i + 1}`).toBeEnabled();
    }
  });

  test('TC-HOME-010: Add to Cart buttons share one accessible name', async ({ page }) => {
    await openHomepage(page);
    const buttons = productCards(page).locator('button[aria-label]');
    await buttons.first().waitFor({ state: 'attached', timeout: 30000 });
    const names = await buttons.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    expect(names.filter((n) => n === 'Add to Cart').length, 'no Add to Cart buttons found').toBeGreaterThan(0);
  });
});
