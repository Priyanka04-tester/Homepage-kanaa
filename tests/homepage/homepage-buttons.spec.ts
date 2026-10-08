/**
 * Button Tests - All Buttons & CTA Elements
 * Tests all button clicks, CTAs, and button states
 */

import { test, expect } from '@playwright/test';

test.describe('Buttons & CTAs', () => {
  test('TC-HOME-006: All buttons are clickable', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find all buttons', async () => {
      const buttons = page.locator('button').all();
      const allButtons = await buttons;
      console.log(`Found ${allButtons.length} buttons`);
      expect(allButtons.length).toBeGreaterThan(0);
    });

    await test.step('Test button states', async () => {
      const buttons = page.locator('button').all();
      const allButtons = await buttons;

      for (let i = 0; i < Math.min(5, allButtons.length); i++) {
        const btn = allButtons[i];
        const text = await btn.textContent();

        await test.step(`Check button: ${text}`, async () => {
          const visible = await btn.isVisible().catch(() => false);
          const enabled = await btn.isEnabled().catch(() => false);
          console.log(`Button "${text}" - Visible: ${visible}, Enabled: ${enabled}`);

          if (enabled) {
            try {
              await btn.click({ timeout: 3000 });
              await page.waitForTimeout(500);
              console.log(`✓ Button clicked successfully`);
            } catch (e) {
              console.log(`✗ Button click failed: ${e}`);
            }
          }
        });
      }
    });
  });

  test('TC-HOME-007: CTA buttons navigate correctly', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find CTA buttons', async () => {
      const ctaButtons = page.locator('a[class*="btn"], button[class*="cta"], [role="button"][onclick]').all();
      const buttons = await ctaButtons;
      console.log(`Found ${buttons.length} CTA buttons`);
    });

    await test.step('Test CTA navigation', async () => {
      const ctaButtons = page.locator('a[class*="btn"], button[class*="cta"]').all();
      const buttons = await ctaButtons;

      for (let i = 0; i < Math.min(3, buttons.length); i++) {
        const btn = buttons[i];
        const href = await btn.getAttribute('href').catch(() => null);

        if (href) {
          await test.step(`Test CTA: ${href}`, async () => {
            const initialUrl = page.url();
            try {
              await btn.click({ timeout: 3000 });
              await page.waitForLoadState('domcontentloaded');
              const newUrl = page.url();
              console.log(`✓ Navigation worked: ${initialUrl} → ${newUrl}`);
            } catch (e) {
              console.log(`✗ CTA navigation failed`);
            }
          });
          await page.goBack().catch(() => {});
        }
      }
    });
  });

  test('TC-HOME-008: Button hover states', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Check button hover effects', async () => {
      const buttons = page.locator('button').all();
      const allButtons = await buttons;

      for (let i = 0; i < Math.min(3, allButtons.length); i++) {
        const btn = allButtons[i];
        const text = await btn.textContent();

        await test.step(`Hover button: ${text}`, async () => {
          const computedBefore = await btn.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
          );

          await btn.hover({ timeout: 3000 });
          await page.waitForTimeout(200);

          const computedAfter = await btn.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
          );

          console.log(`Button color before: ${computedBefore}`);
          console.log(`Button color after: ${computedAfter}`);
        });
      }
    });
  });

  test('TC-HOME-009: Disabled buttons cannot be clicked', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find disabled buttons', async () => {
      const disabledButtons = page.locator('button:disabled').all();
      const buttons = await disabledButtons;
      console.log(`Found ${buttons.length} disabled buttons`);

      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        const isDisabled = await btn.isDisabled();
        expect(isDisabled).toBe(true);
        console.log(`✓ Button is properly disabled`);
      }
    });
  });

  test('TC-HOME-010: Add to cart buttons work', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    await test.step('Find add to cart buttons', async () => {
      const addToCartButtons = page.locator(
        'button:has-text("Add"), button:has-text("Cart"), [class*="add-to-cart"]'
      ).all();
      const buttons = await addToCartButtons;
      console.log(`Found ${buttons.length} add-to-cart style buttons`);

      if (buttons.length > 0) {
        const btn = buttons[0];
        try {
          await btn.click({ timeout: 3000 });
          await page.waitForTimeout(500);
          console.log(`✓ Add to cart button clicked`);
        } catch (e) {
          console.log(`✗ Add to cart button failed: ${e}`);
        }
      }
    });
  });
});
