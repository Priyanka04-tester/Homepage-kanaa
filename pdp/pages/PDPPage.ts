import { Page, Locator } from '@playwright/test';

/**
 * Dynamic PDP Page Object
 * Discovers and interacts with PDP elements without hardcoded selectors
 */
export class PDPPage {
  readonly page: Page;
  readonly baseUrl: string;

  constructor(page: Page, baseUrl?: string) {
    this.page = page;
    this.baseUrl = baseUrl || 'https://thekanaa.com';
  }

  // Navigation
  async goto(pdpUrl: string): Promise<void> {
    await this.page.goto(pdpUrl, { waitUntil: 'networkidle' });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  // Header Elements - Using resilient selectors
  getHeader(): Locator {
    return this.page.locator('header, [role="banner"], .header, .navbar');
  }

  getLogo(): Locator {
    return this.getHeader().locator('img[alt*="logo" i], a[href="/"], [aria-label*="logo" i]').first();
  }

  getSearchInput(): Locator {
    return this.page.getByPlaceholder(/search|بحث/i).first();
  }

  getSearchButton(): Locator {
    return this.page.locator('button:has-text("Search"), button[aria-label*="search" i], [role="button"]:has-text("بحث")').first();
  }

  getSignInButton(): Locator {
    return this.page.getByRole('link', { name: /sign in|login|تسجيل دخول/i }).first();
  }

  getCartButton(): Locator {
    return this.page.getByRole('button', { name: /cart|shopping|سلة/i }).first();
  }

  getWishlistButton(): Locator {
    return this.page.getByRole('button', { name: /wishlist|favorite|قائمتي/i }).first();
  }

  getLanguageSelector(): Locator {
    return this.page.getByRole('button', { name: /en|ar|عربي|english/i }).first();
  }

  // Breadcrumb
  getBreadcrumb(): Locator {
    return this.page.locator('[role="navigation"] nav, .breadcrumb, [aria-label*="breadcrumb" i]');
  }

  // Product Main Section
  getProductName(): Locator {
    return this.page.locator('h1, [data-testid*="product-name" i], .product-name, .title').first();
  }

  getBrand(): Locator {
    return this.page.locator('[data-testid*="brand" i], .brand, .manufacturer, span:has-text(/brand:/i)').first();
  }

  getSKU(): Locator {
    return this.page.locator('[data-testid*="sku" i], .sku, span:has-text(/sku:|مرجع:/i)').first();
  }

  // Price Section
  getPrice(): Locator {
    return this.page.locator('[data-testid*="price" i], .price, .current-price, [aria-label*="price" i]').first();
  }

  getOriginalPrice(): Locator {
    return this.page.locator('.original-price, .old-price, [data-testid*="original" i], s, del').first();
  }

  getDiscount(): Locator {
    return this.page.locator('[data-testid*="discount" i], .discount, .sale, .savings, [aria-label*="discount" i]').first();
  }

  getStockStatus(): Locator {
    return this.page.locator('[data-testid*="stock" i], .stock, .availability, [aria-label*="stock" i]').first();
  }

  // Images
  getProductImage(): Locator {
    return this.page.locator('img[alt*="product" i], .product-image, [role="img"]').first();
  }

  getImageGallery(): Locator {
    return this.page.locator('[data-testid*="gallery" i], .gallery, .images-container, [aria-label*="gallery" i]').first();
  }

  getImageThumbnails(): Locator {
    return this.page.locator('[data-testid*="thumbnail" i], .thumbnail, .image-thumb, .product-images img');
  }

  getImageZoomButton(): Locator {
    return this.page.locator('[data-testid*="zoom" i], button[aria-label*="zoom" i], .zoom-button').first();
  }

  // Video
  getProductVideo(): Locator {
    return this.page.locator('video, iframe[title*="video" i], [data-testid*="video" i]').first();
  }

  // Quantity and Add to Cart
  getQuantityInput(): Locator {
    return this.page.locator('input[type="number"], input[aria-label*="quantity" i], [data-testid*="quantity" i]').first();
  }

  getQuantityDecrease(): Locator {
    return this.page.locator('button[aria-label*="decrease" i], button:has-text("-"), [data-testid*="quantity-decrease" i]').first();
  }

  getQuantityIncrease(): Locator {
    return this.page.locator('button[aria-label*="increase" i], button:has-text("+"), [data-testid*="quantity-increase" i]').first();
  }

  getAddToCartButton(): Locator {
    return this.page.getByRole('button', { name: /add to cart|اضف الى السلة/i }).first();
  }

  // Wishlist and Share
  getAddToWishlistButton(): Locator {
    return this.page.getByRole('button', { name: /wishlist|favorite|قائمتي/i }).first();
  }

  getShareButton(): Locator {
    return this.page.getByRole('button', { name: /share|مشاركة/i }).first();
  }

  // Options/Variants
  getOptions(): Locator {
    return this.page.locator('[data-testid*="option" i], .option, .variant, .attribute').filter({ hasNot: this.page.locator('[aria-hidden="true"]') });
  }

  getSelectableOptions(optionName: string): Locator {
    return this.page.locator(`[data-testid*="option" i]:has-text("${optionName}"), .option:has-text("${optionName}"), [aria-label*="${optionName}" i]`);
  }

  getOptionValues(optionName: string): Locator {
    return this.getSelectableOptions(optionName).locator('button, input, [role="option"], label');
  }

  // Bundle Products
  getBundleItems(): Locator {
    return this.page.locator('[data-testid*="bundle" i], .bundle-item, [data-testid*="component" i]');
  }

  getBundleItemCheckbox(itemName: string): Locator {
    return this.page.locator(`input[type="checkbox"], [role="checkbox"]`).filter({ hasText: itemName }).first();
  }

  getBundleItemQuantity(itemName: string): Locator {
    return this.page.locator(`input[type="number"], [data-testid*="quantity" i]`).filter({ hasText: itemName }).first();
  }

  // Tabby / Tamara / EMKAN Payment
  getTabbyOption(): Locator {
    return this.page.locator('text=Tabby, [data-testid*="tabby" i], .tabby, img[alt*="tabby" i]').first();
  }

  getTamaraOption(): Locator {
    return this.page.locator('text=Tamara, [data-testid*="tamara" i], .tamara, img[alt*="tamara" i]').first();
  }

  getEMKANOption(): Locator {
    return this.page.locator('text=EMKAN, [data-testid*="emkan" i], .emkan, img[alt*="emkan" i]').first();
  }

  // Delivery Information
  getDeliverySection(): Locator {
    return this.page.locator('[data-testid*="delivery" i], .delivery, .shipping, [aria-label*="delivery" i]').first();
  }

  getDeliveryInfo(): Locator {
    return this.getDeliverySection().locator('span, p, div').filter({ hasNot: this.page.locator('[aria-hidden="true"]') });
  }

  // Return Information
  getReturnSection(): Locator {
    return this.page.locator('[data-testid*="return" i], .return, .policy, [aria-label*="return" i]').first();
  }

  getReturnInfo(): Locator {
    return this.getReturnSection().locator('span, p, div').filter({ hasNot: this.page.locator('[aria-hidden="true"]') });
  }

  // Description and Specifications
  getDescription(): Locator {
    return this.page.locator('[data-testid*="description" i], .description, [role="tabpanel"] >> text=/description|details/i').first();
  }

  getSpecifications(): Locator {
    return this.page.locator('[data-testid*="specifications" i], .specifications, .specs, [role="tabpanel"] >> text=/spec/i').first();
  }

  getHighlights(): Locator {
    return this.page.locator('[data-testid*="highlight" i], .highlights, ul:has(li)').first();
  }

  // Reviews Section
  getReviewsSection(): Locator {
    return this.page.locator('[data-testid*="review" i], .reviews, [aria-label*="review" i]').first();
  }

  getReviewRating(): Locator {
    return this.page.locator('[data-testid*="rating" i], .rating, .stars').first();
  }

  getReviewCount(): Locator {
    return this.page.locator('[data-testid*="review-count" i], span:has-text(/reviews/)').first();
  }

  getReviewForm(): Locator {
    return this.page.locator('[data-testid*="review-form" i], form').first();
  }

  getReviewSubmitButton(): Locator {
    return this.page.getByRole('button', { name: /submit|post|send|ارسال/i });
  }

  // Frequently Bought Together
  getFBTSection(): Locator {
    return this.page.locator('[data-testid*="frequently" i], [data-testid*="bought" i], .fbt, .frequently-bought-together').first();
  }

  getFBTItems(): Locator {
    return this.getFBTSection().locator('[data-testid*="item" i], .fbt-item, [role="option"]');
  }

  getFBTAddAllButton(): Locator {
    return this.getFBTSection().getByRole('button', { name: /add all|select all/i }).first();
  }

  // Related Products
  getRelatedProductsSection(): Locator {
    return this.page.locator('[data-testid*="related" i], .related-products, [aria-label*="related" i]').first();
  }

  getRelatedProducts(): Locator {
    return this.getRelatedProductsSection().locator('[data-testid*="product" i], .product-card');
  }

  // Recommendations
  getRecommendationsSection(): Locator {
    return this.page.locator('[data-testid*="recommend" i], .recommendations, [aria-label*="you might" i]').first();
  }

  // Tabs/Accordions
  getTabs(): Locator {
    return this.page.locator('[role="tab"], .tab, .nav-tabs li').filter({ hasNot: this.page.locator('[aria-hidden="true"]') });
  }

  getTabContent(tabName: string): Locator {
    return this.page.locator(`[role="tabpanel"]:has-text("${tabName}"), div:has-text("${tabName}")`);
  }

  getAccordions(): Locator {
    return this.page.locator('[role="button"][aria-expanded], .accordion, details').filter({ hasNot: this.page.locator('[aria-hidden="true"]') });
  }

  getAccordionContent(title: string): Locator {
    return this.page.locator(`[role="region"], div`).filter({ hasText: title });
  }

  // Banners
  getBanners(): Locator {
    return this.page.locator('[data-testid*="banner" i], .banner, [role="img"]:has-text("")').filter({ hasNot: this.page.locator('[aria-hidden="true"]') });
  }

  // Utility Methods
  async waitForElement(locator: Locator, timeout = 10000): Promise<boolean> {
    try {
      await locator.waitFor({ timeout, state: 'visible' });
      return true;
    } catch {
      return false;
    }
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible().catch(() => false);
  }

  async isElementClickable(locator: Locator): Promise<boolean> {
    return await locator.isEnabled().catch(() => false);
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getPageUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageText(): Promise<string> {
    return await this.page.textContent('body') || '';
  }

  async getAllInteractiveElements(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, input, select, [role="button"], [role="link"], [role="option"]');
      return Array.from(elements)
        .filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        })
        .map(el => el.getAttribute('aria-label') || el.textContent || el.id || 'unknown')
        .filter(text => text.trim().length > 0);
    });
  }

  async getConsoleMessages(): Promise<Array<{ type: string; message: string }>> {
    const messages: Array<{ type: string; message: string }> = [];
    this.page.on('console', msg => {
      messages.push({ type: msg.type(), message: msg.text() });
    });
    return messages;
  }

  async waitForNavigation(action: () => Promise<void>): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
      action(),
    ]);
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async takeScreenshot(filename: string): Promise<Buffer | undefined> {
    return await this.page.screenshot({ path: filename });
  }

  async getPageMetrics(): Promise<any> {
    return await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domReady: perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart,
        pageLoad: perfData?.loadEventEnd - perfData?.loadEventStart,
        totalTime: perfData?.loadEventEnd - perfData?.fetchStart,
      };
    }).catch(() => null);
  }
}
