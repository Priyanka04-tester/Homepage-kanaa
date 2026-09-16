# PDP QA Testing Bot

A comprehensive, autonomous QA testing framework for ecommerce Product Detail Pages (PDPs). Built with Playwright, TypeScript, and designed to behave like both a senior manual QA tester and an SDET (Senior Development/QA Engineer).

## Key Features

### 🤖 Autonomous Testing
- **Dynamic Discovery**: Automatically discovers all PDP sections and elements without hardcoded selectors
- **Smart Classification**: Detects product type (simple, configurable, bundle, etc.)
- **Resilient Locators**: Uses Playwright's best practices (getByRole, getByLabel, getByText)
- **Zero Configuration**: Automatically identifies and tests features present on PDP

### 📊 Comprehensive Coverage
- Header navigation (logo, search, cart, language)
- Product information (name, brand, SKU, price, stock)
- Product images (gallery, thumbnails, zoom)
- Quantity controls and Add to Cart
- Variants and configurations
- Bundle products
- Reviews and ratings
- Frequently Bought Together (FBT)
- Related products
- Payment options (Tabby, Tamara, EMKAN)
- Delivery and return information
- UI/UX and accessibility
- Responsive design (Desktop, Tablet, Mobile)
- Multi-browser (Chromium, Firefox, WebKit)

### 🎯 Test Modes
- **DISCOVERY**: Discover complete PDP structure and features
- **SMOKE**: Quick validation of critical functionality
- **SANITY**: Test recently changed areas
- **FULL**: Comprehensive PDP testing
- **REGRESSION**: Complete regression suite
- **RETEST**: Retest specific bug and impacted areas

### 📸 Evidence Collection
- Screenshots (viewport and full-page)
- Video recordings of failures
- Browser console logs
- Network activity (HAR files)
- Playwright traces
- Accessibility issues
- Page state snapshots

### 🐛 Bug Reporting
- Automatic bug report generation
- Detailed reproducibility steps
- Environment information
- Evidence linking
- Severity and priority classification
- Status tracking

## Installation

```bash
# Install dependencies
npm install

# Verify Playwright browsers are installed
npx playwright install

# Optional: Install with specific browsers only
npx playwright install chromium firefox webkit
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Base URL for your website
BASE_URL=https://thekanaa.com/en-sa/

# For Arabic PDPs
BASE_URL_AR=https://thekanaa.com/ar-sa/

# Environment
ENVIRONMENT=staging

# Playwright options
HEADLESS=true
SLOW_MO=0

# Optional: PDP-specific settings
PDP_URL=https://thekanaa.com/en-sa/p/your-test-product
```

### Required: Provide PDP URL

You **must** provide a valid PDP URL using the `PDP_URL` environment variable:

```bash
# Set as environment variable (recommended)
export PDP_URL="https://thekanaa.com/en-sa/p/your-product-slug"

# Or set inline when running tests
PDP_URL="https://thekanaa.com/en-sa/p/your-product-slug" npm run test:pdp:discovery
```

## Running Tests

### Discovery - Discover PDP Structure

Discovers all sections, elements, and features on the PDP:

```bash
PDP_URL="https://thekanaa.com/en-sa/p/your-product" npm run test:pdp:discovery
```

**Output:**
- `reports/pdp/discovery.json` - Complete PDP structure
- `reports/pdp/classification.json` - Product type and features
- `reports/evidence/DISCOVERY/` - Screenshots and page state

### Smoke - Quick Validation

Fast sanity check of critical functionality:

```bash
PDP_URL="https://thekanaa.com/en-sa/p/your-product" npm run test:pdp:smoke
```

**Duration:** ~2-3 minutes
**Coverage:** Page load, product info, Add to Cart, header, images, mobile, console

### Full - Comprehensive Testing

Complete PDP testing across all functionality:

```bash
PDP_URL="https://thekanaa.com/en-sa/p/your-product" npm run test:pdp:full
```

**Duration:** ~10-15 minutes per browser
**Coverage:** All 15+ core test cases plus variant/bundle specific tests

### Variants and Configurations

For configurable products (variants, options):

