/**
 * Responsive Design Tests
 * Tests homepage on different viewports and devices
 */

import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 390, height: 844 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 }
  ];

  for (const viewport of viewports) {
    test(`TC-HOME-037: Layout on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      test.step('Verify viewport size', async () => {
        const actualSize = page.viewportSize();
        console.log(`Set viewport: ${viewport.width}x${viewport.height}`);
        console.log(`Actual viewport: ${actualSize?.width}x${actualSize?.height}`);
        expect(actualSize?.width).toBe(viewport.width);
      });

      test.step('Check header layout', async () => {
        const header = page.locator('header').first();
        const visible = await header.isVisible();
        console.log(`Header visible on ${viewport.name}: ${visible}`);
        expect(visible).toBe(true);
      });

      test.step('Check for horizontal scroll', async () => {
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        console.log(`Horizontal scroll on ${viewport.name}: ${overflow ? '✗ Present' : '✓ None'}`);
        expect(overflow).toBe(false);
      });

      test.step('Check main content area', async () => {
        const mainContent = page.locator('main, [role="main"]').first();
        const exists = await mainContent.count().then(c => c > 0);
        if (exists) {
          const box = await mainContent.boundingBox();
          console.log(`Main content box: ${box?.width}x${box?.height} on ${viewport.name}`);
        }
      });

      test.step(`Take ${viewport.name} screenshot`, async () => {
        const screenshotPath = `evidence/homepage/responsive-${viewport.name.toLowerCase()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
      });
    });
  }

  test('TC-HOME-040: Mobile menu functionality', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Look for mobile menu button', async () => {
      const menuButton = page.locator('button[aria-label*="menu"], button[class*="hamburger"], .mobile-menu-toggle').first();
      const exists = await menuButton.count().then(c => c > 0);

      console.log(`Mobile menu button found: ${exists}`);

      if (exists) {
        test.step('Click mobile menu', async () => {
          try {
            await menuButton.click();
            await page.waitForTimeout(500);
            console.log(`✓ Mobile menu opened`);

            // Check if menu is now visible
            const mobileMenu = page.locator('[class*="mobile-menu"], nav[class*="mobile"]').first();
            const visible = await mobileMenu.isVisible();
            console.log(`Mobile menu visible: ${visible}`);
          } catch (e) {
            console.log(`✗ Mobile menu click failed: ${e}`);
          }
        });
      }
    });
  });

  test('TC-HOME-041: Tablet layout optimization', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Verify tablet layout', async () => {
      const sections = page.locator('section, div[class*="section"]').all();
      const sectionElements = await sections;

      for (let i = 0; i < Math.min(3, sectionElements.length); i++) {
        const section = sectionElements[i];
        const box = await section.boundingBox();

        if (box) {
          const fullWidth = box.width >= 700; // Tablet width
          console.log(`Section ${i + 1}: ${box.width}px wide on tablet ${fullWidth ? '✓' : '✗'}`);
        }
      }
    });
  });

  test('TC-HOME-042: Touch target sizes on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Check button/link sizes for touch', async () => {
      const buttons = page.locator('button, a[role="button"]').all();
      const btnElements = await buttons;
      const MIN_TOUCH_TARGET = 44; // WCAG recommended

      let smallTargets = 0;

      for (let i = 0; i < Math.min(10, btnElements.length); i++) {
        const btn = btnElements[i];
        const box = await btn.boundingBox();

        if (box) {
          if (box.width < MIN_TOUCH_TARGET || box.height < MIN_TOUCH_TARGET) {
            smallTargets++;
            console.log(`⚠ Small touch target: ${box.width}x${box.height}px (recommended: ${MIN_TOUCH_TARGET}px)`);
          }
        }
      }

      if (smallTargets === 0) {
        console.log(`✓ All tested touch targets >= ${MIN_TOUCH_TARGET}px`);
      } else {
        console.log(`⚠ Found ${smallTargets} small touch targets`);
      }
    });
  });

  test('TC-HOME-043: Font sizes adapt to viewport', async ({ page }) => {
    const viewport1 = { width: 390, height: 844 };
    const viewport2 = { width: 1440, height: 900 };

    let fontSizes1: Record<string, number> = {};
    let fontSizes2: Record<string, number> = {};

    test.step('Measure fonts on mobile', async () => {
      await page.setViewportSize(viewport1);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      fontSizes1 = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const h2 = document.querySelector('h2');
        const p = document.querySelector('p');

        return {
          h1: parseInt(window.getComputedStyle(h1 || document.body).fontSize || '16'),
          h2: parseInt(window.getComputedStyle(h2 || document.body).fontSize || '16'),
          p: parseInt(window.getComputedStyle(p || document.body).fontSize || '16')
        };
      });

      console.log(`Mobile font sizes: h1=${fontSizes1.h1}px, h2=${fontSizes1.h2}px, p=${fontSizes1.p}px`);
    });

    test.step('Measure fonts on desktop', async () => {
      await page.setViewportSize(viewport2);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      fontSizes2 = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const h2 = document.querySelector('h2');
        const p = document.querySelector('p');

        return {
          h1: parseInt(window.getComputedStyle(h1 || document.body).fontSize || '16'),
          h2: parseInt(window.getComputedStyle(h2 || document.body).fontSize || '16'),
          p: parseInt(window.getComputedStyle(p || document.body).fontSize || '16')
        };
      });

      console.log(`Desktop font sizes: h1=${fontSizes2.h1}px, h2=${fontSizes2.h2}px, p=${fontSizes2.p}px`);
      console.log(`Font adaptation: h1 ${fontSizes2.h1 > fontSizes1.h1 ? '✓' : '✗'} h2 ${fontSizes2.h2 > fontSizes1.h2 ? '✓' : '✗'}`);
    });
  });

  test('TC-HOME-044: Images responsive', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Check image responsive attributes', async () => {
      const images = page.locator('img').all();
      const imgElements = await images;

      let withSrcset = 0;
      let withSizes = 0;

      for (let i = 0; i < Math.min(10, imgElements.length); i++) {
        const img = imgElements[i];
        const srcset = await img.getAttribute('srcset');
        const sizes = await img.getAttribute('sizes');

        if (srcset) withSrcset++;
        if (sizes) withSizes++;
      }

      console.log(`Responsive images - srcset: ${withSrcset}, sizes: ${withSizes}`);
      console.log(withSrcset > 0 ? '✓ Some images are responsive' : '✗ No responsive image attributes found');
    });
  });
});
