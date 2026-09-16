/**
 * Page Object Model for Thekanaa Homepage
 * Encapsulates all homepage selectors and interactions
 */

import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // Header Elements
  readonly header: Locator;
  readonly logo: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly loginButton: Locator;
  readonly cartButton: Locator;
  readonly wishlistButton: Locator;
  readonly accountButton: Locator;
  readonly menuButton: Locator;
  readonly navigationMenu: Locator;

  // Hero Section
  readonly heroSection: Locator;
  readonly heroBanner: Locator;
  readonly heroText: Locator;
  readonly heroCTA: Locator;
  readonly heroCarouselNext: Locator;
  readonly heroCarouselPrev: Locator;
  readonly heroCarouselDots: Locator;

  // Product Sections
  readonly productSections: Locator;
  readonly productCards: Locator;
  readonly addToCartButtons: Locator;
  readonly wishlistIcons: Locator;
  readonly productPrices: Locator;
  readonly productRatings: Locator;

  // Category Section
  readonly categorySection: Locator;
  readonly categoryCards: Locator;
  readonly categoryLinks: Locator;

  // Sliders/Carousels
  readonly sliders: Locator;
  readonly carousels: Locator;

  // Footer
  readonly footer: Locator;
  readonly footerLinks: Locator;
  readonly socialLinks: Locator;
  readonly contactInfo: Locator;

  // General
  readonly allLinks: Locator;
  readonly allButtons: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.header = page.locator('header');
    this.logo = page.locator('a[aria-label*="logo"], a[href="/"]').first();
    this.searchBox = page.locator('input[placeholder*="search"], input[type="search"]');
    this.searchButton = page.locator('button[aria-label*="search"]');
    this.loginButton = page.locator('button:has-text("Login"), a:has-text("Login")');
    this.cartButton = page.locator('[aria-label*="cart"], button:has-text("Cart")');
    this.wishlistButton = page.locator('[aria-label*="wishlist"], button:has-text("Wishlist")');
    this.accountButton = page.locator('[aria-label*="account"], button:has-text("Account")');
    this.menuButton = page.locator('button[aria-label*="menu"]');
    this.navigationMenu = page.locator('nav');

    // Hero
    this.heroSection = page.locator('[class*="hero"], [class*="banner"]').first();
    this.heroBanner = page.locator('[class*="hero-image"], [class*="banner-image"]');
    this.heroText = page.locator('[class*="hero-text"], [class*="banner-text"]');
    this.heroCTA = page.locator('[class*="hero"] button, [class*="banner"] button').first();
    this.heroCarouselNext = page.locator('[class*="hero"] button:has-text("Next"), [class*="carousel-next"]');
    this.heroCarouselPrev = page.locator('[class*="hero"] button:has-text("Prev"), [class*="carousel-prev"]');
    this.heroCarouselDots = page.locator('[class*="carousel-dot"], [role="tab"]');

    // Products
    this.productSections = page.locator('[class*="product-section"], section:has([class*="product"])');
    this.productCards = page.locator('[class*="product-card"], [data-product], article:has([class*="product"])');
    this.addToCartButtons = page.locator('button:has-text("Add to Cart"), button:has-text("Add")');
    this.wishlistIcons = page.locator('button[aria-label*="wishlist"], [class*="wishlist-icon"]');
    this.productPrices = page.locator('[class*="price"]');
    this.productRatings = page.locator('[class*="rating"], [aria-label*="star"]');

    // Categories
    this.categorySection = page.locator('[class*="category"], [class*="categories"]').first();
    this.categoryCards = page.locator('[class*="category-card"], [class*="category-item"]');
    this.categoryLinks = page.locator('[class*="category"] a, [class*="categories"] a');

    // Sliders
    this.sliders = page.locator('[class*="slider"], [class*="carousel"]');
    this.carousels = page.locator('[role="region"][aria-label*="carousel"], [class*="carousel"]');

    // Footer
    this.footer = page.locator('footer');
    this.footerLinks = page.locator('footer a');
    this.socialLinks = page.locator('[class*="social"] a, a[href*="facebook"], a[href*="twitter"], a[href*="instagram"]');
    this.contactInfo = page.locator('[class*="contact"], [class*="phone"]');

    // General
    this.allLinks = page.locator('a[href]');
    this.allButtons = page.locator('button');
  }

  // Navigation Methods
  async navigateTo() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToUrl(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  // Header Interactions
  async clickLogo() {
    await this.logo.click();
  }

  async search(query: string) {
    await this.searchBox.fill(query);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async clickCart() {
    await this.cartButton.click();
  }

  async clickAccount() {
    await this.accountButton.click();
  }

  // Product Interactions
  async getProductCount() {
    return await this.productCards.count();
  }

  async addProductToCart(index: number = 0) {
    const buttons = await this.addToCartButtons.all();
    if (buttons.length > index) {
      await buttons[index].click();
    }
  }

  async toggleWishlist(index: number = 0) {
    const icons = await this.wishlistIcons.all();
    if (icons.length > index) {
      await icons[index].click();
    }
  }

  // Carousel Interactions
  async nextSlide() {
    const nextButtons = await this.heroCarouselNext.all();
    if (nextButtons.length > 0) {
      await nextButtons[0].click();
    }
  }

  async previousSlide() {
    const prevButtons = await this.heroCarouselPrev.all();
    if (prevButtons.length > 0) {
      await prevButtons[0].click();
    }
  }

  // Verification Methods
  async isHeaderVisible(): Promise<boolean> {
    return await this.header.isVisible();
  }

  async isFooterVisible(): Promise<boolean> {
    return await this.footer.isVisible();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getPageUrl(): Promise<string> {
    return this.page.url();
  }

  // Scroll Methods
  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async scrollToBottom() {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
  }

  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  // Wait Methods
  async waitForElement(locator: Locator, timeout: number = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  // Screenshot Methods
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `evidence/homepage/${name}.png`, fullPage: true });
  }

  // Accessibility Methods
  async getAllImages(): Promise<number> {
    return await this.page.locator('img').count();
  }

  async getBrokenImages(): Promise<string[]> {
    const broken: string[] = [];
    const images = await this.page.locator('img').all();
    for (const img of images) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      if (!src || src.trim() === '') {
        broken.push(`Image without src: ${alt || 'no alt'}`);
      }
    }
    return broken;
  }
}
