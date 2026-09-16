import { Page, Browser } from '@playwright/test';
import { PLPCategory, PLPFilter, PLPSortOption, ProductCard } from '../types/index';

export class PLPDiscovery {
  constructor(private page: Page) {}

  /**
   * Discover all accessible category/PLP pages on the website
   */
  async discoverCategories(baseUrl: string): Promise<PLPCategory[]> {
    const categories: PLPCategory[] = [];

    await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2000); // Wait for dynamic content

    // Get ALL links on the page
    const allLinks = await this.page.locator('a').all();

    console.log(`Found ${allLinks.length} total links to inspect`);

    for (const link of allLinks) {
      try {
        const href = await link.getAttribute('href').catch(() => null);
        const text = await link.textContent().catch(() => null);

        if (href && text && this.isCategoryLink(href)) {
          // Convert relative URL to absolute
          let categoryUrl = href;
          if (href.startsWith('/')) {
            const baseUrlObj = new URL(baseUrl);
            categoryUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${href}`;
          } else if (!href.startsWith('http')) {
            categoryUrl = new URL(href, baseUrl).toString();
          }

          // Check if already added
          if (!categories.find(c => c.url === categoryUrl)) {
            categories.push({
              id: `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: text.trim(),
              url: categoryUrl,
              type: this.classifyLinkType(href),
              level: this.calculateLinkLevel(href),
              visible: true,
              locale: this.detectLocale(baseUrl),
              discoveredAt: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        // Silently skip links that fail to process
        continue;
      }
    }

    console.log(`Discovered ${categories.length} category links`);
    return categories;
  }

  /**
   * Discover all filters on a PLP page
   */
  async discoverFilters(): Promise<PLPFilter[]> {
    const filters: PLPFilter[] = [];

    // Look for common filter container patterns
    const filterContainers = await this.page.locator(
      '[class*="filter"], [class*="sidebar"], [class*="refine"], [data-testid*="filter"]'
    ).all();

    for (const container of filterContainers) {
      const filterName = await this.extractFilterName(container);
      if (!filterName) continue;

      const filterType = await this.detectFilterType(container);
      const values = await this.extractFilterValues(container);

      if (values.length > 0) {
        filters.push({
          id: `FILTER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: filterName,
          type: filterType,
          values: values,
          applied: [],
          persistent: await this.checkFilterPersistence(),
          visible: true,
          locale: this.detectPageLocale(),
        });
      }
    }

    return filters;
  }

  /**
   * Discover all sort options on a PLP page
   */
  async discoverSortOptions(): Promise<PLPSortOption[]> {
    const sortOptions: PLPSortOption[] = [];

    // Look for sort dropdown or buttons
    const sortSelectors = [
      'select[name*="sort"]',
      '[class*="sort"] select',
      '[class*="sort"] button',
      '[data-testid*="sort"]',
    ];

    for (const selector of sortSelectors) {
      const elements = await this.page.locator(selector).all();

      for (const element of elements) {
        const optionElements = await element.locator('option, [role="option"], button').all();

        for (const optionEl of optionElements) {
          const label = await optionEl.textContent();
          const value = await optionEl.getAttribute('value') || label;

          if (label && !sortOptions.find(s => s.label === label)) {
            sortOptions.push({
              id: `SORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              label: label.trim(),
              value: value?.trim() || '',
            });
          }
        }
      }
    }

