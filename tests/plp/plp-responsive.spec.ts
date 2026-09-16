import { test, expect, devices } from '@playwright/test';
import { PLPPage } from '../../plp/pages/PLPPage';
import { EvidenceCollector } from '../../plp/utilities/EvidenceCollector';
import { BugReporter } from '../../plp/utilities/BugReporter';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

test.describe('PLP Responsive Testing - Phase 7', () => {
  const baseUrl = process.env.BASE_URL || 'https://thekanaa.com/en-sa/';
  let categoryInventory: any[] = [];

  test.beforeAll(() => {
    try {
      const inventoryPath = 'state/plp-inventory.json';
      if (fs.existsSync(inventoryPath)) {
        const content = fs.readFileSync(inventoryPath, 'utf-8');
        const inventory = JSON.parse(content);
        categoryInventory = inventory.categories || [];
      }
    } catch (e) {
      console.log('Could not load category inventory');
    }
  });

  for (const viewport of viewports) {
    test(`should load first PLP on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
      context,
    }) => {
      const evidence = new EvidenceCollector(page, './evidence/plp');

      const parentCategories = categoryInventory.filter(c => c.type === 'parent');
      if (parentCategories.length === 0) {
        test.skip();
        return;
      }

      const category = parentCategories[0];
      console.log(`Testing ${category.name} on ${viewport.name}`);

      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate
      await page.goto(category.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Take screenshot
      await evidence.captureScreenshot(`RESPONSIVE-${viewport.name}`, `${category.id}`);

      // Verify no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (hasHorizontalScroll) {
        console.log(`⚠️  Horizontal scroll detected on ${viewport.name}`);
      } else {
        console.log(`✅ No horizontal scroll on ${viewport.name}`);
      }

      expect(!hasHorizontalScroll).toBeTruthy();
    });
  }

  test('should verify product grid adapts to viewport', async ({ page }) => {
    const bugReporter = new BugReporter('./state/plp-bugs.json');

    const parentCategories = categoryInventory.filter(c => c.type === 'parent');
    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const category = parentCategories[0];

    for (const viewport of viewports) {
      console.log(`\nTesting grid on ${viewport.name}`);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(category.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Get product cards
      const productCards = await page.locator('[class*="product-card"], [class*="product-item"]').all();

      if (productCards.length === 0) {
        console.log(`  No products found`);
        continue;
      }

      // Get first and last product positions
      const firstCard = productCards[0];
      const lastCard = productCards[productCards.length - 1];

      const firstBox = await firstCard.boundingBox();
      const lastBox = await lastCard.boundingBox();

      if (firstBox && lastBox) {
        const gridCols = Math.round(lastBox.x / (firstBox.width + 10));
        console.log(`  Products: ${productCards.length}, Grid columns: ${gridCols}`);

        // Verify columns make sense for viewport
        if (viewport.width < 500) {
          // Mobile should be 1 or 2 columns
          if (gridCols < 1 || gridCols > 3) {
            console.log(`  ⚠️  Unexpected column count for mobile`);
            bugReporter.reportPotentialIssue(
              `Mobile grid has ${gridCols} columns`,
              `Expected 1-2 columns on mobile, got ${gridCols}`,
              {
                url: category.url,
                categoryId: category.id,
                locale: 'en',
                viewport: `${viewport.width}x${viewport.height}`,
                browser: 'chromium',
              }
            );
          }
        } else if (viewport.width < 900) {
          // Tablet should be 2-3 columns
          if (gridCols < 2 || gridCols > 4) {
            console.log(`  ⚠️  Unexpected column count for tablet`);
          }
        }
      }
    }
  });

  test('should verify text wrapping on all viewports', async ({ page }) => {
    const bugReporter = new BugReporter('./state/plp-bugs.json');

    const parentCategories = categoryInventory.filter(c => c.type === 'parent');
    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const category = parentCategories[0];

    for (const viewport of viewports) {
      console.log(`\nChecking text wrapping on ${viewport.name}`);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(category.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Check product names
      const productNames = await page.locator('[class*="product-card"] h2, [class*="product-card"] h3').all();

      if (productNames.length > 0) {
        const firstName = productNames[0];
        const box = await firstName.boundingBox();

        if (box) {
          // Check if text is being clipped
          const scrollWidth = await firstName.evaluate((el: any) => el.scrollWidth);
          const clientWidth = await firstName.evaluate((el: any) => el.clientWidth);

          if (scrollWidth > clientWidth + 5) {
            console.log(`  ⚠️  Text clipping detected on product names`);
            bugReporter.reportVisualBug(
              `Text clipping on product names - ${viewport.name}`,
              `Product name text is clipping on ${viewport.name} viewport`,
              {
                url: category.url,
                categoryId: category.id,
                locale: 'en',
                viewport: `${viewport.width}x${viewport.height}`,
                browser: 'chromium',
                businessImpact: 'Users cannot see full product names',
              }
            );
          } else {
            console.log(`  ✅ Text wrapping OK`);
          }
        }
      }
    }
  });

  test('should verify images scale correctly', async ({ page }) => {
    const bugReporter = new BugReporter('./state/plp-bugs.json');

    const parentCategories = categoryInventory.filter(c => c.type === 'parent');
    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const category = parentCategories[0];

    for (const viewport of viewports) {
      console.log(`\nChecking image scaling on ${viewport.name}`);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(category.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Check product images
      const images = await page.locator('[class*="product-card"] img').all();

      if (images.length > 0) {
        console.log(`  Found ${images.length} product images`);

        // Check first image
        const firstImage = images[0];
        const box = await firstImage.boundingBox();

        if (box) {
          console.log(`  First image: ${Math.round(box.width)}x${Math.round(box.height)}px`);

          // Verify image has reasonable size
          if (box.width < 50 || box.height < 50) {
            console.log(`  ⚠️  Image appears too small`);
            bugReporter.reportVisualBug(
              `Small product images - ${viewport.name}`,
              `Product images appear too small on ${viewport.name}`,
              {
                url: category.url,
                categoryId: category.id,
                locale: 'en',
                viewport: `${viewport.width}x${viewport.height}`,
                browser: 'chromium',
                businessImpact: 'Poor visual presentation on this viewport',
              }
            );
          }

          // Check if image loaded
          const isLoaded = await firstImage.evaluate((el: any) => {
            return el.complete && el.naturalHeight > 0;
          });

          if (!isLoaded) {
            console.log(`  ⚠️  Image not fully loaded`);
          }
        }
      }
    }
  });

  test('should verify touch target sizes on mobile', async ({ page }) => {
    const bugReporter = new BugReporter('./state/plp-bugs.json');

    const parentCategories = categoryInventory.filter(c => c.type === 'parent');
    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const category = parentCategories[0];

    // Test on mobile only
    const mobileViewport = viewports.find(v => v.name === 'mobile')!;

    console.log(`\nChecking touch targets on mobile`);

    await page.setViewportSize({ width: mobileViewport.width, height: mobileViewport.height });
    await page.goto(category.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Check buttons
    const buttons = await page.locator('button, [role="button"]').all();

    console.log(`Found ${buttons.length} buttons`);

    let smallButtons = 0;
    for (let i = 0; i < Math.min(5, buttons.length); i++) {
      const button = buttons[i];
      const box = await button.boundingBox();

      if (box && (box.width < 44 || box.height < 44)) {
        smallButtons++;
      }
    }

    if (smallButtons > 0) {
      console.log(`⚠️  ${smallButtons} buttons are smaller than 44x44px recommended touch target`);
      bugReporter.reportPotentialIssue(
        'Small touch targets on mobile',
        `Found ${smallButtons} buttons smaller than 44x44px on mobile`,
        {
          url: category.url,
          categoryId: category.id,
          locale: 'en',
          viewport: `${mobileViewport.width}x${mobileViewport.height}`,
          browser: 'chromium',
        }
      );
    } else {
      console.log('✅ Touch target sizes OK');
    }
  });

  test('should generate responsive test report', async ({ page }) => {
    console.log('\n=== RESPONSIVE TEST REPORT ===');
    console.log(`Tested viewports: ${viewports.map(v => v.name).join(', ')}`);
    console.log(`Categories tested: ${Math.min(1, categoryInventory.length)}`);

    const bugsPath = 'state/plp-bugs.json';
    if (fs.existsSync(bugsPath)) {
      const content = fs.readFileSync(bugsPath, 'utf-8');
      const bugs = JSON.parse(content);
      const responsiveBugs = bugs.filter((b: any) => b.title.includes('responsive') || b.title.includes('Mobile'));
      console.log(`Responsive issues found: ${responsiveBugs.length}`);
    }

    console.log(`\nNext steps:`);
    console.log(`1. Run localization tests: npm run test:plp:localization`);
    console.log(`2. Run performance tests: npm run test:plp:performance`);
    console.log(`3. Run accessibility tests: npm run test:plp:accessibility`);
  });
});
