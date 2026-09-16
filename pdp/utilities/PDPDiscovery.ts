import { Page } from '@playwright/test';
import { PDPDiscoveryResult, PDPSection, PDPElement, ProductAttribute } from '../types';

/**
 * PDP Discovery Module
 * Dynamically discovers all sections, elements, and features on a PDP
 */
export class PDPDiscovery {
  constructor(private page: Page) {}

  async discoverPDP(): Promise<PDPDiscoveryResult> {
    const url = this.page.url();
    const productName = await this.extractProductName();
    const productSku = await this.extractSKU();
    const brand = await this.extractBrand();
    const price = await this.extractPrice();
    const sections = await this.discoverSections();
    const attributes = await this.discoverAttributes();
    const hasReviews = await this.hasReviewsSection();
    const hasFBT = await this.hasFBTSection();
    const hasBundle = await this.hasBundleItems();

    return {
      url,
      productType: 'unknown', // Will be determined by ProductClassifier
      productName: productName || 'Unknown Product',
      productSku,
      brand,
      price,
      sections,
      attributes,
      hasReviews,
      hasFBT,
      hasBundle,
      discoveredAt: new Date().toISOString(),
      totalElements: sections.reduce((sum, s) => sum + s.elements.length, 0),
    };
  }

  private async discoverSections(): Promise<PDPSection[]> {
    const sections: PDPSection[] = [];

    // Header Section
    const headerExists = await this.page.locator('header, [role="banner"]').first().isVisible().catch(() => false);
    if (headerExists) {
      sections.push(await this.discoverHeaderSection());
    }

    // Main Product Section
    sections.push(await this.discoverProductMainSection());

    // Breadcrumb Section
    const breadcrumbExists = await this.page.locator('[role="navigation"]').first().isVisible().catch(() => false);
    if (breadcrumbExists) {
      sections.push(await this.discoverBreadcrumbSection());
    }

    // Description Section
    const descExists = await this.page.locator('[data-testid*="description" i], .description').first().isVisible().catch(() => false);
    if (descExists) {
      sections.push(await this.discoverDescriptionSection());
    }

    // Specifications Section
    const specExists = await this.page.locator('[data-testid*="specifications" i], .specifications').first().isVisible().catch(() => false);
    if (specExists) {
      sections.push(await this.discoverSpecificationsSection());
    }

    // Reviews Section
    const reviewsExists = await this.page.locator('[data-testid*="review" i], .reviews').first().isVisible().catch(() => false);
    if (reviewsExists) {
      sections.push(await this.discoverReviewsSection());
    }

    // FBT Section
    const fbtExists = await this.page.locator('[data-testid*="frequently" i], .frequently-bought-together').first().isVisible().catch(() => false);
    if (fbtExists) {
      sections.push(await this.discoverFBTSection());
    }

    // Related Products Section
    const relatedExists = await this.page.locator('[data-testid*="related" i], .related-products').first().isVisible().catch(() => false);
    if (relatedExists) {
      sections.push(await this.discoverRelatedProductsSection());
    }

    // Recommendations Section
    const recomExists = await this.page.locator('[data-testid*="recommend" i], .recommendations').first().isVisible().catch(() => false);
    if (recomExists) {
      sections.push(await this.discoverRecommendationsSection());
    }

    // Footer Section
    const footerExists = await this.page.locator('footer, [role="contentinfo"]').first().isVisible().catch(() => false);
    if (footerExists) {
      sections.push(await this.discoverFooterSection());
    }

    return sections;
  }