    return sortOptions;
  }

  /**
   * Discover all product cards visible on the current PLP
   */
  async discoverProductCards(): Promise<ProductCard[]> {
    const products: ProductCard[] = [];

    const productSelectors = [
      '[class*="product-card"]',
      '[class*="product-item"]',
      '[class*="product-box"]',
      '[data-testid*="product"]',
      'article[class*="product"]',
    ];

    for (const selector of productSelectors) {
      const elements = await this.page.locator(selector).all();

      for (const element of elements) {
        const product = await this.extractProductInfo(element);
        if (product && !products.find(p => p.url === product.url)) {
          products.push(product);
        }
      }
    }

    return products;
  }

  /**
   * Check if page has load more or infinite scroll
   */
  async detectPaginationType(): Promise<'pagination' | 'load-more' | 'infinite-scroll' | 'none'> {
    // Check for load more button
    const loadMoreBtn = await this.page.locator('[class*="load-more"], [data-testid*="load-more"]').isVisible();
    if (loadMoreBtn) return 'load-more';

    // Check for pagination
    const paginationExists = await this.page.locator('nav[aria-label*="Paginat"], [class*="pagination"]').isVisible();
    if (paginationExists) return 'pagination';

    // Infinite scroll is harder to detect statically - mark as potential
    return 'none';
  }

  /**
   * Navigate through filters and track their impact
   */
  async testFilterNavigation(filter: PLPFilter): Promise<{
    selectedValue: string;
    productCountBefore: number;
    productCountAfter: number;
    urlChanged: boolean;
    resultsChanged: boolean;
  }[]> {
    const results = [];

    for (const value of filter.values.slice(0, 3)) { // Test first 3 values
      const countBefore = await this.getProductCount();
      const urlBefore = this.page.url();

      // Click filter value
      await this.clickFilterValue(filter.name, value.label);
      await this.page.waitForLoadState('domcontentloaded');

      const countAfter = await this.getProductCount();
      const urlAfter = this.page.url();

      results.push({
        selectedValue: value.label,
        productCountBefore: countBefore,
        productCountAfter: countAfter,
        urlChanged: urlBefore !== urlAfter,
        resultsChanged: countBefore !== countAfter,
      });

      // Reset filter
      await this.resetFilters();
    }

    return results;
  }

  /**
   * Helper methods
   */

  private isCategoryLink(href: string): boolean {
    // Filter out non-category links
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return false;
    if (href.includes('/account') || href.includes('/cart') || href.includes('/search')) return false;
    if (href.includes('/help') || href.includes('/contact') || href.includes('/about')) return false;

    // Match category patterns
    const categoryKeywords = [
      '/c/', '/category', '/shop', '/products', '/collections',
      '.html', // Matches: gaming-consoles.html, toys-games.html, etc
    ];
    return categoryKeywords.some(keyword => href.toLowerCase().includes(keyword));
  }

  private classifyLinkType(href: string): 'parent' | 'subcategory' | 'nested' {
    const parts = href.split('/').filter(p => p);
    if (parts.length <= 2) return 'parent';
    if (parts.length <= 4) return 'subcategory';
    return 'nested';
  }

  private calculateLinkLevel(href: string): number {
    return href.split('/').filter(p => p && !p.includes('.com')).length;
  }

  private detectLocale(url: string): 'en' | 'ar' {
    return url.includes('/ar') || url.includes('ar-') ? 'ar' : 'en';
  }

  private detectPageLocale(): 'en' | 'ar' {
    return this.detectLocale(this.page.url());
  }

  private async extractFilterName(element: any): Promise<string | null> {
    const possibleSelectors = [
      'h3, h4, label, [class*="filter-title"], [class*="filter-name"]',
    ];

    for (const selector of possibleSelectors) {
      const el = await element.locator(selector).first();
      const text = await el.textContent();
      if (text) return text.trim();
    }

    return null;
  }

  private async detectFilterType(element: any): Promise<'checkbox' | 'radio' | 'range' | 'dropdown' | 'custom'> {
    const hasCheckbox = await element.locator('input[type="checkbox"]').count() > 0;
    if (hasCheckbox) return 'checkbox';

    const hasRadio = await element.locator('input[type="radio"]').count() > 0;
    if (hasRadio) return 'radio';

    const hasRange = await element.locator('input[type="range"]').count() > 0;
    if (hasRange) return 'range';

    const hasSelect = await element.locator('select').count() > 0;
    if (hasSelect) return 'dropdown';

    return 'custom';
  }

  private async extractFilterValues(element: any): Promise<any[]> {
    const values = [];

    // Try checkboxes
    const checkboxes = await element.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes) {
      const label = await checkbox.locator('..').textContent();
      if (label) {
        values.push({
          id: `VAL-${Math.random().toString(36).substr(2, 9)}`,
          label: label.trim(),
          value: await checkbox.getAttribute('value'),
        });
      }
    }

    // Try options
    if (values.length === 0) {
      const options = await element.locator('option, li, [role="option"]').all();
      for (const option of options) {
        const text = await option.textContent();
        if (text && !text.includes('Select') && !text.includes('All')) {
          values.push({
            id: `VAL-${Math.random().toString(36).substr(2, 9)}`,
            label: text.trim(),
            value: text.trim(),
          });
        }
      }
    }

    return values.slice(0, 10); // Limit to first 10 values
  }

  private async extractProductInfo(element: any): Promise<ProductCard | null> {
    try {
      const nameEl = await element.locator('[class*="name"], [class*="title"], h2, h3').first();
      const name = await nameEl.textContent();

      const linkEl = await element.locator('a').first();
      const url = await linkEl.getAttribute('href');

      const priceEl = await element.locator('[class*="price"]').first();
      const priceText = await priceEl.textContent();

      if (!name || !url) return null;

      const price = this.parsePrice(priceText || '0');
      const imageUrl = await element.locator('img').first().getAttribute('src');

      return {
        id: `PROD-${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        url: url,
        imageUrl: imageUrl || undefined,
        price: price,
        inStock: !await element.locator('[class*="out-of-stock"]').isVisible(),
        hasWishlist: await element.locator('[class*="wishlist"]').isVisible(),
        hasAddToCart: await element.locator('button[class*="add-to-cart"]').isVisible(),
        hasQuickView: await element.locator('[class*="quick-view"]').isVisible(),
        labels: [],
        locale: this.detectPageLocale(),
      };
    } catch (e) {
      return null;
    }
  }

  private parsePrice(priceText: string): number {
    const match = priceText.match(/\d+\.?\d*/);
    return match ? parseFloat(match[0]) : 0;
  }

  private async getProductCount(): Promise<number> {
    const countSelectors = [
      '[class*="product-count"]',
      '[data-testid*="product-count"]',
    ];

    for (const selector of countSelectors) {
      const el = await this.page.locator(selector).first();
      const text = await el.textContent();
      const match = text?.match(/\d+/);
      if (match) return parseInt(match[0]);
    }

    return await this.page.locator('[class*="product-card"], [class*="product-item"]').count();
  }

  private async clickFilterValue(filterName: string, value: string): Promise<void> {
    const selectors = [
      `text="${value}"`,
      `[aria-label*="${value}"]`,
    ];

    for (const selector of selectors) {
      try {
        await this.page.locator(selector).first().click({ force: true });
        return;
      } catch {
        continue;
      }
    }
  }

  private async checkFilterPersistence(): Promise<boolean> {
    const urlBefore = this.page.url();
    await this.page.reload();
    const urlAfter = this.page.url();
    return urlBefore === urlAfter;
  }

  private async resetFilters(): Promise<void> {
    const resetBtn = await this.page.locator('[class*="reset"], button:has-text("Clear")').first();
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }
}
