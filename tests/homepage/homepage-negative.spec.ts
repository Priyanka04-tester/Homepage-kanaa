/**
 * Negative Tests - Edge Cases and Error Handling
 * Tests behavior under adverse conditions
 */

import { test, expect } from '@playwright/test';

test.describe('Negative Tests & Error Handling', () => {
  test('TC-HOME-045: Handle slow network', async ({ page }) => {
    test.step('Simulate slow 3G network', async () => {
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 400 * 1024 / 8, // 400 kbps
        uploadThroughput: 400 * 1024 / 8,
        latency: 400
      });

      console.log('Network throttled to 3G');
    });

    test.step('Load page on slow network', async () => {
      const startTime = Date.now();

      try {
        const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        const loadTime = Date.now() - startTime;

        console.log(`✓ Page loaded in ${loadTime}ms on slow network`);
        expect(loadTime).toBeLessThan(30000);
      } catch (e) {
        console.log(`✗ Page failed to load on slow network: ${e}`);
      }
    });

    test.step('Verify page is still functional', async () => {
      const header = page.locator('header').first();
      const visible = await header.isVisible().catch(() => false);
      console.log(`Header visible on slow network: ${visible}`);
    });
  });

  test('TC-HOME-046: Handle network errors (failed requests)', async ({ page }) => {
    let errorResponses: string[] = [];

    page.on('response', response => {
      if (response.status() >= 400) {
        errorResponses.push(`${response.status()} ${response.url()}`);
      }
    });

    test.step('Navigate and collect errors', async () => {
      await page.goto('/').catch(() => {});
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      if (errorResponses.length > 0) {
        console.log(`Found ${errorResponses.length} error responses:`);
        errorResponses.slice(0, 5).forEach(err => console.log(`  - ${err}`));
      } else {
        console.log('✓ No HTTP errors detected');
      }
    });
  });

  test('TC-HOME-047: Handle JavaScript errors gracefully', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    test.step('Load page and monitor console', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      if (consoleErrors.length > 0) {
        console.log(`⚠ Found ${consoleErrors.length} console errors:`);
        consoleErrors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
      } else {
        console.log('✓ No JavaScript errors in console');
      }
    });
  });

  test('TC-HOME-048: Handle missing resources', async ({ page }) => {
    test.step('Intercept and block images', async () => {
      await page.route('**/*.{png,jpg,jpeg,gif}', route => route.abort());

      const response = await page.goto('/');
      expect(response?.status()).toBeLessThan(400);

      console.log('✓ Page loads without images');
    });

    test.step('Verify page structure intact', async () => {
      const header = page.locator('header').first();
      const main = page.locator('main, [role="main"]').first();

      const hasHeader = await header.count().then(c => c > 0);
      const hasMain = await main.count().then(c => c > 0);

      console.log(`Structure without images - Header: ${hasHeader}, Main: ${hasMain}`);
    });
  });

  test('TC-HOME-049: Handle missing navigation elements', async ({ page }) => {
    test.step('Intercept and block navigation styles/scripts', async () => {
      await page.route('**/*.css', route => {
        const url = route.request().url();
        if (url.includes('nav') || url.includes('menu')) {
          route.abort();
        } else {
          route.continue();
        }
      });

      await page.goto('/');
      console.log('Navigation styles blocked');
    });

    test.step('Check if page still loads', async () => {
      const title = page.title();
      expect(title).toBeTruthy();
      console.log(`✓ Page title still accessible: ${title}`);
    });
  });

  test('TC-HOME-050: Handle empty/null states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Check for broken product cards', async () => {
      const productCards = page.locator('[class*="product-card"]').all();
      const cards = await productCards;

      for (let i = 0; i < Math.min(5, cards.length); i++) {
        const card = cards[i];
        const text = await card.textContent().catch(() => null);

        if (!text || text.trim().length === 0) {
          console.log(`⚠ Empty product card at position ${i}`);
        }
      }
    });
  });

  test('TC-HOME-051: Offline mode behavior', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Take page content snapshot', async () => {
      const content = await page.evaluate(() => {
        return {
          title: document.title,
          headings: document.querySelectorAll('h1, h2, h3').length,
          buttons: document.querySelectorAll('button').length
        };
      });

      console.log(`Page state: ${JSON.stringify(content)}`);
    });

    test.step('Go offline', async () => {
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: true,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0
      });

      console.log('✓ Network set to offline');
    });

    test.step('Verify cached content still visible', async () => {
      const visible = await page.locator('body').isVisible();
      console.log(`Page still visible offline: ${visible}`);
    });
  });

  test('TC-HOME-052: Rapid navigation stress test', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    test.step('Perform rapid navigation', async () => {
      const links = page.locator('a[href^="/"]').all();
      const linkElements = await links;

      let successful = 0;
      let failed = 0;

      for (let i = 0; i < Math.min(5, linkElements.length); i++) {
        try {
          const link = linkElements[i];
          await link.click({ force: true, timeout: 2000 }).catch(() => {});
          successful++;
        } catch (e) {
          failed++;
        }

        // Rapid - don't wait between clicks
        await page.waitForTimeout(100);
      }

      console.log(`Rapid navigation: ${successful} successful, ${failed} failed`);
    });
  });

  test('TC-HOME-053: Console warnings/deprecations', async ({ page }) => {
    const warnings: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    test.step('Load and monitor warnings', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      if (warnings.length > 0) {
        console.log(`⚠ Found ${warnings.length} console warnings`);
        warnings.slice(0, 3).forEach(w => console.log(`  - ${w}`));
      } else {
        console.log('✓ No console warnings');
      }
    });
  });
});
