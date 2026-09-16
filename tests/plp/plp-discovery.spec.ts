import { test, expect } from '@playwright/test';
import { PLPDiscovery } from '../../plp/utilities/PLPDiscovery';
import { PLPCategory, PLPFilter, PLPSortOption } from '../../plp/types/index';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

test.describe('PLP Discovery - Phase 1', () => {
  const baseUrl = process.env.BASE_URL || 'https://thekanaa.com/en-sa/';
  const baseUrlAr = process.env.BASE_URL_AR || 'https://thekanaa.com/ar-sa/';

  test('should discover all accessible PLPs from navigation', async ({ page }) => {
    console.log('Starting PLP discovery from:', baseUrl);

    const discovery = new PLPDiscovery(page);

    // Discover categories
    const categories = await discovery.discoverCategories(baseUrl);

    console.log(`Discovered ${categories.length} categories`);

    // Should find at least some categories
    expect(categories.length).toBeGreaterThan(0);

    // Verify categories have required fields
    for (const category of categories) {
      expect(category.id).toBeTruthy();
      expect(category.name).toBeTruthy();
      expect(category.url).toBeTruthy();
      expect(category.type).toMatch(/parent|subcategory|nested/);
    }

    // Save discoveries
    const inventoryPath = 'state/plp-inventory.json';
    const inventory = {
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        discoveryStatus: 'in-progress',
      },
      categories,
      summary: {
        totalCategories: categories.length,
        parentCategories: categories.filter(c => c.type === 'parent').length,
        subcategories: categories.filter(c => c.type === 'subcategory').length,
        nestedCategories: categories.filter(c => c.type === 'nested').length,
        discoveredAt: [new Date().toISOString()],
      },
    };

    fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
    console.log(`Saved ${categories.length} categories to ${inventoryPath}`);
  });

  test('should discover filters on first PLP', async ({ page }) => {
    console.log('Discovering filters from:', baseUrl);

    const discovery = new PLPDiscovery(page);

    // First discover categories
    const categories = await discovery.discoverCategories(baseUrl);

    if (categories.length === 0) {
      test.skip();
      return;
    }

    // Pick first category to test
    const firstCategory = categories[0];
    console.log(`Testing filters on: ${firstCategory.name} (${firstCategory.url})`);

    // Navigate to category
    await page.goto(firstCategory.url, { waitUntil: 'domcontentloaded' });

    // Discover filters
    const filters = await discovery.discoverFilters();

    console.log(`Found ${filters.length} filters`);

    // Save filter inventory
    const filterInventoryPath = 'state/plp-filter-inventory.json';
    const filterInventory = {
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        discoveryStatus: 'in-progress',
      },
      filters,
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

  test('should discover sort options on first PLP', async ({ page }) => {
    console.log('Discovering sort options from:', baseUrl);

    const discovery = new PLPDiscovery(page);

    // First discover categories
    const categories = await discovery.discoverCategories(baseUrl);

    if (categories.length === 0) {
      test.skip();
      return;
    }

    // Pick first category
    const firstCategory = categories[0];
    console.log(`Testing sort options on: ${firstCategory.name}`);

    // Navigate to category
    await page.goto(firstCategory.url, { waitUntil: 'domcontentloaded' });

    // Discover sort options
    const sortOptions = await discovery.discoverSortOptions();

    console.log(`Found ${sortOptions.length} sort options`);

    // Save sort inventory
    const sortInventoryPath = 'state/plp-sort-inventory.json';
    const sortInventory = {
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        discoveryStatus: 'in-progress',
      },
      sortOptions,
      summary: {
        totalSortOptions: sortOptions.length,
        discoveredAt: [new Date().toISOString()],
      },
    };

    fs.writeFileSync(sortInventoryPath, JSON.stringify(sortInventory, null, 2));
    console.log(`Saved ${sortOptions.length} sort options to ${sortInventoryPath}`);
  });

  test('should discover product cards on first PLP', async ({ page }) => {
    console.log('Discovering product cards from:', baseUrl);

    const discovery = new PLPDiscovery(page);

    // First discover categories
    const categories = await discovery.discoverCategories(baseUrl);

    if (categories.length === 0) {
      test.skip();
      return;
    }

    // Pick first category
    const firstCategory = categories[0];
    console.log(`Testing product cards on: ${firstCategory.name}`);

    // Navigate to category
    await page.goto(firstCategory.url, { waitUntil: 'domcontentloaded' });

    // Discover products
    const products = await discovery.discoverProductCards();

    console.log(`Found ${products.length} product cards`);

    // Save product inventory
    const productInventoryPath = 'state/plp-product-card-inventory.json';
    const productInventory = {
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        discoveryStatus: 'in-progress',
      },
      productCards: products,
      summary: {
        totalProductCards: products.length,
        discoveredAt: [new Date().toISOString()],
      },
    };

    fs.writeFileSync(productInventoryPath, JSON.stringify(productInventory, null, 2));
    console.log(`Saved ${products.length} product cards to ${productInventoryPath}`);
  });

  test('should detect pagination type on first PLP', async ({ page }) => {
    console.log('Detecting pagination type from:', baseUrl);

    const discovery = new PLPDiscovery(page);

    // First discover categories
    const categories = await discovery.discoverCategories(baseUrl);

    if (categories.length === 0) {
      test.skip();
      return;
    }

    // Pick first category
    const firstCategory = categories[0];

    // Navigate to category
    await page.goto(firstCategory.url, { waitUntil: 'domcontentloaded' });

    // Detect pagination type
    const paginationType = await discovery.detectPaginationType();

    console.log(`Pagination type: ${paginationType}`);
    expect(['pagination', 'load-more', 'infinite-scroll', 'none']).toContain(paginationType);
  });

  test('should generate complete discovery report', async ({ page }) => {
    console.log('Generating complete discovery report');

    const discovery = new PLPDiscovery(page);

    // Discover all categories
    const categories = await discovery.discoverCategories(baseUrl);
    console.log(`Total categories discovered: ${categories.length}`);

    const report = {
      timestamp: new Date().toISOString(),
      baseUrl,
      totalCategoriesDiscovered: categories.length,
      categoryBreakdown: {
        parents: categories.filter(c => c.type === 'parent').length,
        subcategories: categories.filter(c => c.type === 'subcategory').length,
        nested: categories.filter(c => c.type === 'nested').length,
      },
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        url: c.url,
        type: c.type,
        level: c.level,
      })),
      nextSteps: [
        '1. Review discovered categories in state/plp-inventory.json',
        '2. Navigate to top-priority PLPs for filter/sort discovery',
        '3. Create test strategy in specs/plp-test-plan.md',
        '4. Run filter and sort tests',
        '5. Generate comprehensive test report',
      ],
    };

    const reportPath = 'reports/plp-discovery-report.json';
    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`Discovery report saved to ${reportPath}`);
    console.log(`\nSummary:`);
    console.log(`- Total categories: ${categories.length}`);
    console.log(`- Parent categories: ${report.categoryBreakdown.parents}`);
    console.log(`- Subcategories: ${report.categoryBreakdown.subcategories}`);
    console.log(`- Nested categories: ${report.categoryBreakdown.nested}`);
  });
});
