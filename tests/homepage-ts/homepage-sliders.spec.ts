/**
 * Slider & Carousel Tests
 * Tests image carousels, sliders, and rotating content
 */

import { test, expect, Page } from '@playwright/test';
import { isThirdPartyError, openHomepage } from './helpers';

const activeHeroImageSrc = (page: Page) =>
  page.locator('.slick-slide.slick-active img').first().evaluate((img) => (img as HTMLImageElement).src);

test.describe('Sliders & Carousels', () => {
  test('TC-HOME-017: Hero carousel shows a loaded image', async ({ page }) => {
    await openHomepage(page);
    await expect
      .poll(
        () => page.locator('.slick-slide.slick-active img').first().evaluate((img) => (img as HTMLImageElement).naturalWidth),
        { timeout: 30000 }
      )
      .toBeGreaterThan(0);
  });

  test('TC-HOME-018: Next control changes the hero slide', async ({ page }) => {
    await openHomepage(page);
    const next = page.locator('.slick-next').filter({ visible: true }).first();
    await expect(next).toBeVisible({ timeout: 15000 });
    const before = await activeHeroImageSrc(page);
    await next.click();
    await expect.poll(() => activeHeroImageSrc(page), { timeout: 10000 }).not.toBe(before);
  });

  test('TC-HOME-019: Hero carousel has more than one slide', async ({ page }) => {
    await openHomepage(page);
    await expect(page.locator('.slick-slide').first()).toBeAttached({ timeout: 30000 });
    const slides = await page.locator('.slick-slide:not(.slick-cloned)').count();
    expect(slides, 'hero carousel slides').toBeGreaterThan(1);
  });

  test('TC-HOME-020: Hero carousel advances on its own', async ({ page }) => {
    await openHomepage(page);
    const before = await activeHeroImageSrc(page);
    await expect.poll(() => activeHeroImageSrc(page), { timeout: 20000, intervals: [1000] }).not.toBe(before);
  });

  test('TC-HOME-021: Product rows scroll horizontally', async ({ page }) => {
    await openHomepage(page);
    const scrolled = await page.evaluate(async () => {
      const row = Array.from(document.querySelectorAll<HTMLElement>('*')).find((el) => {
        const s = getComputedStyle(el);
        return (s.overflowX === 'auto' || s.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 50;
      });
      if (!row) return null;
      const before = row.scrollLeft;
      row.scrollLeft += 200;
      await new Promise((r) => setTimeout(r, 200));
      return row.scrollLeft > before;
    });
    expect(scrolled, 'no horizontally scrollable product row found').toBe(true);
  });

  test('TC-HOME-022: Slider advances without uncaught page errors', async ({ page }, testInfo) => {
    test.fail(testInfo.project.name.startsWith('chromium-desktop'), 'Known site defect: React hydration error #418 on load');
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));

    await openHomepage(page);

    await test.step('Next control advances the hero five times', async () => {
      const next = page.locator('.slick-next').filter({ visible: true }).first();
      await expect(next).toBeVisible({ timeout: 15000 });
      for (let i = 0; i < 5; i++) {
        await next.click();
        await page.waitForTimeout(300);
      }
    });

    await test.step('No uncaught JavaScript errors', async () => {
      const siteErrors = pageErrors.filter((m) => !isThirdPartyError(m));
      expect(siteErrors, `uncaught page errors:\n${siteErrors.join('\n')}`).toEqual([]);
    });
  });
});
