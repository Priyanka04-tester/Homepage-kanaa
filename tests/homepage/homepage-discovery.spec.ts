/**
 * Phase 2: Homepage Discovery Test
 * Autonomous exploration of the Thekanaa homepage
 *
 * This test:
 * 1. Opens the homepage
 * 2. Waits for full page load
 * 3. Discovers all sections
 * 4. Identifies all interactive elements
 * 5. Maps the complete DOM structure
 * 6. Detects console errors
 * 7. Detects network failures
 * 8. Creates homepage-map.json
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface Element {
  id: string;
  type: string;
  selector: string;
  text?: string;
  href?: string;
  visible: boolean;
  accessible: boolean;
  ariaLabel?: string;
}

interface Section {
  id: string;
  name: string;
  type: string;
  xpath: string;
  visible: boolean;
  elements: Element[];
  childSections?: Section[];
}

interface HomepageMap {
  url: string;
  title: string;
  timestamp: string;
  viewport: { width: number; height: number };
  consoleErrors: string[];
  networkFailures: string[];
  sections: Section[];
  elementCount: number;
  buttonCount: number;
  linkCount: number;
  sliderCount: number;
  productWidgetCount: number;
  ctaCount: number;
}

test.describe('Homepage Discovery - Phase 2', () => {
  let homepageMap: HomepageMap = {
    url: '',
    title: '',
    timestamp: new Date().toISOString(),
    viewport: { width: 0, height: 0 },
    consoleErrors: [],
    networkFailures: [],
    sections: [],
    elementCount: 0,
    buttonCount: 0,
    linkCount: 0,
    sliderCount: 0,
    productWidgetCount: 0,
    ctaCount: 0,
  };

  let consoleErrors: string[] = [];
  let networkFailures: string[] = [];

  test('Discover complete homepage structure', async ({ page }) => {
    // Listen to console messages
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const errorMsg = msg.text();
        if (!errorMsg.includes('favicon')) {
          consoleErrors.push(errorMsg);
        }
      }
    });

    // Listen to network failures
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkFailures.push(
          `${response.status()} ${response.url()}`
        );
      }
    });

    // Navigate to homepage
    await test.step('Navigate to homepage', async () => {
      const response = await page.goto('./');
      expect(response?.status()).toBeLessThan(400);
    });

    // Record homepage info
    await test.step('Record homepage metadata', async () => {
      homepageMap.url = page.url();
      homepageMap.title = await page.title();
      const viewport = page.viewportSize();
      if (viewport) {
        homepageMap.viewport = viewport;
      }
    });

    // Wait for page load
    await test.step('Wait for page load', async () => {
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => {
        // Wait for common lazy-load patterns
        return new Promise((resolve) => setTimeout(resolve, 2000));
      });
    });

    // Take initial screenshot
    await test.step('Capture initial screenshot', async () => {
      await page.screenshot({
        path: 'evidence/homepage/initial-screenshot.png',
        fullPage: true,
      });
    });

    // Discover main sections
    await test.step('Discover main sections', async () => {
      const sections = await discoverSections(page);
      homepageMap.sections = sections;
    });

    // Discover all interactive elements
    await test.step('Discover interactive elements', async () => {
      const elements = await discoverElements(page);
      homepageMap.elementCount = elements.length;
      homepageMap.buttonCount = elements.filter(
        (e) => e.type === 'button'
      ).length;
      homepageMap.linkCount = elements.filter(
        (e) => e.type === 'link'
      ).length;
      homepageMap.sliderCount = elements.filter(
        (e) => e.type === 'slider'
      ).length;
      homepageMap.productWidgetCount = elements.filter(
        (e) => e.type === 'product-widget'
      ).length;
      homepageMap.ctaCount = elements.filter(
        (e) => e.type === 'cta'
      ).length;
    });

    // Scroll full page to trigger lazy loading
    await test.step('Trigger lazy loading', async () => {
      const scrollHeight = await page.evaluate(
        () => document.documentElement.scrollHeight
      );
      const viewportHeight = page.viewportSize()?.height || 900;
      const scrollSteps = Math.ceil(scrollHeight / viewportHeight);

      for (let i = 0; i < scrollSteps; i++) {
        await page.evaluate((vh) => {
          window.scrollBy(0, vh);
        }, viewportHeight);
        await page.evaluate(() =>
          new Promise((resolve) => setTimeout(resolve, 300))
        );
      }

      // Scroll back to top
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
    });

    // Detect hidden/expandable elements
    await test.step('Detect hidden elements', async () => {
      const hiddenElements = await page.evaluate(() => {
        const elements = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
          const style = window.getComputedStyle(el);
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0'
          ) {
            elements.push({
              tag: el.tagName,
              class: el.className,
              text: el.textContent?.substring(0, 50),
            });
          }
        }
        return elements;
      });

      if (hiddenElements.length > 0) {
        console.log(
          `Found ${hiddenElements.length} hidden elements`
        );
      }
    });

    // Record console errors and network failures
    await test.step('Record errors', async () => {
      homepageMap.consoleErrors = consoleErrors;
      homepageMap.networkFailures = networkFailures;
    });

    // Save homepage map
    await test.step('Save homepage map', async () => {
      const mapPath = path.join(
        process.cwd(),
        'state/homepage-map.json'
      );
      fs.mkdirSync(path.dirname(mapPath), { recursive: true });
      fs.writeFileSync(mapPath, JSON.stringify(homepageMap, null, 2));
      console.log(`Saved homepage map to ${mapPath}`);
    });

    // Log discovery summary
    await test.step('Log discovery summary', async () => {
      console.log('\n╔═══════════════════════════════════════════════════╗');
      console.log('║      HOMEPAGE DISCOVERY COMPLETE                   ║');
      console.log('╚═══════════════════════════════════════════════════╝');
      console.log(
        `URL: ${homepageMap.url}`
      );
      console.log(`Title: ${homepageMap.title}`);
      console.log(
        `Viewport: ${homepageMap.viewport.width}x${homepageMap.viewport.height}`
      );
      console.log(
        `Sections discovered: ${homepageMap.sections.length}`
      );
      console.log(
        `Total elements: ${homepageMap.elementCount}`
      );
      console.log(
        `  - Buttons: ${homepageMap.buttonCount}`
      );
      console.log(`  - Links: ${homepageMap.linkCount}`);
      console.log(
        `  - Sliders: ${homepageMap.sliderCount}`
      );
      console.log(
        `  - Product widgets: ${homepageMap.productWidgetCount}`
      );
      console.log(`  - CTAs: ${homepageMap.ctaCount}`);
      console.log(
        `Console errors: ${homepageMap.consoleErrors.length}`
      );
      console.log(
        `Network failures: ${homepageMap.networkFailures.length}`
      );
      console.log('');
    });

    // Verify discoveries
    expect(homepageMap.url).toContain('thekanaa.com');
    expect(homepageMap.sections.length).toBeGreaterThan(0);
    expect(homepageMap.elementCount).toBeGreaterThan(0);
  });
});

async function discoverSections(page: Page): Promise<Section[]> {
  const sections: Section[] = [];

  // Define common section identifiers
  const sectionSelectors = [
    { selector: 'header', name: 'Header', type: 'header' },
    { selector: '[role="banner"]', name: 'Banner', type: 'banner' },
    {
      selector: '[class*="hero"], [class*="banner"]',
      name: 'Hero Section',
      type: 'hero',
    },
    {
      selector: '[class*="category"], [class*="categories"]',
      name: 'Categories',
      type: 'category',
    },
    {
      selector: '[class*="product"], [class*="products"]',
      name: 'Products',
      type: 'product',
    },
    { selector: 'nav', name: 'Navigation', type: 'nav' },
    {
      selector: '[class*="promo"], [class*="promotion"]',
      name: 'Promotions',
      type: 'promo',
    },
    {
      selector: '[class*="newsletter"], [class*="subscribe"]',
      name: 'Newsletter',
      type: 'newsletter',
    },
    { selector: 'footer', name: 'Footer', type: 'footer' },
  ];

  for (const { selector, name, type } of sectionSelectors) {
    const elements = await page.locator(selector).all();
    for (let i = 0; i < elements.length; i++) {
      const visible = await elements[i].isVisible();
      if (visible) {
        sections.push({
          id: `HOME-SEC-${String(sections.length + 1).padStart(3, '0')}`,
          name:
            elements.length > 1
              ? `${name} ${i + 1}`
              : name,
          type,
          xpath: selector,
          visible,
          elements: [],
        });
      }
    }
  }

  return sections;
}

async function discoverElements(page: Page): Promise<Element[]> {
  const elements: Element[] = [];

  // Discover buttons
  const buttons = await page.locator('button').all();
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    elements.push({
      id: `BTN-${String(i + 1).padStart(3, '0')}`,
      type: 'button',
      selector: `button:nth-of-type(${i + 1})`,
      text: await btn.textContent().catch(() => ''),
      visible: await btn.isVisible().catch(() => false),
      accessible: await btn.isEnabled().catch(() => false),
      ariaLabel: await btn.getAttribute('aria-label').catch(() => ''),
    });
  }

  // Discover links
  const links = await page.locator('a[href]').all();
  for (let i = 0; i < Math.min(links.length, 50); i++) {
    const link = links[i];
    elements.push({
      id: `LINK-${String(i + 1).padStart(3, '0')}`,
      type: 'link',
      selector: `a[href]:nth-of-type(${i + 1})`,
      text: await link.textContent().catch(() => ''),
      href: await link.getAttribute('href').catch(() => ''),
      visible: await link.isVisible().catch(() => false),
      accessible: await link.isEnabled().catch(() => false),
    });
  }

  // Discover sliders (common patterns)
  const sliders = await page
    .locator('[class*="slider"], [class*="carousel"], [role="region"]')
    .all();
  for (let i = 0; i < sliders.length; i++) {
    elements.push({
      id: `SLIDER-${String(i + 1).padStart(3, '0')}`,
      type: 'slider',
      selector: `[class*="slider"]:nth-of-type(${i + 1})`,
      visible: await sliders[i].isVisible().catch(() => false),
      accessible: true,
    });
  }

  // Discover product widgets
  const products = await page
    .locator('[class*="product"], [data-product]')
    .all();
  for (let i = 0; i < Math.min(products.length, 20); i++) {
    elements.push({
      id: `PROD-${String(i + 1).padStart(3, '0')}`,
      type: 'product-widget',
      selector: `[class*="product"]:nth-of-type(${i + 1})`,
      visible: await products[i].isVisible().catch(() => false),
      accessible: true,
    });
  }

  // Discover CTAs (buttons with specific text patterns)
  const ctas = await page.locator('button, [role="button"]').all();
  for (const cta of ctas) {
    const text =
      (await cta.getAttribute('aria-label').catch(() => null)) ||
      (await cta.textContent().catch(() => '')) ||
      '';
    const isCta = text &&
      /add|buy|shop|checkout|order|confirm|submit|subscribe|view|more/i.test(
        text
      );
    if (isCta) {
      elements.push({
        id: `CTA-${String(elements.filter((e) => e.type === 'cta').length + 1).padStart(3, '0')}`,
        type: 'cta',
        selector: '[role="button"]',
        text: text || '',
        visible: await cta.isVisible().catch(() => false),
        accessible: await cta.isEnabled().catch(() => false),
      });
    }
  }

  return elements;
}