```bash
PDP_URL="https://thekanaa.com/en-sa/p/configurable-product" npm run test:pdp:full
```

The framework automatically detects variants and tests:
- Every available option
- Price updates per variant
- Image changes
- SKU changes
- Invalid combinations

### Bundle Products

For bundle products:

```bash
PDP_URL="https://thekanaa.com/en-sa/p/bundle-product" npm run test:pdp:full
```

Tests:
- Component selection
- Optional vs required items
- Bundle pricing
- Cart validation

### Headed Mode - Watch Tests Run

See the browser while tests execute:

```bash
PDP_URL="https://thekanaa.com/en-sa/p/your-product" npm run test:pdp:headed
```

### Debug Mode - Step Through Tests

Interactive debugging:

```bash
PDP_URL="https://thekanaa.com/en-sa/p/your-product" npm run test:pdp:debug
```

### Trace Collection - Detailed Debugging Info

Collect full Playwright traces for detailed analysis:

```bash
PDP_URL="https://thekanaa.com/en-sa/p/your-product" npm run test:pdp:trace
```

## Test Structure

### Page Objects (`pdp/pages/PDPPage.ts`)

Encapsulates all PDP interactions using resilient selectors:

```typescript
// Get elements without hardcoded selectors
const productName = pdpPage.getProductName();
const price = pdpPage.getPrice();
const addToCartBtn = pdpPage.getAddToCartButton();

// Interactive operations
await pdpPage.goto(pdpUrl);
await addToCartBtn.click();
await pdpPage.scrollToElement(element);
```

### Discovery Module (`pdp/utilities/PDPDiscovery.ts`)

Automatically discovers PDP structure:

```typescript
const discovery = await pdpDiscovery.discoverPDP();
// Returns: sections, attributes, elements, product type indicators
```

### Product Classifier (`pdp/utilities/ProductClassifier.ts`)

Determines product type and features:

```typescript
const productType = await productClassifier.classifyProduct(discovery);
// Returns: simple | configurable | bundle | grouped | out-of-stock | etc.

const attributes = await productClassifier.detectProductAttributes();
// Returns: Map of all variants (Color, Size, Storage, etc.)
```

### Bug Reporter (`pdp/utilities/BugReporter.ts`)

Creates structured bug reports:

```typescript
const bug = bugReporter.createBugReport(
  'Add to Cart button not responsive',
  'High',
  'P1',
  environment,
  stepsToReproduce,
  expectedResult,
  actualResult
);

bugReporter.addEvidenceToBug(bug, [screenshot, console.log]);
bugReporter.updateBugStatus(bug.bugId, 'CONFIRMED');
```

### Evidence Collector (`pdp/utilities/EvidenceCollector.ts`)

Collects test evidence automatically:

```typescript
// Screenshots
await evidenceCollector.takeScreenshot(page, testCaseId);
await evidenceCollector.takeFullPageScreenshot(page, testCaseId);

// Console and network
await evidenceCollector.captureConsoleMessages(page, testCaseId);
await evidenceCollector.captureNetworkActivity(page, testCaseId);

// Page state
await evidenceCollector.capturePageState(page, testCaseId);
await evidenceCollector.captureAccessibilityIssues(page, testCaseId);
```

## Test Data

### Common Tests (`pdp/test-data/commonTests.ts`)

Pre-built test cases for all PDPs:

```typescript
export const commonTestCases: TestCase[]
// ~15 tests for standard PDP features

export const configurableProductTests: TestCase[]
// ~4 tests for variant selection

export const bundleProductTests: TestCase[]
// ~3 tests for bundle configurations
```

## Reports and Evidence

### Structure

```
reports/
├── pdp/
│   ├── discovery.json          # Complete PDP structure
│   ├── classification.json      # Product type and features
│   └── qa-report.md            # Final QA report
├── evidence/
│   ├── DISCOVERY/              # Discovery screenshots
│   ├── TC-PDP-001/             # Test case evidence
│   │   ├── screenshot.png
│   │   ├── fullpage.png
│   │   ├── console.json
│   │   ├── network.json
│   │   ├── page-state.json
│   │   ├── a11y-issues.json
│   │   └── metadata.json
│   └── ...
├── bugs/
│   ├── BUG-PDP-0001.json       # Bug reports
│   ├── BUG-PDP-0002.json
│   └── ...
└── videos/                     # Test recordings

test-results/
└── pdp/
    ├── results.json            # Test results
    └── junit.xml               # JUnit report
```

