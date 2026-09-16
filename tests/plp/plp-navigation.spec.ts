import { test, expect } from '@playwright/test';
import { PLPPage } from '../../plp/pages/PLPPage';
import { EvidenceCollector } from '../../plp/utilities/EvidenceCollector';
import { BugReporter } from '../../plp/utilities/BugReporter';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

test.describe('PLP Navigation Testing - Phase 4', () => {
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

  test('should navigate to each discovered parent category', async ({ page }) => {
    const evidence = new EvidenceCollector(page, './evidence/plp');
    const bugReporter = new BugReporter('./state/plp-bugs.json');

    const parentCategories = categoryInventory.filter(c => c.type === 'parent').slice(0, 10);

    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    console.log(`\nTesting navigation to ${parentCategories.length} parent categories`);

    for (const category of parentCategories) {
      console.log(`\n→ ${category.name}`);

      try {
        // Navigate
        await page.goto(category.url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        // Verify page loaded
        const title = await page.title();
        console.log(`  Title: ${title}`);

        // Take screenshot
        await evidence.captureScreenshot(`NAV-${category.id}`, 'category-page');

        // Get product count
        const plpPage = new PLPPage(page);
        const productCount = await plpPage.getProductCount();
        console.log(`  Products: ${productCount}`);

        // Verify we're on correct category
        const currentUrl = page.url();
        if (currentUrl.includes(category.url.split('/').pop())) {
          console.log(`  ✅ Navigation successful`);
        } else {
          console.log(`  ⚠️  URL might be incorrect`);
          bugReporter.reportPotentialIssue(
            `Navigation URL mismatch for ${category.name}`,
            `Expected to navigate to ${category.url} but got ${currentUrl}`,
            {
              url: category.url,
              categoryId: category.id,
              locale: 'en',
              viewport: '1440x900',
              browser: 'chromium',
            }
          );
        }
      } catch (e) {
        console.log(`  ❌ Error: ${e.message}`);
        bugReporter.reportFunctionalBug(
          `Failed to navigate to ${category.name}`,
          {
            url: category.url,
            categoryId: category.id,
            locale: 'en',
            viewport: '1440x900',
            browser: 'chromium',
            stepsToReproduce: [`Navigate to ${category.url}`],
            expectedResult: 'PLP should load successfully',
            actualResult: `Navigation failed: ${e.message}`,
            severity: 'Critical',
            businessImpact: 'Users cannot access this category',
          }
        );
      }
    }
  });

  test('should test category page load performance', async ({ page }) => {
    const parentCategories = categoryInventory.filter(c => c.type === 'parent').slice(0, 5);

    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    console.log(`\nTesting load performance on ${parentCategories.length} categories`);

    for (const category of parentCategories) {
      console.log(`\n→ ${category.name}`);

      // Measure load time
      const startTime = Date.now();

      await page.goto(category.url, { waitUntil: 'domcontentloaded' });

      const loadTime = Date.now() - startTime;
      console.log(`  Load time: ${loadTime}ms`);

      if (loadTime > 5000) {
        console.log(`  ⚠️  Slow page load (> 5s)`);
      } else if (loadTime > 3000) {
        console.log(`  ⚠️  Moderate load time (> 3s)`);
      } else {
        console.log(`  ✅ Fast load (< 3s)`);
      }
    }
  });

  test('should verify breadcrumb navigation', async ({ page }) => {
    const bugReporter = new BugReporter('./state/plp-bugs.json');

    const parentCategories = categoryInventory.filter(c => c.type === 'parent').slice(0, 3);

    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    console.log(`\nTesting breadcrumb navigation`);

    for (const category of parentCategories) {
      console.log(`\n→ ${category.name}`);

      await page.goto(category.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Look for breadcrumb
      const breadcrumb = await page.locator('[class*="breadcrumb"], nav[aria-label*="Breadcrumb"], .bread-crumb').first();

      if (await breadcrumb.isVisible()) {
        console.log(`  ✅ Breadcrumb found`);

        const breadcrumbText = await breadcrumb.textContent();
        console.log(`  Breadcrumb: ${breadcrumbText?.substring(0, 60)}`);

        // Get breadcrumb links
        const links = await breadcrumb.locator('a').all();
        console.log(`  Links in breadcrumb: ${links.length}`);

        // Test first link (should go to home or parent)
        if (links.length > 0) {
          try {
            const firstLink = links[0];
            const href = await firstLink.getAttribute('href');
            console.log(`  First breadcrumb link: ${href}`);
          } catch (e) {
            console.log(`  Could not extract first link`);
          }
        }
      } else {
        console.log(`  ⚠️  Breadcrumb not found`);
        bugReporter.reportPotentialIssue(
          `Missing breadcrumb navigation on ${category.name}`,
          `Breadcrumb navigation is not visible on this PLP`,
          {
            url: category.url,
            categoryId: category.id,
            locale: 'en',
            viewport: '1440x900',
            browser: 'chromium',
          }
        );
      }
    }
  });

  test('should test back/forward button navigation', async ({ page }) => {
    const bugReporter = new BugReporter('./state/plp-bugs.json');

    const parentCategories = categoryInventory.filter(c => c.type === 'parent').slice(0, 2);

    if (parentCategories.length < 2) {
      test.skip();
      return;
    }

    console.log(`\nTesting back/forward navigation`);

    // Navigate to first category
    const cat1 = parentCategories[0];
    const cat2 = parentCategories[1];

    console.log(`\n1. Navigate to: ${cat1.name}`);
    await page.goto(cat1.url, { waitUntil: 'domcontentloaded' });
    const url1 = page.url();

    console.log(`2. Navigate to: ${cat2.name}`);
    await page.goto(cat2.url, { waitUntil: 'domcontentloaded' });
    const url2 = page.url();

    console.log(`3. Click back button`);
    await page.goBack();
    const urlAfterBack = page.url();

    if (urlAfterBack === url1) {
      console.log(`  ✅ Back button works correctly`);
    } else {
      console.log(`  ⚠️  Back button didn't return to previous page`);
      bugReporter.reportPotentialIssue(
        `Back button navigation issue`,
        `Expected ${url1} but got ${urlAfterBack}`,
        {
          url: cat2.url,
          categoryId: cat2.id,
          locale: 'en',
          viewport: '1440x900',
          browser: 'chromium',
        }
      );
    }

    console.log(`4. Click forward button`);
    await page.goForward();
    const urlAfterForward = page.url();

    if (urlAfterForward === url2) {
      console.log(`  ✅ Forward button works correctly`);
    } else {
      console.log(`  ⚠️  Forward button didn't return to next page`);
    }
  });

  test('should test category header/title', async ({ page }) => {
    const parentCategories = categoryInventory.filter(c => c.type === 'parent').slice(0, 5);

    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    console.log(`\nTesting category headers`);

    for (const category of parentCategories) {
      await page.goto(category.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Look for category title/heading
      const h1 = await page.locator('h1').first().textContent();
      const h2 = await page.locator('h2').first().textContent();
      const title = await page.title();

      console.log(`\n→ ${category.name}`);
      if (h1) console.log(`  H1: ${h1.substring(0, 50)}`);
      if (h2) console.log(`  H2: ${h2.substring(0, 50)}`);
      console.log(`  Page title: ${title.substring(0, 50)}`);
    }
  });

  test('should generate navigation test report', async ({ page }) => {
    console.log('\n=== NAVIGATION TEST REPORT ===');
    console.log(`Total categories in inventory: ${categoryInventory.length}`);
    console.log(`Categories tested: Up to 10 parent categories`);

    const testResults = {
      timestamp: new Date().toISOString(),
      categoriesTested: Math.min(10, categoryInventory.filter(c => c.type === 'parent').length),
      testsPassed: 0,
      testsFailed: 0,
    };

    console.log(`\nResults: ${testResults.categoriesTested} categories navigated`);
    console.log(`Status: Navigation tests completed`);

    console.log(`\nNext steps:`);
    console.log(`1. Run filter tests: npm run test:plp:filters`);
    console.log(`2. Run sorting tests: npm run test:plp:sorting`);
    console.log(`3. Run responsive tests: npm run test:plp:responsive`);
    console.log(`4. Generate final report: npm run test:plp:report`);
  });
});
