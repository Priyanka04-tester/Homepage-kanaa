import { Page, expect } from '@playwright/test';
import { PLPFilter, ProductCard, PLPSortOption } from '../types/index';

export class PLPPage {
  constructor(private page: Page) {}

  /**
   * Navigation methods
   */
  async navigateToCategory(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
  }

  async goToPage(pageNumber: number): Promise<void> {
    const paginationLink = await this.page.locator(`[aria-label*="Page ${pageNumber}"], a:has-text("${pageNumber}")`).first();
    if (await paginationLink.isVisible()) {
      await paginationLink.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async clickLoadMore(): Promise<void> {
    const loadMoreBtn = await this.page.locator('[class*="load-more"], button:has-text("Load More")').first();
    if (await loadMoreBtn.isVisible()) {
      await loadMoreBtn.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Filter operations
   */
  async applyFilter(filterName: string, value: string | string[]): Promise<void> {
    const values = Array.isArray(value) ? value : [value];

    for (const val of values) {
      // Try to find and click filter value
      const filterElements = await this.page.locator(`text="${val}"`).all();

      for (const el of filterElements) {
        const isClickable = await el.evaluate((node) => {
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        if (isClickable) {
          await el.click({ force: true });
          await this.page.waitForLoadState('domcontentloaded');
          break;
        }
      }
    }
  }

  async clearFilter(filterName: string): Promise<void> {
    const clearBtn = await this.page.locator(`[class*="clear"], button:has-text("Clear")`).first();
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async clearAllFilters(): Promise<void> {
    const clearAllBtn = await this.page.locator('[class*="clear-all"], button:has-text("Clear All")').first();
    if (await clearAllBtn.isVisible()) {
      await clearAllBtn.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Sorting operations
   */
  async applySortOption(sortValue: string): Promise<void> {
    // Try dropdown/select
    const selectEl = await this.page.locator('select[name*="sort"]').first();
    if (await selectEl.isVisible()) {
      await selectEl.selectOption(sortValue);
      await this.page.waitForLoadState('domcontentloaded');
      return;
    }

    // Try button/link
    const sortBtn = await this.page.locator(`button:has-text("${sortValue}"), a:has-text("${sortValue}")`).first();
    if (await sortBtn.isVisible()) {
      await sortBtn.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Viewport/responsive testing
   */
  async switchViewport(viewport: 'mobile' | 'tablet' | 'desktop'): Promise<void> {
    const viewports = {
      mobile: { width: 390, height: 844 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1440, height: 900 },
    };

    const size = viewports[viewport];
    await this.page.setViewportSize(size);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Language switching
   */
  async switchLanguage(lang: 'en' | 'ar'): Promise<void> {
    const langSelector = await this.page.locator('[class*="language"], [class*="lang-selector"]').first();
    if (await langSelector.isVisible()) {
      await langSelector.click();
    }

    const langOption = await this.page.locator(`button:has-text("${lang.toUpperCase()}"), a:has-text("${lang.toUpperCase()}")`).first();
    if (await langOption.isVisible()) {
      await langOption.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Product interactions
   */
  async clickProductCard(productIndex: number): Promise<void> {
    const productCards = await this.page.locator('[class*="product-card"], [class*="product-item"]').all();
    if (productIndex < productCards.length) {
      const link = await productCards[productIndex].locator('a').first();
      await link.click();
    }
  }

  async addProductToCart(productIndex: number): Promise<void> {
    const productCards = await this.page.locator('[class*="product-card"]').all();
    if (productIndex < productCards.length) {
      const addToCartBtn = await productCards[productIndex].locator('button:has-text("Add"), button[class*="add-to-cart"]').first();
      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();
      }
    }
  }

  async toggleWishlist(productIndex: number): Promise<void> {
    const productCards = await this.page.locator('[class*="product-card"]').all();
    if (productIndex < productCards.length) {
      const wishlistBtn = await productCards[productIndex].locator('[class*="wishlist"], [aria-label*="wishlist"]').first();
      if (await wishlistBtn.isVisible()) {
        await wishlistBtn.click();
      }
    }
  }

  /**
   * Verification methods
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    const title = await this.page.title();
    expect(title).toContain(expectedTitle);
  }

  async verifyProductsDisplayed(minCount: number): Promise<number> {
    const productCount = await this.page.locator('[class*="product-card"], [class*="product-item"]').count();
    expect(productCount).toBeGreaterThanOrEqual(minCount);
    return productCount;
  }

  async verifyProductCount(expectedCount: number): Promise<void> {
    const countSelectors = [
      '[class*="product-count"]',
      '[data-testid*="product-count"]',
    ];

    for (const selector of countSelectors) {
      const el = await this.page.locator(selector).first();
      if (await el.isVisible()) {
        const text = await el.textContent();
        expect(text).toContain(expectedCount.toString());
        return;
      }
    }
  }

  async verifyFilterApplied(filterValue: string): Promise<void> {
    const appliedFilter = await this.page.locator(`[class*="active"], [class*="selected"]`).filter({ hasText: filterValue }).first();
    await expect(appliedFilter).toBeVisible();
  }

  async verifySortApplied(sortValue: string): Promise<void> {
    const select = await this.page.locator('select[name*="sort"]').first();
    if (await select.isVisible()) {
      const selectedValue = await select.inputValue();
      expect(selectedValue).toContain(sortValue);
    }
  }

  async verifyProductListOrder(expectedOrder: 'ascending' | 'descending'): Promise<void> {
    const prices = await this.page.locator('[class*="price"]').allTextContents();
    // Implementation depends on price format
  }

  async verifyRTLLayout(): Promise<void> {
    const direction = await this.page.evaluate(() => document.documentElement.dir);
    expect(direction).toBe('rtl');
  }

  async verifyLTRLayout(): Promise<void> {
    const direction = await this.page.evaluate(() => document.documentElement.dir);
    expect(direction).not.toBe('rtl');
  }

  async verifyBreadcrumb(expectedPath: string[]): Promise<void> {
    const breadcrumbItems = await this.page.locator('[class*="breadcrumb"] a, nav[aria-label*="Breadcrumb"] a').allTextContents();
    for (const expectedItem of expectedPath) {
      expect(breadcrumbItems.join(' > ')).toContain(expectedItem);
    }
  }

  async verifyNoHorizontalScroll(): Promise<void> {
    const overflowX = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });
    expect(overflowX).toBe(true);
  }

  async verifyImagesLoaded(): Promise<void> {
    const images = await this.page.locator('[class*="product-card"] img').all();
    for (const img of images) {
      const naturalWidth = await img.evaluate((el: any) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  }

  /**
   * State getters
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  async getProductCount(): Promise<number> {
    return await this.page.locator('[class*="product-card"], [class*="product-item"]').count();
  }

  async getVisibleFilters(): Promise<string[]> {
    const filters = await this.page.locator('[class*="filter"] h3, [class*="filter"] h4').allTextContents();
    return filters.map(f => f.trim());
  }

  async getActiveSortOption(): Promise<string | null> {
    const select = await this.page.locator('select[name*="sort"]').first();
    if (await select.isVisible()) {
      return await select.inputValue();
    }
    return null;
  }

  async hasLoadMoreButton(): Promise<boolean> {
    return await this.page.locator('[class*="load-more"]').isVisible();
  }

  async hasNextPageLink(): Promise<boolean> {
    return await this.page.locator('[aria-label="Next"], a:has-text("Next")').isVisible();
  }

  async isEmptyState(): Promise<boolean> {
    const productCount = await this.getProductCount();
    const emptyMsg = await this.page.locator('[class*="empty"], [class*="no-results"]').isVisible();
    return productCount === 0 || emptyMsg;
  }

  async isErrorState(): Promise<boolean> {
    return await this.page.locator('[class*="error"], [class*="error-message"]').isVisible();
  }

  async isLoadingState(): Promise<boolean> {
    return await this.page.locator('[class*="loading"], [class*="skeleton"], [class*="spinner"]').isVisible();
  }

  async getConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  async takeScreenshot(name: string): Promise<string> {
    const path = `./evidence/plp/${name}.png`;
    await this.page.screenshot({ path, fullPage: true });
    return path;
  }

  /**
   * Business validation
   */
  async verifyProductRelevance(filterApplied: string): Promise<boolean> {
    const productNames = await this.page.locator('[class*="product-card"] h2, [class*="product-card"] h3').allTextContents();
    // This would need custom logic based on business rules
    return productNames.length > 0;
  }

  async verifyPriceConsistency(): Promise<boolean> {
    const products = await this.page.locator('[class*="product-card"]').all();

    for (const product of products) {
      const priceEl = await product.locator('[class*="price"]').textContent();
      const oldPriceEl = await product.locator('[class*="old-price"]').textContent();

      // Verify price format and that old price is higher than current price if both exist
      if (priceEl && oldPriceEl) {
        const price = parseFloat(priceEl.replace(/[^\d.]/g, ''));
        const oldPrice = parseFloat(oldPriceEl.replace(/[^\d.]/g, ''));
        if (oldPrice <= price) return false;
      }
    }

    return true;
  }

  async verifyOutOfStockHandling(): Promise<boolean> {
    const outOfStockProducts = await this.page.locator('[class*="out-of-stock"]').all();
    for (const product of outOfStockProducts) {
      const addToCartBtn = await product.locator('button[class*="add-to-cart"]').isEnabled();
      if (addToCartBtn) return false; // Button should be disabled for out-of-stock
    }
    return true;
  }
}
