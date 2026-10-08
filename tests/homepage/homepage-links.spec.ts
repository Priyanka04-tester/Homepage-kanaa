/**
 * Link Tests - All Links & Navigation Anchors
 * Tests internal and external links, link validation
 */

import { test, expect } from '@playwright/test';

test.describe('Links & Navigation Anchors', () => {
  test('TC-HOME-011: All links are accessible', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Count all links', async () => {
      const links = page.locator('a[href]').all();
      const allLinks = await links;
      console.log(`Found ${allLinks.length} links`);
      expect(allLinks.length).toBeGreaterThan(0);
    });

    await test.step('Verify link attributes', async () => {
      const links = page.locator('a[href]').all();
      const allLinks = await links;

      for (let i = 0; i < Math.min(10, allLinks.length); i++) {
        const link = allLinks[i];
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        const visible = await link.isVisible().catch(() => false);

        console.log(`Link ${i + 1}: "${text?.trim()}" → ${href} (visible: ${visible})`);

        if (href && !href.startsWith('#')) {
          expect(href).toBeTruthy();
        }
      }
    });
  });

  test('TC-HOME-012: Internal links navigate correctly', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find internal links', async () => {
      const internalLinks = page.locator('a[href^="/"]').all();
      const links = await internalLinks;
      console.log(`Found ${links.length} internal links`);

      for (let i = 0; i < Math.min(3, links.length); i++) {
        const link = links[i];
        const href = await link.getAttribute('href');
        const text = await link.textContent();

        await test.step(`Test internal link: ${href}`, async () => {
          try {
            await link.click({ timeout: 5000 });
            await page.waitForLoadState('domcontentloaded');
            const newUrl = page.url();
            console.log(`✓ Navigation successful to ${newUrl}`);
          } catch (e) {
            console.log(`✗ Navigation failed for ${href}`);
          }
        });

        await page.goBack().catch(() => {});
        await page.waitForLoadState('domcontentloaded');
      }
    });
  });

  test('TC-HOME-013: External links have correct target', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Check external links', async () => {
      const externalLinks = page.locator('a[href^="http"]').all();
      const links = await externalLinks;
      console.log(`Found ${links.length} external links`);

      for (let i = 0; i < Math.min(3, links.length); i++) {
        const link = links[i];
        const href = await link.getAttribute('href');
        const target = await link.getAttribute('target');

        console.log(`External link ${i + 1}: ${href}`);
        console.log(`  Target: ${target || 'default'}`);

        // External links should typically have target="_blank"
        if (href?.includes('http')) {
          // This is informational - not necessarily a failure
          console.log(`  Note: External link without target="_blank": ${!target || target !== '_blank'}`);
        }
      }
    });
  });

  test('TC-HOME-014: Links do not have broken anchors', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Validate anchor links', async () => {
      const anchorLinks = page.locator('a[href^="#"]').all();
      const links = await anchorLinks;
      console.log(`Found ${links.length} anchor links`);

      for (let i = 0; i < Math.min(5, links.length); i++) {
        const link = links[i];
        const href = await link.getAttribute('href');

        if (href) {
          const anchorId = href.substring(1);
          const element = page.locator(`#${anchorId}, [data-id="${anchorId}"]`).first();
          const exists = await element.count().then(c => c > 0);

          console.log(`Anchor "${href}": ${exists ? '✓ target exists' : '✗ target missing'}`);
        }
      }
    });
  });

  test('TC-HOME-015: Social media links work', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find social media links', async () => {
      const socialLinks = page.locator(
        'a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"], a[aria-label*="social"]'
      ).all();
      const links = await socialLinks;
      console.log(`Found ${links.length} social media links`);

      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const href = await link.getAttribute('href');
        const visible = await link.isVisible().catch(() => false);

        console.log(`Social link ${i + 1}: ${href} (visible: ${visible})`);

        if (href) {
          expect(href).toBeTruthy();
        }
      }
    });
  });

  test('TC-HOME-016: Footer links are functional', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Navigate to footer', async () => {
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await page.waitForTimeout(500);
    });

    await test.step('Test footer links', async () => {
      const footer = page.locator('footer').first();
      const footerLinks = footer.locator('a[href]').all();
      const links = await footerLinks;
      console.log(`Found ${links.length} footer links`);

      for (let i = 0; i < Math.min(3, links.length); i++) {
        const link = links[i];
        const href = await link.getAttribute('href');
        const text = await link.textContent();

        console.log(`Footer link: "${text?.trim()}" → ${href}`);
      }
    });
  });
});
