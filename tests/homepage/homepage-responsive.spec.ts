/**
 * Responsive Design Tests
 * Tests homepage on different viewports and devices
 */

import { test, expect } from '@playwright/test';
import { headerLanguageSwitch, homeLogo, productCards } from './helpers';

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 390, height: 844 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 }
  ];

  for (const viewport of viewports) {
    test(`TC-HOME-037: Layout on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('./');
      await expect(homeLogo(page)).toBeVisible({ timeout: 30000 });

      await test.step('Logo and language switch are visible', async () => {
        await expect(homeLogo(page)).toBeVisible();
        await expect(headerLanguageSwitch(page)).toBeVisible();
      });

      await test.step('No horizontal page scroll', async () => {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(0);
      });
    });
  }

  test('TC-HOME-040: Mobile header menu button opens category navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('./');
    await expect(homeLogo(page)).toBeVisible({ timeout: 30000 });

    const visibleLinks = () => page.locator('a[href]').filter({ visible: true }).count();
    const before = await visibleLinks();

    const menuButton = page.locator('button').filter({ visible: true }).first();
    await expect(menuButton, 'no menu button at the top of the mobile header').toBeVisible();
    await menuButton.click();

    await expect
      .poll(visibleLinks, { message: 'menu did not reveal category links', timeout: 10000 })
      .toBeGreaterThan(before + 5);
  });

  test('TC-HOME-041: Section headings fit the tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('./');
    await expect(homeLogo(page)).toBeVisible({ timeout: 30000 });

    const overflowing = await page.locator('h2').evaluateAll((els) =>
      els
        .filter((e) => (e as HTMLElement).offsetParent !== null)
        .filter((e) => e.getBoundingClientRect().right > window.innerWidth)
        .map((e) => (e.textContent || '').trim().slice(0, 40))
    );
    expect(overflowing, `headings wider than the viewport:\n${overflowing.join('\n')}`).toEqual([]);
  });

  test('TC-HOME-042: Product card buttons meet the 24px minimum target size on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('./');
    await expect(homeLogo(page)).toBeVisible({ timeout: 30000 });

    const cards = productCards(page);
    await cards.first().waitFor({ state: 'attached', timeout: 30000 });
    const buttons = cards.locator('button').filter({ visible: true });
    const n = Math.min(10, await buttons.count());
    for (let i = 0; i < n; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box, `button ${i + 1} has no box`).not.toBeNull();
      expect(Math.min(box!.width, box!.height), `button ${i + 1} is smaller than 24px`).toBeGreaterThanOrEqual(24);
    }
  });

  test('TC-HOME-043: Body text stays at least 12px on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('./');
    await expect(homeLogo(page)).toBeVisible({ timeout: 30000 });

    const small = await page.locator('p, span, a, li').evaluateAll((els) =>
      els
        .filter((e) => (e as HTMLElement).offsetParent !== null && (e.textContent || '').trim().length > 20)
        .map((e) => ({ size: parseFloat(getComputedStyle(e).fontSize), text: (e.textContent || '').trim().slice(0, 40) }))
        .filter((x) => x.size < 12)
    );
    expect(small, `text below 12px on mobile:\n${small.map((s) => `${s.size}px ${s.text}`).join('\n')}`).toEqual([]);
  });

  test('TC-HOME-044: Images fit within the mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('./');
    await expect(homeLogo(page)).toBeVisible({ timeout: 30000 });

    const wide = await page.locator('img').evaluateAll((els) =>
      els
        .filter((img) => (img as HTMLElement).offsetParent !== null)
        .map((img) => ({ w: img.getBoundingClientRect().width, src: (img as HTMLImageElement).src }))
        .filter((x) => x.w > window.innerWidth + 1)
        .map((x) => `${Math.round(x.w)}px ${x.src}`)
    );
    expect(wide, `images wider than 390px:\n${wide.join('\n')}`).toEqual([]);
  });
});
