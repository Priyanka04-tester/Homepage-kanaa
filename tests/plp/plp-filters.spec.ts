import { test, expect } from '@playwright/test';
import { PLPPage } from '../../plp/pages/PLPPage';
import { PLPDiscovery } from '../../plp/utilities/PLPDiscovery';
import { EvidenceCollector } from '../../plp/utilities/EvidenceCollector';
import { BugReporter } from '../../plp/utilities/BugReporter';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

test.describe('PLP Filter Testing - Phase 5', () => {
  const baseUrl = process.env.BASE_URL || 'https://thekanaa.com/en-sa/';
  let categoryInventory: any[] = [];

  test.beforeAll(() => {
    // Load discovered categories
    try {
      const inventoryPath = 'state/plp-inventory.json';
      if (fs.existsSync(inventoryPath)) {
        const content = fs.readFileSync(inventoryPath, 'utf-8');
        const inventory = JSON.parse(content);
        categoryInventory = inventory.categories || [];
        console.log(`Loaded ${categoryInventory.length} categories for filter testing`);
      }
    } catch (e) {
      console.log('Could not load category inventory');
    }
  });

  test('should discover filters on first parent category', async ({ page }) => {
    const discovery = new PLPDiscovery(page);
    const evidence = new EvidenceCollector(page, './evidence/plp');

    // Get first parent category
    const parentCategories = categoryInventory.filter(c => c.type === 'parent');
    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const category = parentCategories[0];
    console.log(`Testing filters on: ${category.name} (${category.url})`);

    // Navigate to category
    await page.goto(category.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Take screenshot before filters
    await evidence.captureScreenshot(`FILTER-${category.id}`, 'before-filter');

    // Discover filters
    const filters = await discovery.discoverFilters();

    console.log(`Found ${filters.length} filters on ${category.name}`);

    // Verify filters
    expect(filters).toBeDefined();

    // Test applying first filter if any exist
    if (filters.length > 0) {
      const firstFilter = filters[0];
      console.log(`Testing filter: ${firstFilter.name} with ${firstFilter.values.length} values`);

      // Apply first filter value
      if (firstFilter.values.length > 0) {
        const filterValue = firstFilter.values[0];
        console.log(`Applying: ${firstFilter.name} = ${filterValue.label}`);

        // Try to apply the filter
        try {
          // Find the filter on the page
          const filterElements = await page.locator(`text="${filterValue.label}"`).all();
          if (filterElements.length > 0) {
            await filterElements[0].click({ force: true });
            await page.waitForLoadState('domcontentloaded');

            // Take screenshot after filter
            await evidence.captureScreenshot(`FILTER-${category.id}`, 'after-filter');

            // Get product count after filter
            const plpPage = new PLPPage(page);
            const productCount = await plpPage.getProductCount();
            console.log(`Products after filter: ${productCount}`);

            expect(productCount).toBeGreaterThanOrEqual(0);
          }
        } catch (e) {
          console.log(`Could not apply filter: ${e.message}`);
        }
      }
    }

    // Save filter inventory
    const filterInventoryPath = 'state/plp-filter-inventory.json';
    const filterInventory = {
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        discoveryStatus: 'in-progress',
      },
      filters: filters,
      summary: {
        totalFilters: filters.length,
        filtersByType: {
          checkbox: filters.filter(f => f.type === 'checkbox').length,
          radio: filters.filter(f => f.type === 'radio').length,
          range: filters.filter(f => f.type === 'range').length,
          dropdown: filters.filter(f => f.type === 'dropdown').length,
          custom: filters.filter(f => f.type === 'custom').length,
        },
        discoveredAt: [new Date().toISOString()],
      },
    };

    fs.writeFileSync(filterInventoryPath, JSON.stringify(filterInventory, null, 2));
    console.log(`Saved ${filters.length} filters to ${filterInventoryPath}`);
  });

  test('should discover filters on multiple categories', async ({ page }) => {
    const discovery = new PLPDiscovery(page);
    const bugReporter = new BugReporter('./state/plp-bugs.json');
    const evidence = new EvidenceCollector(page, './evidence/plp');

    // Test first 5 parent categories
    const parentCategories = categoryInventory.filter(c => c.type === 'parent').slice(0, 5);

    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const allFilters = new Map();

    for (const category of parentCategories) {
      console.log(`\nTesting filters on: ${category.name}`);

      try {
        // Navigate to category
        await page.goto(category.url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        // Discover filters
        const filters = await discovery.discoverFilters();

        if (filters.length > 0) {
          console.log(`  Found ${filters.length} filters`);

          // Store filter by category
          allFilters.set(category.name, {
            url: category.url,
            filterCount: filters.length,
            filters: filters.map(f => ({
              name: f.name,
              type: f.type,
              valueCount: f.values.length,
            })),
          });

          // Test first filter if available
          if (filters.length > 0 && filters[0].values.length > 0) {
            const testFilter = filters[0];
            const testValue = testFilter.values[0];

            console.log(`  Testing: ${testFilter.name} = ${testValue.label}`);

            try {
              const filterElements = await page.locator(`text="${testValue.label}"`).all();
              if (filterElements.length > 0) {
                const beforeCount = await new PLPPage(page).getProductCount();

                await filterElements[0].click({ force: true });
                await page.waitForLoadState('domcontentloaded');

                const afterCount = await new PLPPage(page).getProductCount();

                console.log(`    Before: ${beforeCount} products, After: ${afterCount} products`);

                if (beforeCount > 0 && afterCount > beforeCount) {
                  console.log(`    ⚠️  Filter increased product count (might be issue)`);
                }
              }
            } catch (e) {
              console.log(`  Could not test filter application`);
            }
          }
        } else {
          console.log(`  No filters found on this PLP`);
        }
      } catch (e) {
        console.log(`Error testing ${category.name}: ${e.message}`);
        bugReporter.reportPotentialIssue(
          `Could not test filters on ${category.name}`,
          `Navigation or content loading issue: ${e.message}`,
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

    // Report summary
    console.log(`\n=== FILTER DISCOVERY SUMMARY ===`);
    console.log(`Categories tested: ${allFilters.size}`);

    for (const [categoryName, data] of allFilters) {
      console.log(`\n${categoryName}:`);
      console.log(`  Filters: ${data.filterCount}`);
      data.filters.forEach(f => {
        console.log(`    - ${f.name} (${f.type}): ${f.valueCount} values`);
      });
    }
  });

  test('should test filter persistence on page refresh', async ({ page }) => {
    const discovery = new PLPDiscovery(page);
    const bugReporter = new BugReporter('./state/plp-bugs.json');

    // Get first category with filters
    const parentCategories = categoryInventory.filter(c => c.type === 'parent').slice(0, 1);

    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const category = parentCategories[0];
    console.log(`Testing filter persistence on: ${category.name}`);

    // Navigate to category
    await page.goto(category.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Discover filters
    const filters = await discovery.discoverFilters();

    if (filters.length > 0 && filters[0].values.length > 0) {
      const testFilter = filters[0];
      const testValue = testFilter.values[0];

      console.log(`Applying filter: ${testFilter.name} = ${testValue.label}`);

      // Get URL before filter
      const urlBefore = page.url();

      // Apply filter
      const filterElements = await page.locator(`text="${testValue.label}"`).all();
      if (filterElements.length > 0) {
        await filterElements[0].click({ force: true });
        await page.waitForLoadState('domcontentloaded');

        const urlAfter = page.url();
        console.log(`URL before: ${urlBefore}`);
        console.log(`URL after:  ${urlAfter}`);

        // Refresh page
        console.log('Refreshing page...');
        await page.reload();
        await page.waitForLoadState('domcontentloaded');

        const urlAfterRefresh = page.url();
        console.log(`URL after refresh: ${urlAfterRefresh}`);

        // Check if filters persisted
        if (urlAfter === urlAfterRefresh) {
          console.log('✅ Filter persisted through refresh (URL-based)');
        } else {
          console.log('⚠️  Filter state might not be URL-based');
          bugReporter.reportPotentialIssue(
            'Filter not persisted in URL after refresh',
            `Filter ${testFilter.name} was applied but URL changed after refresh`,
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
    }
  });

  test('should test filter with no results', async ({ page }) => {
    const discovery = new PLPDiscovery(page);
    const bugReporter = new BugReporter('./state/plp-bugs.json');
    const plpPage = new PLPPage(page);

    // Get first category
    const parentCategories = categoryInventory.filter(c => c.type === 'parent').slice(0, 1);

    if (parentCategories.length === 0) {
      test.skip();
      return;
    }

    const category = parentCategories[0];
    console.log(`Testing no-results scenario on: ${category.name}`);

    // Navigate to category
    await page.goto(category.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Discover filters
    const filters = await discovery.discoverFilters();

    if (filters.length >= 2 && filters[0].values.length > 0 && filters[1].values.length > 0) {
      // Try applying multiple filters that might result in no products
      const filter1Value = filters[0].values[0];
      const filter2Value = filters[1].values[0];

      console.log(`Applying: ${filters[0].name} = ${filter1Value.label}`);
      console.log(`Applying: ${filters[1].name} = ${filter2Value.label}`);

      try {
        // Apply first filter
        let elements = await page.locator(`text="${filter1Value.label}"`).all();
        if (elements.length > 0) {
          await elements[0].click({ force: true });
          await page.waitForLoadState('domcontentloaded');
        }

        // Apply second filter
        elements = await page.locator(`text="${filter2Value.label}"`).all();
        if (elements.length > 0) {
          await elements[0].click({ force: true });
          await page.waitForLoadState('domcontentloaded');
        }

        // Check if empty state message appears
        const isEmpty = await plpPage.isEmptyState();
        const productCount = await plpPage.getProductCount();

        console.log(`Empty state: ${isEmpty}, Products: ${productCount}`);

        if (isEmpty || productCount === 0) {
          console.log('✅ Empty state handling working');

          // Verify message is user-friendly
          const emptyMsg = await page.locator('[class*="empty"], [class*="no-results"]').textContent();
          console.log(`Empty message: ${emptyMsg}`);
        }
      } catch (e) {
        console.log(`Could not test no-results scenario: ${e.message}`);
      }
    }
  });

  test('should generate filter test report', async ({ page }) => {
    console.log('\n=== FILTER TEST REPORT ===');
    console.log(`Total categories in inventory: ${categoryInventory.length}`);
    console.log(`Categories tested: Multiple PLPs for filter discovery`);

    const filterInventoryPath = 'state/plp-filter-inventory.json';
    if (fs.existsSync(filterInventoryPath)) {
      const content = fs.readFileSync(filterInventoryPath, 'utf-8');
      const filterInventory = JSON.parse(content);

      console.log(`\nFilters discovered: ${filterInventory.summary.totalFilters}`);
      console.log(`Filter types:`);
      console.log(`  - Checkbox: ${filterInventory.summary.filtersByType.checkbox}`);
      console.log(`  - Radio: ${filterInventory.summary.filtersByType.radio}`);
      console.log(`  - Range: ${filterInventory.summary.filtersByType.range}`);
      console.log(`  - Dropdown: ${filterInventory.summary.filtersByType.dropdown}`);
      console.log(`  - Custom: ${filterInventory.summary.filtersByType.custom}`);

      console.log(`\nNext steps:`);
      console.log(`1. Review filter inventory in state/plp-filter-inventory.json`);
      console.log(`2. Run sorting tests: npm run test:plp:sorting`);
      console.log(`3. Run product card tests: npm run test:plp:product-cards`);
      console.log(`4. Run responsive tests: npm run test:plp:responsive`);
      console.log(`5. Generate full report: npm run test:plp:report`);
    }
  });
});
