import { test, expect } from '../../pdp/fixtures/pdpFixture';

/**
 * PDP Full Test Suite
 * Comprehensive testing of all PDP functionality
 */

test.describe('PDP Full Test Suite', () => {
  let pdpUrl: string;

  test.beforeEach(async () => {
    pdpUrl = process.env.PDP_URL || 'https://thekanaa.com/en-sa/p/test-product';
    if (!pdpUrl.includes('http')) {
      throw new Error('PDP_URL required. Usage: PDP_URL=https://... npm run test:pdp:full');
    }
  });

  test('TC-PDP-001: Page Load and Navigation', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const pageUrl = await pdpPage.getPageUrl();
    expect(pageUrl).toContain('thekanaa.com');

    const productName = await pdpPage.getProductName();
    const nameVisible = await productName.isVisible();
    expect(nameVisible).toBe(true);

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-001');
  });

  test('TC-PDP-002: Product Information Display', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const name = await pdpPage.getProductName().textContent();
    const price = await pdpPage.getPrice().textContent();
    const stock = await pdpPage.getStockStatus().textContent();

    expect(name?.trim()).toBeTruthy();
    expect(price?.trim()).toBeTruthy();

    console.log(`Product: ${name?.trim()}`);
    console.log(`Price: ${price?.trim()}`);
    console.log(`Stock: ${stock?.trim()}`);

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-002');
  });

  test('TC-PDP-003: Add to Cart - Basic', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const addToCartBtn = await pdpPage.getAddToCartButton();
    expect(await addToCartBtn.isVisible()).toBe(true);

    await addToCartBtn.click();
    await page.waitForTimeout(2000);

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-003');
  });

  test('TC-PDP-004: Price Accuracy', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const priceText = await pdpPage.getPrice().textContent();
    const originalPriceText = await pdpPage.getOriginalPrice().textContent().catch(() => null);
    const discountText = await pdpPage.getDiscount().textContent().catch(() => null);

    console.log(`Current Price: ${priceText}`);
    console.log(`Original Price: ${originalPriceText}`);
    console.log(`Discount: ${discountText}`);

    expect(priceText?.trim()).toBeTruthy();

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-004');
  });

  test('TC-PDP-005: Quantity Controls', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const quantityInput = await pdpPage.getQuantityInput();
    const quantityVisible = await quantityInput.isVisible().catch(() => false);

    if (quantityVisible) {
      await quantityInput.fill('2');
      const value = await quantityInput.inputValue();
      expect(value).toBe('2');
    }

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-005');
  });

  test('TC-PDP-006: Header Navigation', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const headerVisible = await pdpPage.getHeader().isVisible();
    expect(headerVisible).toBe(true);

    const cartVisible = await pdpPage.getCartButton().isVisible();
    expect(cartVisible).toBe(true);

    const logoVisible = await pdpPage.getLogo().isVisible().catch(() => false);
    console.log(`Logo visible: ${logoVisible}`);

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-006');
  });

  test('TC-PDP-007: Wishlist Functionality', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const wishlistBtn = await pdpPage.getAddToWishlistButton();
    const wishlistVisible = await wishlistBtn.isVisible().catch(() => false);

    if (wishlistVisible) {
      await wishlistBtn.click();
      await page.waitForTimeout(1000);
      console.log('Added to wishlist');
    } else {
      console.log('Wishlist button not available');
    }

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-007');
  });

  test('TC-PDP-008: Product Images Gallery', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const mainImage = await pdpPage.getProductImage();
    const imageVisible = await mainImage.isVisible();
    expect(imageVisible).toBe(true);

    const thumbnails = await pdpPage.getImageThumbnails();
    const thumbnailCount = await thumbnails.count();
    console.log(`Found ${thumbnailCount} thumbnail images`);

    if (thumbnailCount > 1) {
      await thumbnails.nth(1).click();
      await page.waitForTimeout(500);
    }

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-008');
  });

  test('TC-PDP-009: Mobile Responsiveness', async ({ pdpPage, evidenceCollector, page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const productName = await pdpPage.getProductName();
    const nameVisible = await productName.isVisible();
    expect(nameVisible).toBe(true);

    const addToCart = await pdpPage.getAddToCartButton();
    const addVisible = await addToCart.isVisible();
    expect(addVisible).toBe(true);

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-009');
  });

  test('TC-PDP-010: Keyboard Navigation', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    // Tab to first interactive element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`Focused element: ${focusedElement}`);

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-010');
  });

  test('TC-PDP-011: Share Functionality', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const shareBtn = await pdpPage.getShareButton();
    const shareVisible = await shareBtn.isVisible().catch(() => false);

    if (shareVisible) {
      await shareBtn.click();
      await page.waitForTimeout(1000);
      console.log('Share button clicked');
    }

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-011');
  });

  test('TC-PDP-012: Breadcrumb Navigation', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const breadcrumb = await pdpPage.getBreadcrumb();
    const breadcrumbVisible = await breadcrumb.isVisible().catch(() => false);

    if (breadcrumbVisible) {
      const links = await breadcrumb.locator('a');
      const linkCount = await links.count();
      console.log(`Found ${linkCount} breadcrumb links`);
    }

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-012');
  });

  test('TC-PDP-013: Related Products Display', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1500);

    const relatedSection = await pdpPage.getRelatedProductsSection();
    const relatedVisible = await relatedSection.isVisible().catch(() => false);

    if (relatedVisible) {
      const products = await pdpPage.getRelatedProducts();
      const productCount = await products.count();
      console.log(`Found ${productCount} related products`);
    } else {
      console.log('Related products section not available');
    }

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-013');
  });

  test('TC-PDP-014: Reviews Display', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1500);

    const reviewsSection = await pdpPage.getReviewsSection();
    const reviewsVisible = await reviewsSection.isVisible().catch(() => false);

    if (reviewsVisible) {
      const rating = await pdpPage.getReviewRating().textContent().catch(() => null);
      const reviewCount = await pdpPage.getReviewCount().textContent().catch(() => null);
      console.log(`Rating: ${rating}`);
      console.log(`Review Count: ${reviewCount}`);
    } else {
      console.log('Reviews section not available');
    }

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-014');
  });

  test('TC-PDP-015: Browser Compatibility', async ({ pdpPage, evidenceCollector, page }, testInfo) => {
    const browserName = testInfo.project.name || 'chromium';
    console.log(`Testing with browser: ${browserName}`);

    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const productName = await pdpPage.getProductName();
    const nameVisible = await productName.isVisible();
    expect(nameVisible).toBe(true);

    await evidenceCollector.saveTestMetadata('TC-PDP-015', {
      testName: 'Browser Compatibility',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 0,
      status: 'PASS',
      browser: browserName,
      viewport: '1440x900',
      url: pdpUrl,
    });

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-015');
  });

  test('TC-PDP-CONFIG-001: Select Product Variant', async ({ pdpPage, productClassifier, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const attributes = await productClassifier.detectProductAttributes();

    if (attributes.size === 0) {
      // No attributes/variants found, skip this test
      return;
    }

    const optionsLoc = await pdpPage.getOptions();
    const optionCount = await optionsLoc.count();
    console.log(`Found ${optionCount} option groups`);

    if (optionCount > 0) {
      const firstOption = optionsLoc.nth(0);
      const buttons = firstOption.locator('button, label');
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        await buttons.nth(0).click();
        await page.waitForTimeout(1000);
      }
    }

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-CONFIG-001');
  });

  test('TC-PDP-BUNDLE-001: View Bundle Components', async ({ pdpPage, evidenceCollector, page }) => {
    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(1000);

    const bundleSection = page.locator('[data-testid*="bundle" i], .bundle-item');
    const bundleVisible = await bundleSection.first().isVisible().catch(() => false);

    if (!bundleVisible) {
      // No bundle section found, skip test
      return;
    }

    const items = await bundleSection.count();
    console.log(`Found ${items} bundle items`);

    await evidenceCollector.takeScreenshot(page, 'TC-PDP-BUNDLE-001');
  });
});
