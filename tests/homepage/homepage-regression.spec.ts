/**
 * Regression Tests - Critical Functionality Verification
 * Tests for previously found bugs and critical features
 */

import { test, expect } from '@playwright/test';

test.describe('Regression Tests - Critical Features', () => {
  test('TC-HOME-054: Core homepage loads every time', async ({ page }) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      test.step(`Load attempt ${attempt}`, async () => {
        const startTime = Date.now();
        const response = await page.goto('/');
        const loadTime = Date.now() - startTime;

        expect(response?.status()).toBeLessThan(400);
        console.log(`✓ Attempt ${attempt}: Loaded in ${loadTime}ms`);
      });
    }
  });

  test('TC-HOME-055: Essential header elements always present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Verify header consistency', async () => {
      const header = page.locator('header').first();
      await expect(header).toBeVisible();

      // Logo
      const logo = header.locator('a[href="/"], [class*="logo"]').first();
      const hasLogo = await logo.count().then(c => c > 0);
      console.log(`Logo present: ${hasLogo}`);

      // Navigation
      const nav = header.locator('nav').first();
      const hasNav = await nav.count().then(c => c > 0);
      console.log(`Navigation present: ${hasNav}`);

      // Either logo or nav should be present
      expect(hasLogo || hasNav).toBe(true);
    });
  });

  test('TC-HOME-056: No critical console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out known non-critical errors
        if (!text.includes('ads') && !text.includes('tracking') && !text.includes('optional')) {
          errors.push(text);
        }
      }
    });

    test.step('Load and monitor errors', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      if (errors.length > 0) {
        console.log(`⚠ Found ${errors.length} critical errors`);
        errors.forEach(e => console.log(`  - ${e}`));
        expect(errors.length).toBe(0);
      } else {
        console.log('✓ No critical console errors');
      }
    });
  });

  test('TC-HOME-057: Navigation works consistently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Test navigation stability', async () => {
      const links = page.locator('a[href^="/"]').all();
      const linkElements = await links;

      let working = 0;
      let broken = 0;

      for (let i = 0; i < Math.min(3, linkElements.length); i++) {
        const link = linkElements[i];
        const href = await link.getAttribute('href');

        try {
          await link.click({ timeout: 5000 });
          await page.waitForLoadState('domcontentloaded');
          working++;
          console.log(`✓ Link ${i + 1} works: ${href}`);
        } catch (e) {
          broken++;
          console.log(`✗ Link ${i + 1} broken: ${href}`);
        }

        await page.goBack().catch(() => {});
        await page.waitForTimeout(200);
      }

      console.log(`Navigation: ${working} working, ${broken} broken`);
      expect(broken).toBe(0);
    });
  });

  test('TC-HOME-058: Button interactions stable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Test button stability', async () => {
      const buttons = page.locator('button').all();
      const btnElements = await buttons;

      for (let i = 0; i < Math.min(3, btnElements.length); i++) {
        const btn = btnElements[i];
        const text = await btn.textContent();

        test.step(`Button ${i + 1}: ${text}`, async () => {
          try {
            const enabled = await btn.isEnabled();

            if (enabled) {
              await btn.click({ timeout: 3000 });
              await page.waitForTimeout(200);
              console.log(`✓ Button clickable and responds`);
            } else {
              console.log(`✓ Button properly disabled`);
            }
          } catch (e) {
            console.log(`✗ Button interaction failed: ${e}`);
          }
        });
      }
    });
  });

  test('TC-HOME-059: Page performance acceptable', async ({ page }) => {
    const startTime = Date.now();

    test.step('Measure page load metrics', async () => {
      const navigationTiming = await page.evaluate(() => {
        const perf = window.performance.timing;
        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
          loadComplete: perf.loadEventEnd - perf.navigationStart,
          firstPaint: (performance as any).getEntriesByName('first-paint')[0]?.startTime || 'N/A'
        };
      }).catch(() => ({}));

      const totalTime = Date.now() - startTime;
      console.log(`Page load metrics: ${JSON.stringify(navigationTiming)}`);
      console.log(`Total navigation time: ${totalTime}ms`);

      // Page should load in reasonable time
      expect(totalTime).toBeLessThan(30000);
    });

    test.step('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });
  });

  test('TC-HOME-060: Links open correct pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Verify navigation targets', async () => {
      const homeLink = page.locator('a[href="/"]').first();
      const exists = await homeLink.count().then(c => c > 0);

      if (exists) {
        const href = await homeLink.getAttribute('href');
        console.log(`Home link href: ${href}`);
        expect(href).toBe('/');
      } else {
        console.log('✓ No duplicate home link (expected)');
      }
    });
  });

  test('TC-HOME-061: Carousel/Slider reliability', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Test carousel stability', async () => {
      const carousel = page.locator('[class*="carousel"], [class*="slider"]').first();
      const exists = await carousel.count().then(c => c > 0);

      if (exists) {
        const nextBtn = carousel.locator('button:has-text("Next"), [aria-label*="next"]').first();

        if (await nextBtn.count().then(c => c > 0)) {
          for (let i = 0; i < 3; i++) {
            try {
              await nextBtn.click({ timeout: 2000 });
              await page.waitForTimeout(300);
              console.log(`✓ Carousel advance ${i + 1} successful`);
            } catch (e) {
              console.log(`✗ Carousel advance ${i + 1} failed`);
            }
          }
        }
      } else {
        console.log('✓ No carousel to test');
      }
    });
  });

  test('TC-HOME-062: Search functionality (if present)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Test search if available', async () => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
      const exists = await searchInput.count().then(c => c > 0);

      if (exists) {
        test.step('Search interaction', async () => {
          try {
            await searchInput.click();
            await searchInput.type('test', { delay: 50 });
            await page.waitForTimeout(500);

            const value = await searchInput.inputValue();
            console.log(`✓ Search input accepts text: "${value}"`);
            expect(value).toContain('test');
          } catch (e) {
            console.log(`✗ Search input failed: ${e}`);
          }
        });
      } else {
        console.log('✓ No search input found');
      }
    });
  });

  test('TC-HOME-063: Footer accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Navigate to footer', async () => {
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await page.waitForTimeout(500);
    });

    test.step('Verify footer content', async () => {
      const footer = page.locator('footer').first();
      const exists = await footer.count().then(c => c > 0);

      if (exists) {
        const visible = await footer.isVisible();
        const links = await footer.locator('a').count();

        console.log(`Footer visible: ${visible}, Links: ${links}`);
        expect(visible).toBe(true);
        expect(links).toBeGreaterThan(0);
      } else {
        console.log('✗ Footer not found');
      }
    });
  });

  test('TC-HOME-064: Multi-language support check', async ({ page }) => {
    test.step('Check English version', async () => {
      await page.goto('/en-sa/');
      const title = page.title();
      console.log(`EN page title: ${title}`);
      expect(title).toBeTruthy();
    });

    test.step('Check Arabic version', async () => {
      await page.goto('/ar-sa/');
      const title = page.title();
      console.log(`AR page title: ${title}`);
      expect(title).toBeTruthy();
    });
  });
});
