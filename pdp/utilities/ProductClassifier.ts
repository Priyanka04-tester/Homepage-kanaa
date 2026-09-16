import { Page } from '@playwright/test';
import { ProductType, PDPDiscoveryResult } from '../types';

/**
 * Product Classifier
 * Determines the product type based on PDP structure and content
 */
export class ProductClassifier {
  constructor(private page: Page) {}

  async classifyProduct(discovery: PDPDiscoveryResult): Promise<ProductType> {
    // Check for out-of-stock first
    if (await this.isOutOfStock()) {
      return 'out-of-stock';
    }

    // Check for low stock
    if (await this.isLowStock()) {
      return 'low-stock';
    }

    // Check for bundle
    if (await this.isBundle()) {
      return 'bundle';
    }

    // Check for grouped product
    if (await this.isGroupedProduct()) {
      return 'grouped';
    }

    // Check for configurable/variant product
    if (await this.isConfigurable()) {
      return 'configurable';
    }

    // Check for simple product with reviews
    if (discovery.hasReviews) {
      return 'with-reviews';
    }

    // Check for simple product with FBT
    if (discovery.hasFBT) {
      return 'with-fbt';
    }

    // Default to simple product
    return 'simple';
  }

  private async isOutOfStock(): Promise<boolean> {
    const stockText = await this.page.locator('[data-testid*="stock" i], .stock, .availability').first().textContent();
    if (!stockText) return false;

    const outOfStockPatterns = [/out of stock|out-of-stock|unavailable|غير متاح|نفذت الكمية/i];
    return outOfStockPatterns.some(pattern => pattern.test(stockText));
  }

  private async isLowStock(): Promise<boolean> {
    const stockText = await this.page.locator('[data-testid*="stock" i], .stock, .availability').first().textContent();
    if (!stockText) return false;

    const lowStockPatterns = [/low stock|limited stock|only \d+ left|الكمية محدودة|بقي/i];
    return lowStockPatterns.some(pattern => pattern.test(stockText));
  }

  private async isBundle(): Promise<boolean> {
    // Check for bundle-specific selectors
    const bundleItems = await this.page.locator('[data-testid*="bundle" i], .bundle-item, [data-testid*="component" i]').count();
    const bundleText = await this.page.locator('text=/bundle|bundled|bundle includes|مجموعة/i').count();

    return bundleItems > 0 || bundleText > 0;
  }

  private async isGroupedProduct(): Promise<boolean> {
    // Grouped products typically have multiple related items shown together
    const groupedItems = await this.page.locator('[data-testid*="group" i], .grouped-item, .group-item').count();
    return groupedItems > 0;
  }

  private async isConfigurable(): Promise<boolean> {
    // Check for options/variants
    const optionCount = await this.page.locator('[data-testid*="option" i], .option, .variant, .attribute').count();

    // Check for select elements
    const selectCount = await this.page.locator('select, [role="combobox"], [role="listbox"]').count();

    // Check for variant buttons
    const variantCount = await this.page.locator('[data-testid*="variant" i], .variant-button, button[data-variant]').count();

    // Check for attribute-specific text patterns
    const hasColorOption = await this.page.locator('text=/color|colours|الوان/i').count() > 0;
    const hasSizeOption = await this.page.locator('text=/size|sizes|حجم/i').count() > 0;
    const hasStorageOption = await this.page.locator('text=/storage|capacity|سعة/i').count() > 0;

    return optionCount > 0 || selectCount > 0 || variantCount > 0 || hasColorOption || hasSizeOption || hasStorageOption;
  }

  async detectProductAttributes(): Promise<Map<string, string[]>> {
    const attributes = new Map<string, string[]>();

    // Common attribute patterns
    const colorOptions = await this.extractColorOptions();
    if (colorOptions.length > 0) {
      attributes.set('Color', colorOptions);
    }

    const sizeOptions = await this.extractSizeOptions();
    if (sizeOptions.length > 0) {
      attributes.set('Size', sizeOptions);
    }

    const storageOptions = await this.extractStorageOptions();
    if (storageOptions.length > 0) {
      attributes.set('Storage', storageOptions);
    }

    const ramOptions = await this.extractRAMOptions();
    if (ramOptions.length > 0) {
      attributes.set('RAM', ramOptions);
    }

    return attributes;
  }

