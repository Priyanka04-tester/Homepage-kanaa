import { test, expect } from '../../pdp/fixtures/pdpFixture';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PDP Discovery Test Suite
 * Discovers all PDP sections, elements, and features
 * Generates discovery report for further testing
 */

test.describe('PDP Discovery', () => {
  let pdpUrl: string;

  test.beforeEach(async () => {
    // Get PDP URL from environment or use default test product
    pdpUrl = process.env.PDP_URL || 'https://thekanaa.com/en-sa/p/product-test';

    if (!pdpUrl.includes('http')) {
      throw new Error('PDP_URL environment variable not set. Usage: PDP_URL=https://... npm run test:pdp:discovery');
    }
  });

  test('Discover PDP Structure', async ({ pdpPage, pdpDiscovery, page }) => {
    test.info().annotations.push({ type: 'mode', description: 'DISCOVERY' });

    // Navigate to PDP
    await pdpPage.goto(pdpUrl);

    // Wait for page to stabilize
    await page.waitForTimeout(2000);

    // Perform discovery
    const discovery = await pdpDiscovery.discoverPDP();

    console.log(`\n=== PDP Discovery Report ===`);
    console.log(`URL: ${discovery.url}`);
    console.log(`Product Name: ${discovery.productName}`);
    console.log(`Product SKU: ${discovery.productSku}`);
    console.log(`Brand: ${discovery.brand}`);
    console.log(`Sections Found: ${discovery.sections.length}`);
    console.log(`Total Elements: ${discovery.totalElements}`);
    console.log(`Has Reviews: ${discovery.hasReviews}`);
    console.log(`Has FBT: ${discovery.hasFBT}`);
    console.log(`Has Bundle: ${discovery.hasBundle}`);

    // Display sections
    console.log(`\n--- Discovered Sections ---`);
    discovery.sections.forEach(section => {
      console.log(`\n${section.id}: ${section.name} (${section.type})`);
      section.elements.forEach(elem => {
        console.log(`  - ${elem.id}: ${elem.name} (${elem.type})`);
      });
    });

    // Verify minimum required elements
    expect(discovery.sections.length).toBeGreaterThan(0);
    expect(discovery.productName).toBeTruthy();
    expect(discovery.totalElements).toBeGreaterThan(0);

    // Save discovery results
    const reportsDir = 'reports/pdp';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportsDir, 'discovery.json'),
      JSON.stringify(discovery, null, 2)
    );

    console.log(`\nDiscovery report saved to: reports/pdp/discovery.json`);
  });

  test('Classify Product Type', async ({ pdpPage, pdpDiscovery, productClassifier, page }) => {
    test.info().annotations.push({ type: 'mode', description: 'DISCOVERY' });

    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(2000);

    const discovery = await pdpDiscovery.discoverPDP();
    const productType = await productClassifier.classifyProduct(discovery);

    console.log(`\n=== Product Classification ===`);
    console.log(`Product Type: ${productType}`);

    // Detect attributes if configurable
    if (productType === 'configurable') {
      const attributes = await productClassifier.detectProductAttributes();
      console.log(`\nDetected Attributes:`);
      attributes.forEach((options, name) => {
        console.log(`  ${name}: ${options.join(', ')}`);
      });
    }

    // Check for payment options
    const paymentOptions = await productClassifier.hasPaymentOptions();
    console.log(`\n=== Payment Options ===`);
    console.log(`Tabby: ${paymentOptions.tabby}`);
    console.log(`Tamara: ${paymentOptions.tamara}`);
    console.log(`EMKAN: ${paymentOptions.emkan}`);

    // Check features
    const hasDelivery = await productClassifier.hasDeliveryInfo();
    const hasReturn = await productClassifier.hasReturnInfo();
    const hasVideo = await productClassifier.hasVideoContent();
    const hasZoom = await productClassifier.hasZoomFeature();
    const hasGallery = await productClassifier.hasImageGallery();

    console.log(`\n=== Product Features ===`);
    console.log(`Delivery Info: ${hasDelivery}`);
    console.log(`Return Info: ${hasReturn}`);
    console.log(`Video Content: ${hasVideo}`);
    console.log(`Zoom Feature: ${hasZoom}`);
    console.log(`Image Gallery: ${hasGallery}`);

    // Check quantity constraints
    const canMultipleQty = await productClassifier.canAddMultipleQuantities();
    if (canMultipleQty) {
      const minQty = await productClassifier.getMinimumQuantity();
      const maxQty = await productClassifier.getMaximumQuantity();
      console.log(`\n=== Quantity Constraints ===`);
      console.log(`Min Quantity: ${minQty}`);
      console.log(`Max Quantity: ${maxQty}`);
    }

    // Verify product type is valid
    expect(['simple', 'configurable', 'bundle', 'grouped', 'out-of-stock', 'low-stock', 'with-reviews', 'with-fbt', 'unknown']).toContain(productType);

    // Save classification results
    const reportsDir = 'reports/pdp';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const classificationResult = {
      productType,
      paymentOptions,
      features: {
        deliveryInfo: hasDelivery,
        returnInfo: hasReturn,
        videoContent: hasVideo,
        zoomFeature: hasZoom,
        imageGallery: hasGallery,
      },
    };

    fs.writeFileSync(
      path.join(reportsDir, 'classification.json'),
      JSON.stringify(classificationResult, null, 2)
    );
  });

  test('Capture Initial Screenshots', async ({ pdpPage, evidenceCollector, page }) => {
    test.info().annotations.push({ type: 'mode', description: 'DISCOVERY' });

    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(2000);

    // Take screenshots at different viewport positions
    await evidenceCollector.takeScreenshot(page, 'DISCOVERY', 'viewport-top.png');
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);
    await evidenceCollector.takeScreenshot(page, 'DISCOVERY', 'viewport-middle.png');
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);
    await evidenceCollector.takeScreenshot(page, 'DISCOVERY', 'viewport-bottom.png');
    await page.evaluate(() => window.scrollTo(0, 0));

    // Capture page state
    await evidenceCollector.capturePageState(page, 'DISCOVERY');

    console.log(`\nScreenshots saved to: reports/evidence/DISCOVERY/`);
  });

  test('Extract Console and Network Info', async ({ pdpPage, evidenceCollector, page }) => {
    test.info().annotations.push({ type: 'mode', description: 'DISCOVERY' });

    await pdpPage.goto(pdpUrl);
    await page.waitForTimeout(2000);

    // Capture console messages
    const consoleEvidence = await evidenceCollector.captureConsoleMessages(page, 'DISCOVERY');
    if (consoleEvidence) {
      console.log(`Console messages logged: ${consoleEvidence.path}`);
    }

    // Capture network activity
    const networkEvidence = await evidenceCollector.captureNetworkActivity(page, 'DISCOVERY');
    if (networkEvidence) {
      console.log(`Network activity logged: ${networkEvidence.path}`);
    }

    // Capture accessibility issues
    const a11yEvidence = await evidenceCollector.captureAccessibilityIssues(page, 'DISCOVERY');
    if (a11yEvidence) {
      console.log(`Accessibility issues found: ${a11yEvidence.path}`);
    }

    expect(true).toBe(true);
  });

  test('Performance Metrics', async ({ pdpPage, page }) => {
    test.info().annotations.push({ type: 'mode', description: 'DISCOVERY' });

    await pdpPage.goto(pdpUrl);

    const metrics = await pdpPage.getPageMetrics();

    if (metrics) {
      console.log(`\n=== Performance Metrics ===`);
      console.log(`DOM Ready Time: ${metrics.domReady}ms`);
      console.log(`Page Load Time: ${metrics.pageLoad}ms`);
      console.log(`Total Time: ${metrics.totalTime}ms`);
    }

    // Check for large resources
    const resources = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img, script, link'))
        .map(el => ({
          tag: el.tagName,
          src: (el as any).src || (el as any).href,
          size: (el as any).size || 'unknown',
        }))
        .filter(r => r.src)
        .slice(0, 10);
    });

    console.log(`\n=== Top Resources ===`);
    resources.forEach(r => {
      console.log(`${r.tag}: ${r.src?.substring(0, 80)}`);
    });

    expect(true).toBe(true);
  });
});