### Viewing Reports

```bash
# View HTML test report
npx playwright show-report playwright-report/pdp

# View test results
cat test-results/pdp/results.json

# View bug summary
cat reports/bugs/summary.md
```

## Examples

### Example 1: Test a Simple Product

```bash
# Discover the PDP
PDP_URL="https://thekanaa.com/en-sa/p/simple-tshirt" npm run test:pdp:discovery

# Run smoke tests
PDP_URL="https://thekanaa.com/en-sa/p/simple-tshirt" npm run test:pdp:smoke

# Run full suite
PDP_URL="https://thekanaa.com/en-sa/p/simple-tshirt" npm run test:pdp:full

# View report
npx playwright show-report playwright-report/pdp
```

### Example 2: Test a Configurable Product

```bash
# Discover with variants
PDP_URL="https://thekanaa.com/en-sa/p/shoes-with-sizes" npm run test:pdp:discovery

# Full testing (auto-detects and tests all variants)
PDP_URL="https://thekanaa.com/en-sa/p/shoes-with-sizes" npm run test:pdp:full

# Watch the testing
PDP_URL="https://thekanaa.com/en-sa/p/shoes-with-sizes" npm run test:pdp:headed
```

### Example 3: Test a Bundle Product

```bash
# Discover bundle structure
PDP_URL="https://thekanaa.com/en-sa/p/bundle-electronics" npm run test:pdp:discovery

# Full testing (auto-detects and tests bundle options)
PDP_URL="https://thekanaa.com/en-sa/p/bundle-electronics" npm run test:pdp:full
```

### Example 4: Multi-Browser Testing

The framework automatically runs tests across:
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)  
- **WebKit** (Desktop Safari)

Plus multiple viewports:
- **Desktop**: 1440x900, 1920x1080, 1366x768
- **Tablet**: 1024x768, 768x1024
- **Mobile**: 390x844, 393x852, 412x915

Just run any test command - it will test across all browser/viewport combinations.

### Example 5: Custom Test Configuration

Create custom tests in `tests/pdp/`:

```typescript
import { test, expect } from '../../pdp/fixtures/pdpFixture';

test('Custom: My Test', async ({ pdpPage, evidenceCollector, page }) => {
  await pdpPage.goto(process.env.PDP_URL!);
  
  // Your test logic here
  
  await evidenceCollector.takeScreenshot(page, 'CUSTOM-TEST-001');
});
```

## Troubleshooting

### Issue: Tests can't find elements

**Solution:** Elements discovered dynamically. Verify elements exist with discovery first:

```bash
PDP_URL="..." npm run test:pdp:discovery
```

Check `reports/pdp/discovery.json` to see what was found.

### Issue: Add to Cart fails

**Solution:** May be stock/variant issue. Check with discovery:

```bash
PDP_URL="..." npm run test:pdp:discovery
cat reports/pdp/discovery.json | grep -i "stock\|variant"
```

Try a different product if current is out of stock.

### Issue: Tests timeout

**Solution:** Increase timeout in `pdp-playwright.config.ts`:

```typescript
use: {
  actionTimeout: 15000,      // Increase from 10000
  navigationTimeout: 45000,  // Increase from 30000
}
```

### Issue: Flaky tests

**Solution:** Add waits:

```typescript
await page.waitForTimeout(1000);  // Add explicit waits
await page.waitForLoadState('networkidle');  // Wait for network
```

### Issue: Evidence not saving

**Solution:** Verify `reports/` directory exists and is writable:

```bash
mkdir -p reports/{pdp,evidence,bugs,videos}
chmod 755 reports
```

## Best Practices

1. **Use Environment Variables**
   - Never hardcode URLs
   - Use `.env` for configuration
   - Set `PDP_URL` before running tests

