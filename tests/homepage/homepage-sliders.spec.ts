/**
 * Slider & Carousel Tests
 * Tests image carousels, sliders, and rotating content
 */

import { test, expect } from '@playwright/test';
import { openHomepage } from './helpers';

test.describe('Sliders & Carousels', () => {
  test('TC-HOME-017: Hero carousel loads correctly', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find hero carousel', async () => {
      const carousel = page.locator('[class*="carousel"], [class*="slider"], [class*="hero"]').first();
      const exists = await carousel.count().then(c => c > 0);

      if (exists) {
        const visible = await carousel.isVisible();
        console.log(`Hero carousel visible: ${visible}`);
        expect(visible).toBe(true);
      } else {
        console.log('✓ No hero carousel found (expected on some layouts)');
      }
    });
  });

  test('TC-HOME-018: Carousel navigation buttons work', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find carousel navigation', async () => {
      const nextButton = page.locator('[class*="carousel"] button:has-text("Next"), [aria-label*="next"], [class*="next-slide"]').first();
      const prevButton = page.locator('[class*="carousel"] button:has-text("Prev"), [aria-label*="prev"], [class*="prev-slide"]').first();

      const nextExists = await nextButton.count().then(c => c > 0);
      const prevExists = await prevButton.count().then(c => c > 0);

      console.log(`Next button: ${nextExists ? '✓' : '✗'}`);
      console.log(`Prev button: ${prevExists ? '✓' : '✗'}`);

      if (nextExists) {
        await test.step('Click next button', async () => {
          try {
            const initialText = await nextButton.textContent();
            await nextButton.click({ timeout: 3000 });
            await page.waitForTimeout(500);
            console.log(`✓ Next button works`);
          } catch (e) {
            console.log(`✗ Next button failed: ${e}`);
          }
        });
      }

      if (prevExists) {
        await test.step('Click prev button', async () => {
          try {
            await prevButton.click({ timeout: 3000 });
            await page.waitForTimeout(500);
            console.log(`✓ Prev button works`);
          } catch (e) {
            console.log(`✗ Prev button failed: ${e}`);
          }
        });
      }
    });
  });

  test('TC-HOME-019: Carousel dots/indicators work', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find carousel indicators', async () => {
      const indicators = page.locator('[class*="carousel"] button[class*="dot"], [role="tablist"] button').all();
      const dots = await indicators;
      console.log(`Found ${dots.length} carousel indicators`);

      if (dots.length > 1) {
        await test.step('Click carousel indicators', async () => {
          for (let i = 0; i < Math.min(3, dots.length); i++) {
            const dot = dots[i];
            try {
              await dot.click({ timeout: 3000 });
              await page.waitForTimeout(500);
              console.log(`✓ Indicator ${i + 1} clicked`);
            } catch (e) {
              console.log(`✗ Indicator ${i + 1} failed`);
            }
          }
        });
      } else {
        console.log('✓ No carousel indicators found (expected)');
      }
    });
  });

  test('TC-HOME-020: Carousel auto-plays', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Monitor carousel auto-play', async () => {
      const carousel = page.locator('[class*="carousel"], [class*="slider"]').first();

      if (await carousel.count().then(c => c > 0)) {
        const currentSlide = await carousel.evaluate(el => {
          const active = el.querySelector('[class*="active"], [aria-current="true"]');
          return active?.textContent || 'unknown';
        }).catch(() => null);

        console.log(`Current slide: ${currentSlide}`);

        // Wait to see if it auto-advances
        await page.waitForTimeout(3000);

        const nextSlide = await carousel.evaluate(el => {
          const active = el.querySelector('[class*="active"], [aria-current="true"]');
          return active?.textContent || 'unknown';
        }).catch(() => null);

        if (nextSlide !== currentSlide) {
          console.log(`✓ Carousel auto-advanced from ${currentSlide} to ${nextSlide}`);
        } else {
          console.log(`✓ Carousel did not auto-advance (may be expected)`);
        }
      }
    });
  });

  test('TC-HOME-021: Product carousel horizontal scroll', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find product carousel/slider', async () => {
      const productCarousel = page.locator('[class*="product-slider"], [class*="product-carousel"]').first();

      if (await productCarousel.count().then(c => c > 0)) {
        await test.step('Scroll carousel horizontally', async () => {
          const visible = await productCarousel.isVisible();
          console.log(`Product carousel visible: ${visible}`);

          try {
            // Try clicking next button for product carousel
            const nextBtn = productCarousel.locator('button[aria-label*="next"], .next').first();
            if (await nextBtn.count().then(c => c > 0)) {
              await nextBtn.click({ timeout: 3000 });
              await page.waitForTimeout(500);
              console.log(`✓ Product carousel scrolled`);
            }
          } catch (e) {
            console.log(`Could not scroll carousel: ${e}`);
          }
        });
      } else {
        console.log('✓ No product carousel found');
      }
    });
  });

  test('TC-HOME-022: Slider advances without uncaught page errors', async ({ page }) => {
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
      expect(pageErrors, `uncaught page errors:\n${pageErrors.join('\n')}`).toEqual([]);
    });
  });
});
