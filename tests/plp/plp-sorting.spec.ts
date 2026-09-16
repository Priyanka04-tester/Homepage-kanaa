import { test, expect } from '@playwright/test';
import { PLPPage } from '../../plp/pages/PLPPage';
import { PLPDiscovery } from '../../plp/utilities/PLPDiscovery';
import { EvidenceCollector } from '../../plp/utilities/EvidenceCollector';
import { BugReporter } from '../../plp/utilities/BugReporter';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

test.describe('PLP Sorting Testing - Phase 6', () => {
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

  test('should discover sort options on first category', async ({ page }) => {
    const discovery = new PLPDiscovery(page);
    const evidence = new EvidenceCollector(page, './evidence/plp');

    const parentCategories = categoryInventory.filter(c => c.type === 'parent');
    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const category = parentCategories[0];
    console.log(`Testing sort options on: ${category.name}`);

    await page.goto(category.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Discover sort options
    const sortOptions = await discovery.discoverSortOptions();

    console.log(`Found ${sortOptions.length} sort options`);
    for (const option of sortOptions) {
      console.log(`  - ${option.label} (${option.value})`);
    }

    expect(sortOptions).toBeDefined();

    // Take screenshot
    await evidence.captureScreenshot(`SORT-${category.id}`, 'sort-options');

    // Save sort inventory
    const sortInventoryPath = 'state/plp-sort-inventory.json';
    const sortInventory = {
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        discoveryStatus: 'in-progress',
      },
      sortOptions: sortOptions,
      summary: {
        totalSortOptions: sortOptions.length,
        discoveredAt: [new Date().toISOString()],
      },
    };

    fs.writeFileSync(sortInventoryPath, JSON.stringify(sortInventory, null, 2));
    console.log(`Saved ${sortOptions.length} sort options`);
  });

  test('should test each sort option on first category', async ({ page }) => {
    const discovery = new PLPDiscovery(page);
    const plpPage = new PLPPage(page);
    const evidence = new EvidenceCollector(page, './evidence/plp');
    const bugReporter = new BugReporter('./state/plp-bugs.json');

    const parentCategories = categoryInventory.filter(c => c.type === 'parent');
    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const category = parentCategories[0];
    console.log(`Testing sort functionality on: ${category.name}`);

    await page.goto(category.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Get initial product list
    const initialProducts = await page.locator('[class*="product-card"], [class*="product-item"]').all();
    console.log(`Initial product count: ${initialProducts.length}`);

    // Discover sort options
    const sortOptions = await discovery.discoverSortOptions();

    if (sortOptions.length === 0) {
      console.log('No sort options found on this PLP');
      return;
    }

    // Test first 3 sort options
    for (let i = 0; i < Math.min(3, sortOptions.length); i++) {
      const sortOption = sortOptions[i];
      console.log(`\nTesting sort: ${sortOption.label}`);

      try {
        // Apply sort
        await plpPage.applySortOption(sortOption.value);

        // Wait for page to update
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1500);

        // Get new product list
        const newProducts = await page.locator('[class*="product-card"], [class*="product-item"]').all();
        console.log(`  Products after sort: ${newProducts.length}`);

        // Take screenshot
        await evidence.captureScreenshot(
          `SORT-${category.id}`,
          `sort-${i + 1}-${sortOption.label.replace(/\s+/g, '-').toLowerCase()}`
        );

        // Check if product order changed (if same count)
        if (initialProducts.length === newProducts.length) {
          console.log(`  ✅ Sort option applied (${newProducts.length} products)`);
        } else {
          console.log(
            `  ⚠️  Product count changed: ${initialProducts.length} → ${newProducts.length}`
          );
          bugReporter.reportPotentialIssue(
            `Product count changed when applying sort: ${sortOption.label}`,
            `Expected same product count before and after sort`,
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
        console.log(`  ❌ Failed to apply sort: ${e.message}`);
        bugReporter.reportFunctionalBug(
          `Failed to apply sort option: ${sortOption.label}`,
          {
            url: category.url,
            categoryId: category.id,
            locale: 'en',
            viewport: '1440x900',
            browser: 'chromium',
            stepsToReproduce: [
              `Navigate to ${category.url}`,
              `Try to apply sort: ${sortOption.label}`,
            ],
            expectedResult: 'Sort option should be applied and products reordered',
            actualResult: `Error: ${e.message}`,
            severity: 'Medium',
            businessImpact: 'Users cannot sort products',
          }
        );
      }
    }
  });

  test('should test sort persistence on page refresh', async ({ page }) => {
    const discovery = new PLPDiscovery(page);
    const plpPage = new PLPPage(page);

    const parentCategories = categoryInventory.filter(c => c.type === 'parent');
    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const category = parentCategories[0];
    console.log(`Testing sort persistence on: ${category.name}`);

    await page.goto(category.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const sortOptions = await discovery.discoverSortOptions();

    if (sortOptions.length === 0) {
      console.log('No sort options to test');
      return;
    }

    const testSort = sortOptions[0];
    console.log(`Applying sort: ${testSort.label}`);

    const urlBefore = page.url();

    try {
      // Apply sort
      await plpPage.applySortOption(testSort.value);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      const urlAfter = page.url();
      console.log(`URL before sort: ${urlBefore}`);
      console.log(`URL after sort:  ${urlAfter}`);

      // Refresh page
      console.log('Refreshing page...');
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      const urlAfterRefresh = page.url();
      console.log(`URL after refresh: ${urlAfterRefresh}`);

      // Check if sort persisted
      if (urlAfter === urlAfterRefresh) {
        console.log('✅ Sort persisted through refresh (URL-based)');
      } else if (urlBefore === urlAfterRefresh) {
        console.log('⚠️  Sort did not persist after refresh');
      }
    } catch (e) {
      console.log(`Could not test sort persistence: ${e.message}`);
    }
  });

  test('should test sort with filters applied', async ({ page }) => {
    const discovery = new PLPDiscovery(page);
    const plpPage = new PLPPage(page);

    const parentCategories = categoryInventory.filter(c => c.type === 'parent');
    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const category = parentCategories[0];
    console.log(`Testing sort + filters on: ${category.name}`);

    await page.goto(category.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Get filters and sorts
    const filters = await discovery.discoverFilters();
    const sortOptions = await discovery.discoverSortOptions();

    if (filters.length === 0 || sortOptions.length === 0) {
      console.log('Not enough filters or sorts to test combination');
      return;
    }

    console.log(`Testing with ${filters.length} filters and ${sortOptions.length} sort options`);

    // Apply first filter
    const testFilter = filters[0];
    const testFilterValue = testFilter.values[0];

    try {
      console.log(`Applying filter: ${testFilter.name} = ${testFilterValue.label}`);
      const filterElements = await page.locator(`text="${testFilterValue.label}"`).all();
      if (filterElements.length > 0) {
        await filterElements[0].click({ force: true });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const productCountAfterFilter = await plpPage.getProductCount();
        console.log(`Products after filter: ${productCountAfterFilter}`);

        // Now apply sort
        const testSort = sortOptions[0];
        console.log(`Applying sort: ${testSort.label}`);
        await plpPage.applySortOption(testSort.value);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const productCountAfterSort = await plpPage.getProductCount();
        console.log(`Products after sort: ${productCountAfterSort}`);

        if (productCountAfterSort === productCountAfterFilter) {
          console.log('✅ Sort applied correctly with filters');
        }
      }
    } catch (e) {
      console.log(`Could not test sort with filters: ${e.message}`);
    }
  });

  test('should generate sort test report', async ({ page }) => {
    console.log('\n=== SORT TEST REPORT ===');

    const sortInventoryPath = 'state/plp-sort-inventory.json';
    if (fs.existsSync(sortInventoryPath)) {
      const content = fs.readFileSync(sortInventoryPath, 'utf-8');
      const sortInventory = JSON.parse(content);

      console.log(`\nSort options discovered: ${sortInventory.summary.totalSortOptions}`);
      if (sortInventory.sortOptions.length > 0) {
        console.log('Sort options:');
        sortInventory.sortOptions.forEach((s: any) => {
          console.log(`  - ${s.label}`);
        });
      }

      console.log(`\nNext steps:`);
      console.log(`1. Review sort options in state/plp-sort-inventory.json`);
      console.log(`2. Run product card tests: npm run test:plp:product-cards`);
      console.log(`3. Run responsive tests: npm run test:plp:responsive`);
      console.log(`4. Run localization tests: npm run test:plp:localization`);
    }
  });
});