  private async extractColorOptions(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const colorElements = Array.from(document.querySelectorAll('text=/color|colours|الوان/i, [data-testid*="color" i]'))
        .flatMap(el => {
          const buttons = el.querySelectorAll('button, label, input');
          return Array.from(buttons)
            .map(b => b.textContent?.trim() || '')
            .filter(t => t.length > 0 && t.length < 30);
        });
      return [...new Set(colorElements)];
    });
  }

  private async extractSizeOptions(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const sizeElements = Array.from(document.querySelectorAll('text=/size|sizes|حجم/i, [data-testid*="size" i]'))
        .flatMap(el => {
          const buttons = el.querySelectorAll('button, label, input');
          return Array.from(buttons)
            .map(b => b.textContent?.trim() || '')
            .filter(t => t.length > 0 && t.length < 30);
        });
      return [...new Set(sizeElements)];
    });
  }

  private async extractStorageOptions(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const storageElements = Array.from(document.querySelectorAll('text=/storage|capacity|سعة/i, [data-testid*="storage" i]'))
        .flatMap(el => {
          const buttons = el.querySelectorAll('button, label, input');
          return Array.from(buttons)
            .map(b => b.textContent?.trim() || '')
            .filter(t => t.length > 0 && t.length < 30);
        });
      return [...new Set(storageElements)];
    });
  }

  private async extractRAMOptions(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const ramElements = Array.from(document.querySelectorAll('text=/ram|memory|ذاكرة/i, [data-testid*="ram" i]'))
        .flatMap(el => {
          const buttons = el.querySelectorAll('button, label, input');
          return Array.from(buttons)
            .map(b => b.textContent?.trim() || '')
            .filter(t => t.length > 0 && t.length < 30);
        });
      return [...new Set(ramElements)];
    });
  }

  async hasPaymentOptions(): Promise<{
    tabby: boolean;
    tamara: boolean;
    emkan: boolean;
  }> {
    return {
      tabby: await this.page.locator('img[alt*="tabby" i], text=/tabby/i, [data-testid*="tabby" i]').first().isVisible().catch(() => false),
      tamara: await this.page.locator('img[alt*="tamara" i], text=/tamara/i, [data-testid*="tamara" i]').first().isVisible().catch(() => false),
      emkan: await this.page.locator('img[alt*="emkan" i], text=/emkan/i, [data-testid*="emkan" i]').first().isVisible().catch(() => false),
    };
  }

  async hasDeliveryInfo(): Promise<boolean> {
    return await this.page.locator('[data-testid*="delivery" i], .delivery, .shipping').first().isVisible().catch(() => false);
  }

  async hasReturnInfo(): Promise<boolean> {
    return await this.page.locator('[data-testid*="return" i], .return, .policy').first().isVisible().catch(() => false);
  }

  async canAddMultipleQuantities(): Promise<boolean> {
    const quantityInput = this.page.locator('input[type="number"], [data-testid*="quantity" i]').first();
    return await quantityInput.isVisible().catch(() => false);
  }

  async getMinimumQuantity(): Promise<number> {
    const quantityInput = this.page.locator('input[type="number"], [data-testid*="quantity" i]').first();
    const minAttr = await quantityInput.getAttribute('min');
    return minAttr ? parseInt(minAttr) : 1;
  }

  async getMaximumQuantity(): Promise<number> {
    const quantityInput = this.page.locator('input[type="number"], [data-testid*="quantity" i]').first();
    const maxAttr = await quantityInput.getAttribute('max');
    return maxAttr ? parseInt(maxAttr) : 999;
  }

  async hasVideoContent(): Promise<boolean> {
    return await this.page.locator('video, iframe[title*="video" i]').first().isVisible().catch(() => false);
  }

  async hasZoomFeature(): Promise<boolean> {
    return await this.page.locator('[data-testid*="zoom" i], button[aria-label*="zoom" i]').first().isVisible().catch(() => false);
  }

  async hasImageGallery(): Promise<boolean> {
    const thumbCount = await this.page.locator('[data-testid*="thumbnail" i], .thumbnail, .image-thumb').count();
    return thumbCount > 1;
  }
}