  private async discoverHeaderSection(): Promise<PDPSection> {
    const elements: PDPElement[] = [];
    const headerLoc = this.page.locator('header, [role="banner"]').first();

    // Logo
    elements.push({
      id: 'HEADER-LOGO',
      type: 'image',
      name: 'Logo',
      testable: true,
      interactive: true,
      visible: await headerLoc.locator('img').first().isVisible().catch(() => false),
    });

    // Search
    const searchInput = headerLoc.locator('input[type="text"], [aria-label*="search" i]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      elements.push({
        id: 'HEADER-SEARCH',
        type: 'input',
        name: 'Search Input',
        testable: true,
        interactive: true,
        visible: true,
      });
    }

    // Sign In
    const signIn = headerLoc.locator('a, button').filter({ hasText: /sign in|login|تسجيل/i }).first();
    if (await signIn.isVisible().catch(() => false)) {
      elements.push({
        id: 'HEADER-SIGNIN',
        type: 'button',
        name: 'Sign In',
        testable: true,
        interactive: true,
        visible: true,
      });
    }

    // Cart
    const cart = headerLoc.locator('a, button').filter({ hasText: /cart|shopping|سلة/i }).first();
    if (await cart.isVisible().catch(() => false)) {
      elements.push({
        id: 'HEADER-CART',
        type: 'button',
        name: 'Cart',
        testable: true,
        interactive: true,
        visible: true,
      });
    }

    // Language Selector
    const lang = headerLoc.locator('button, a').filter({ hasText: /en|ar|عربي|english/i }).first();
    if (await lang.isVisible().catch(() => false)) {
      elements.push({
        id: 'HEADER-LANGUAGE',
        type: 'button',
        name: 'Language Selector',
        testable: true,
        interactive: true,
        visible: true,
      });
    }

    return {
      id: 'SECTION-HEADER',
      name: 'Header',
      type: 'header',
      visible: true,
      elements,
    };
  }

  private async discoverProductMainSection(): Promise<PDPSection> {
    const elements: PDPElement[] = [];

    // Product Name
    const name = this.page.locator('h1, [data-testid*="product-name" i]').first();
    if (await name.isVisible().catch(() => false)) {
      elements.push({
        id: 'PRODUCT-NAME',
        type: 'text',
        name: 'Product Name',
        testable: true,
        interactive: false,
        visible: true,
        text: await name.textContent() || '',
      });
    }

    // Brand
    const brand = this.page.locator('[data-testid*="brand" i], .brand, span:has-text(/brand:/i)').first();
    if (await brand.isVisible().catch(() => false)) {
      elements.push({
        id: 'PRODUCT-BRAND',
        type: 'text',
        name: 'Brand',
        testable: true,
        interactive: false,
        visible: true,
      });
    }

    // SKU
    const sku = this.page.locator('[data-testid*="sku" i], .sku, span:has-text(/sku:/i)').first();
    if (await sku.isVisible().catch(() => false)) {
      elements.push({
        id: 'PRODUCT-SKU',
        type: 'text',
        name: 'SKU',
        testable: true,
        interactive: false,
        visible: true,
      });
    }

    // Product Images
    const images = this.page.locator('img[alt*="product" i], .product-image').first();
    if (await images.isVisible().catch(() => false)) {
      elements.push({
        id: 'PRODUCT-IMAGES',
        type: 'image',
        name: 'Product Image Gallery',
        testable: true,
        interactive: true,
        visible: true,
      });
    }

    // Price
    const price = this.page.locator('[data-testid*="price" i], .price, .current-price').first();
    if (await price.isVisible().catch(() => false)) {
      elements.push({
        id: 'PRODUCT-PRICE',
        type: 'text',
        name: 'Price',
        testable: true,
        interactive: false,
        visible: true,
      });
    }

    // Stock Status
    const stock = this.page.locator('[data-testid*="stock" i], .stock, .availability').first();
    if (await stock.isVisible().catch(() => false)) {
      elements.push({
        id: 'PRODUCT-STOCK',
        type: 'text',
        name: 'Stock Status',
        testable: true,
        interactive: false,
        visible: true,
      });
    }

    // Add to Cart
    const addCart = this.page.getByRole('button', { name: /add to cart|اضف الى السلة/i }).first();
    if (await addCart.isVisible().catch(() => false)) {
      elements.push({
        id: 'PRODUCT-ADD-TO-CART',
        type: 'button',
        name: 'Add to Cart',
        testable: true,
        interactive: true,
        visible: true,
      });
    }

    // Wishlist
    const wishlist = this.page.getByRole('button', { name: /wishlist|favorite|قائمتي/i }).first();
    if (await wishlist.isVisible().catch(() => false)) {
      elements.push({
        id: 'PRODUCT-WISHLIST',
        type: 'button',
        name: 'Add to Wishlist',
        testable: true,
        interactive: true,
        visible: true,
      });
    }

    // Share
    const share = this.page.getByRole('button', { name: /share|مشاركة/i }).first();
    if (await share.isVisible().catch(() => false)) {
      elements.push({
        id: 'PRODUCT-SHARE',
        type: 'button',
        name: 'Share',
        testable: true,
        interactive: true,
        visible: true,
      });
    }

    return {
      id: 'SECTION-PRODUCT-MAIN',
      name: 'Product Main',
      type: 'main-product',
      visible: true,
      elements,
    };
  }

  private async discoverBreadcrumbSection(): Promise<PDPSection> {
    return {
      id: 'SECTION-BREADCRUMB',
      name: 'Breadcrumb Navigation',
      type: 'breadcrumb',
      visible: true,
      elements: [{
        id: 'BREADCRUMB',
        type: 'link',
        name: 'Breadcrumb Navigation',
        testable: true,
        interactive: true,
        visible: true,
      }],
    };
  }

  private async discoverDescriptionSection(): Promise<PDPSection> {
    return {
      id: 'SECTION-DESCRIPTION',
      name: 'Description',
      type: 'description',
      visible: true,
      elements: [{
        id: 'DESCRIPTION-TEXT',
        type: 'text',
        name: 'Product Description',
        testable: true,
        interactive: false,
        visible: true,
      }],
    };
  }

  private async discoverSpecificationsSection(): Promise<PDPSection> {
    return {
      id: 'SECTION-SPECIFICATIONS',
      name: 'Specifications',
      type: 'specifications',
      visible: true,
      elements: [{
        id: 'SPECS-TABLE',
        type: 'text',
        name: 'Specifications Table',
        testable: true,
        interactive: false,
        visible: true,
      }],
    };
  }

  private async discoverReviewsSection(): Promise<PDPSection> {
    const elements: PDPElement[] = [];

    elements.push({
      id: 'REVIEWS-RATING',
      type: 'text',
      name: 'Average Rating',
      testable: true,
      interactive: false,
      visible: true,
    });

    const reviewForm = this.page.locator('[data-testid*="review-form" i], form').first();
    if (await reviewForm.isVisible().catch(() => false)) {
      elements.push({
        id: 'REVIEWS-FORM',
        type: 'input',
        name: 'Review Form',
        testable: true,
        interactive: true,
        visible: true,
      });
    }

    return {
      id: 'SECTION-REVIEWS',
      name: 'Customer Reviews',
      type: 'reviews',
      visible: true,
      elements,
    };
  }

  private async discoverFBTSection(): Promise<PDPSection> {
    return {
      id: 'SECTION-FBT',
      name: 'Frequently Bought Together',
      type: 'fbt',
      visible: true,
      elements: [{
        id: 'FBT-ITEMS',
        type: 'button',
        name: 'FBT Products',
        testable: true,
        interactive: true,
        visible: true,
      }],
    };
  }

  private async discoverRelatedProductsSection(): Promise<PDPSection> {
    return {
      id: 'SECTION-RELATED',
      name: 'Related Products',
      type: 'related-products',
      visible: true,
      elements: [{
        id: 'RELATED-PRODUCTS',
        type: 'button',
        name: 'Related Product Cards',
        testable: true,
        interactive: true,
        visible: true,
      }],
    };
  }

  private async discoverRecommendationsSection(): Promise<PDPSection> {
    return {
      id: 'SECTION-RECOMMENDATIONS',
      name: 'Recommended For You',
      type: 'recommendations',
      visible: true,
      elements: [{
        id: 'RECOMMENDATIONS-PRODUCTS',
        type: 'button',
        name: 'Recommendation Cards',
        testable: true,
        interactive: true,
        visible: true,
      }],
    };
  }

  private async discoverFooterSection(): Promise<PDPSection> {
    return {
      id: 'SECTION-FOOTER',
      name: 'Footer',
      type: 'footer',
      visible: true,
      elements: [{
        id: 'FOOTER-LINKS',
        type: 'link',
        name: 'Footer Links',
        testable: true,
        interactive: true,
        visible: true,
      }],
    };
  }

  private async discoverAttributes(): Promise<ProductAttribute[]> {
    const attributes: ProductAttribute[] = [];
    const optionLabels = await this.page.evaluate(() => {
      const labels = document.querySelectorAll('[data-testid*="option" i], .option-label, label');
      return Array.from(labels)
        .map(l => l.textContent?.trim() || '')
        .filter(t => t.length > 0 && t.length < 100);
    });

    for (const label of [...new Set(optionLabels)].slice(0, 10)) {
      const options = await this.page.evaluate((labelText) => {
        const optElements = document.querySelectorAll(`[data-testid*="option" i], .option`);
        return Array.from(optElements)
          .filter(e => e.textContent?.includes(labelText))
          .flatMap(e => {
            const buttons = e.querySelectorAll('button, label, input');
            return Array.from(buttons)
              .map(b => b.textContent?.trim() || '')
              .filter(t => t.length > 0 && t.length < 50);
          });
      }, label);

      if (options.length > 0) {
        attributes.push({
          name: label,
          type: 'variant',
          options: options.map(opt => ({
            label: opt,
            value: opt.toLowerCase().replace(/\s+/g, '-'),
            available: true,
            affectsPrice: true,
            affectsImage: true,
            affectsStock: true,
          })),
          required: true,
        });
      }
    }

    return attributes;
  }

  private async extractProductName(): Promise<string | null> {
    const name = await this.page.locator('h1, [data-testid*="product-name" i]').first().textContent();
    return name?.trim() || null;
  }

  private async extractSKU(): Promise<string | undefined> {
    const sku = await this.page.locator('[data-testid*="sku" i], .sku, span:has-text(/sku:/i)').first().textContent();
    return sku?.split(':').pop()?.trim();
  }

  private async extractBrand(): Promise<string | undefined> {
    const brand = await this.page.locator('[data-testid*="brand" i], .brand, span:has-text(/brand:/i)').first().textContent();
    return brand?.split(':').pop()?.trim();
  }

  private async extractPrice(): Promise<any> {
    const price = await this.page.locator('[data-testid*="price" i], .price, .current-price').first().textContent();
    return price ? { sellingPrice: parseFloat(price.replace(/[^\d.]/g, '')), currency: 'SAR' } : undefined;
  }

  private async hasReviewsSection(): Promise<boolean> {
    return await this.page.locator('[data-testid*="review" i], .reviews').first().isVisible().catch(() => false);
  }

  private async hasFBTSection(): Promise<boolean> {
    return await this.page.locator('[data-testid*="frequently" i], .frequently-bought-together').first().isVisible().catch(() => false);
  }

  private async hasBundleItems(): Promise<boolean> {
    return await this.page.locator('[data-testid*="bundle" i], .bundle-item').first().isVisible().catch(() => false);
  }
}