2. **Start with Discovery**
   - Always run discovery first
   - Understand PDP structure
   - Verify all elements discovered

3. **Use Appropriate Test Mode**
   - **DISCOVERY**: First time analyzing PDP
   - **SMOKE**: Quick validation
   - **FULL**: Comprehensive testing
   - **REGRESSION**: After changes

4. **Review Evidence**
   - Check screenshots for visual issues
   - Review console logs for errors
   - Check network activity for slow APIs
   - Look for accessibility issues

5. **Iterative Testing**
   - Test simple products first
   - Then test variants/bundles
   - Then test edge cases
   - Run regression tests after fixes

## API Reference

### PDPPage

Main page object for PDP interactions.

**Key Methods:**
- `goto(url)` - Navigate to PDP
- `getProductName()` - Get product name locator
- `getPrice()` - Get price locator
- `getAddToCartButton()` - Get add to cart button
- `getQuantityInput()` - Get quantity control
- `getOptions()` - Get variant options
- `getBundleItems()` - Get bundle items
- `takeScreenshot(filename)` - Capture screenshot
- `getPageMetrics()` - Get performance metrics

### PDPDiscovery

Automatic PDP structure discovery.

**Key Methods:**
- `discoverPDP()` - Returns: PDPDiscoveryResult
- Returns: url, productType, productName, sections, attributes, price, etc.

### ProductClassifier

Product type and feature detection.

**Key Methods:**
- `classifyProduct(discovery)` - Returns: ProductType
- `detectProductAttributes()` - Returns: Map<string, string[]>
- `hasPaymentOptions()` - Returns: {tabby, tamara, emkan}
- `hasDeliveryInfo()` - Returns: boolean
- `hasVideoContent()` - Returns: boolean
- `hasImageGallery()` - Returns: boolean

### BugReporter

Bug report creation and management.

**Key Methods:**
- `createBugReport(...)` - Create bug
- `addEvidenceToBug(bug, evidence)` - Link evidence
- `updateBugStatus(bugId, status)` - Update status
- `getAllBugs()` - Get all bugs
- `getBugCount()` - Get bug statistics

### EvidenceCollector

Test evidence collection.

**Key Methods:**
- `takeScreenshot(page, testId, filename)` - Screenshot
- `takeFullPageScreenshot(page, testId)` - Full page screenshot
- `captureConsoleMessages(page, testId)` - Console logs
- `captureNetworkActivity(page, testId)` - Network HAR
- `capturePageState(page, testId)` - Page state
- `captureAccessibilityIssues(page, testId)` - A11y issues

## CI/CD Integration

### GitHub Actions

```yaml
name: PDP QA Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install && npx playwright install
      
      - name: Run PDP Discovery
        run: PDP_URL="${{ secrets.TEST_PDP_URL }}" npm run test:pdp:discovery
      
      - name: Run PDP Smoke Tests
        run: PDP_URL="${{ secrets.TEST_PDP_URL }}" npm run test:pdp:smoke
      
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: pdp-reports
          path: reports/
```

### GitLab CI

```yaml
pdp_tests:
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  script:
    - npm install
    - PDP_URL="${TEST_PDP_URL}" npm run test:pdp:full
  artifacts:
    paths:
      - reports/
      - playwright-report/pdp/
```

## Performance Considerations

- **Single Worker**: Tests run sequentially to avoid race conditions
- **Timeouts**: 60s per test, 10s per action
- **Retries**: 2x on CI for flaky tests
- **Traces**: Enabled only on first failure
- **Video**: Kept only on failure
- **Screenshots**: On failure only

For parallel execution, modify `pdp-playwright.config.ts`:

```typescript
workers: process.env.CI ? 2 : 1,  // 2 workers on CI
```

## Support

For issues, bugs, or feature requests:

1. Check the troubleshooting section above
2. Review evidence in `reports/` directory
3. Check console output and logs
4. Review Playwright documentation

## License

MIT

---

**Built for**: Thekanaa ecommerce QA  
**Framework**: Playwright + TypeScript  
**Version**: 1.0.0  
**Last Updated**: 2026-09-16
