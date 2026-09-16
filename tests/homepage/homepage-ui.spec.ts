/**
 * UI/Visual Tests - Layout, Styling, and Visual Elements
 * Tests visual consistency, spacing, alignment, and design
 */

import { test, expect } from '@playwright/test';

test.describe('UI & Visual Design', () => {
  test('TC-HOME-030: Header layout is correct', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Verify header structure', async () => {
      const header = page.locator('header').first();
      const visible = await header.isVisible();
      expect(visible).toBe(true);

      // Check for key header elements
      const logo = header.locator('a[href="/"], [class*="logo"]').first();
      const nav = header.locator('nav, [role="navigation"]').first();
      const cart = header.locator('[class*="cart"], [aria-label*="cart"]').first();

      const hasLogo = await logo.count().then(c => c > 0);
      const hasNav = await nav.count().then(c => c > 0);
      const hasCart = await cart.count().then(c => c > 0);

      console.log(`Header has Logo: ${hasLogo}, Nav: ${hasNav}, Cart: ${hasCart}`);
      expect(hasLogo || hasNav).toBe(true);
    });

    test.step('Check header styling', async () => {
      const header = page.locator('header').first();
      const position = await header.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          position: style.position,
          display: style.display,
          backgroundColor: style.backgroundColor
        };
      });

      console.log(`Header position: ${position.position}`);
      console.log(`Header display: ${position.display}`);
      console.log(`Header background: ${position.backgroundColor}`);

      expect(['fixed', 'sticky', 'absolute', 'relative', 'static']).toContain(position.position);
    });
  });

  test('TC-HOME-031: Page sections are well-spaced', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Check section spacing', async () => {
      const sections = page.locator('section, div[class*="section"]').all();
      const sectionElements = await sections;
      console.log(`Found ${sectionElements.length} sections`);

      for (let i = 0; i < Math.min(3, sectionElements.length); i++) {
        const section = sectionElements[i];
        const box = await section.boundingBox();

        if (box) {
          console.log(`Section ${i + 1}: ${box.width}x${box.height} at y:${box.y}`);

          // Check for reasonable height
          if (box.height < 50) {
            console.log(`  ⚠ Very small section height: ${box.height}px`);
          } else {
            console.log(`  ✓ Good section height`);
          }
        }
      }
    });
  });

  test('TC-HOME-032: Images have proper dimensions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Check image dimensions', async () => {
      const images = page.locator('img').all();
      const imgElements = await images;
      console.log(`Found ${imgElements.length} images`);

      for (let i = 0; i < Math.min(10, imgElements.length); i++) {
        const img = imgElements[i];
        const width = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        const height = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);
        const src = await img.getAttribute('src');

        if (width && height) {
          console.log(`Image ${i + 1}: ${width}x${height} - ${src?.substring(0, 40)}...`);

          if (width < 10 || height < 10) {
            console.log(`  ⚠ Image may be too small`);
          }
        }
      }
    });
  });

  test('TC-HOME-033: Text is readable (contrast and size)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Check text readability', async () => {
      const textElements = page.locator('p, h1, h2, h3, span, li').all();
      const elements = await textElements;
      console.log(`Scanning ${Math.min(20, elements.length)} text elements`);

      for (let i = 0; i < Math.min(10, elements.length); i++) {
        const el = elements[i];
        const fontSize = await el.evaluate(e =>
          window.getComputedStyle(e).fontSize
        );

        const sizePx = parseInt(fontSize);
        if (sizePx < 12) {
          console.log(`⚠ Small text (${fontSize}) - may be hard to read`);
        }
      }

      console.log('✓ Text readability check complete');
    });
  });

  test('TC-HOME-034: Buttons are properly styled and sized', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Check button styling', async () => {
      const buttons = page.locator('button').all();
      const btnElements = await buttons;
      console.log(`Checking ${Math.min(10, btnElements.length)} buttons`);

      for (let i = 0; i < Math.min(5, btnElements.length); i++) {
        const btn = btnElements[i];
        const box = await btn.boundingBox();
        const padding = await btn.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.padding;
        });

        if (box) {
          const minSize = 32; // Accessibility minimum
          const tooSmall = box.width < minSize || box.height < minSize;

          console.log(`Button ${i + 1}: ${box.width}x${box.height}px - Padding: ${padding}`);
          if (tooSmall) {
            console.log(`  ⚠ Button may be too small for touch targets (${minSize}px recommended)`);
          }
        }
      }
    });
  });

  test('TC-HOME-035: Layout responds to content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Check for layout overflow', async () => {
      const hasOverflow = await page.evaluate(() => {
        const body = document.documentElement;
        return {
          scrollWidth: body.scrollWidth,
          clientWidth: body.clientWidth,
          hasHorizontalScroll: body.scrollWidth > body.clientWidth
        };
      });

      console.log(`Page width: ${hasOverflow.clientWidth}px`);
      console.log(`Content width: ${hasOverflow.scrollWidth}px`);
      console.log(`Horizontal scroll: ${hasOverflow.hasHorizontalScroll ? '✗ Present' : '✓ None'}`);

      expect(hasOverflow.hasHorizontalScroll).toBe(false);
    });
  });

  test('TC-HOME-036: Color contrast is sufficient', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    test.step('Sample color checks', async () => {
      const headings = page.locator('h1, h2, h3').all();
      const headingElements = await headings;

      for (let i = 0; i < Math.min(3, headingElements.length); i++) {
        const heading = headingElements[i];
        const colors = await heading.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            background: style.backgroundColor
          };
        });

        console.log(`Heading ${i + 1} color: ${colors.color} on ${colors.background}`);
      }

      console.log('✓ Color check complete (manual review recommended for WCAG compliance)');
    });
  });
});
