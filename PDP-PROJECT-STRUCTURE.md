# PDP QA Bot - Project Structure

Complete overview of the PDP QA Testing Bot project structure and components.

## Directory Structure

```
homepage qa bot/
│
├── pdp/                                 # PDP QA Bot Core
│   ├── types/
│   │   └── index.ts                    # TypeScript type definitions
│   │       - ProductType
│   │       - TestMode, Severity, Priority
│   │       - PDPSection, PDPElement
│   │       - ProductAttribute
│   │       - PriceInfo
│   │       - TestCase, TestStep
│   │       - BugReport
│   │       - EvidenceFile
│   │       - PDPDiscoveryResult
│   │       - QAReport
│   │
│   ├── pages/
│   │   └── PDPPage.ts                  # Main PDP Page Object
│   │       - Dynamic element discovery
│   │       - Resilient selectors (getByRole, getByLabel, etc)
│   │       - Interactive operations
│   │       - Performance metrics
│   │
│   ├── utilities/
│   │   ├── PDPDiscovery.ts            # Automatic PDP discovery
│   │   │   - Discover sections dynamically
│   │   │   - Extract attributes
│   │   │   - Identify features
│   │   │
│   │   ├── ProductClassifier.ts        # Product type detection
│   │   │   - Classify: simple, configurable, bundle, etc
│   │   │   - Detect attributes (color, size, storage)
│   │   │   - Feature detection (zoom, gallery, video)
│   │   │   - Payment options detection
│   │   │
│   │   ├── BugReporter.ts             # Bug report management
│   │   │   - Create bug reports
│   │   │   - Link evidence
│   │   │   - Track status
│   │   │   - Generate summaries
│   │   │
│   │   └── EvidenceCollector.ts       # Evidence collection
│   │       - Screenshots (viewport, fullpage)
│   │       - Console logs
│   │       - Network activity
│   │       - Page state
│   │       - Accessibility issues
│   │
│   ├── fixtures/
│   │   └── pdpFixture.ts              # Test fixtures
│   │       - PDPPage fixture
│   │       - PDPDiscovery fixture
│   │       - ProductClassifier fixture
│   │       - BugReporter fixture
│   │       - EvidenceCollector fixture
│   │
│   └── test-data/
│       └── commonTests.ts              # Pre-built test cases
│           - Common tests (15 cases)
│           - Configurable product tests (4 cases)
│           - Bundle product tests (3 cases)
│
├── tests/
│   ├── pdp/                           # PDP Test Suites
│   │   ├── pdp-discovery.spec.ts      # Discovery test suite
│   │   │   - Discover PDP structure
│   │   │   - Classify product type
│   │   │   - Capture initial evidence
│   │   │   - Performance metrics
│   │   │
│   │   ├── pdp-smoke.spec.ts          # Smoke test suite
│   │   │   - Page load and basic elements
│   │   │   - Product information accuracy
│   │   │   - Add to cart functionality
│   │   │   - Header navigation
│   │   │   - Product images
│   │   │   - No console errors
│   │   │   - Mobile responsiveness
│   │   │
│   │   └── pdp-full.spec.ts           # Full test suite
│   │       - 15+ comprehensive test cases
│   │       - Variant/bundle specific tests
│   │       - Browser compatibility tests
│   │
│   └── homepage/                       # Existing Homepage Tests
│       ├── smoke-test.spec.ts
│       ├── homepage-discovery.spec.ts
│       ├── homepage-navigation.spec.ts
│       ├── homepage-buttons.spec.ts
│       ├── homepage-links.spec.ts
│       ├── homepage-sliders.spec.ts
│       ├── homepage-products.spec.ts
│       ├── homepage-ui.spec.ts
│       ├── homepage-responsive.spec.ts
│       ├── homepage-negative.spec.ts
│       └── homepage-regression.spec.ts
│
├── pages/
│   └── HomePage.ts                    # Existing Homepage Page Object
│
├── reports/                           # Test Results and Reports
│   ├── pdp/
│   │   ├── discovery.json             # Discovered PDP structure
│   │   ├── classification.json         # Product type classification
│   │   └── qa-report.md               # Final QA report
│   │
│   ├── evidence/                      # Test Evidence
│   │   ├── DISCOVERY/                 # Discovery screenshots
│   │   ├── TC-PDP-001/                # Test case evidence
│   │   │   ├── screenshot.png
│   │   │   ├── fullpage.png
│   │   │   ├── console.json
│   │   │   ├── network.json
│   │   │   ├── page-state.json
│   │   │   ├── a11y-issues.json
│   │   │   └── metadata.json
│   │   └── ...
│   │
│   ├── bugs/                          # Bug Reports
│   │   ├── BUG-PDP-0001.json
│   │   ├── BUG-PDP-0002.json
│   │   └── summary.md
│   │
│   └── videos/                        # Failure Recordings
│       └── TC-PDP-001-failure.webm
│
├── test-results/                      # Test Result Artifacts
│   ├── pdp/
│   │   ├── results.json               # JSON results
│   │   └── junit.xml                  # JUnit format
│   └── ...
│
├── playwright-report/                 # HTML Test Reports
│   ├── pdp/                           # PDP test report
│   └── ...
│
├── node_modules/                      # Dependencies
│   ├── @playwright/
│   ├── typescript/
│   ├── dotenv/
│   └── ...
│
├── .git/                              # Git repository
│
├── .env                               # Environment variables (not in Git)
├── .env.pdp.example                   # Example PDP config
├── .env.example                       # Example config
├── .gitignore                         # Git ignore rules
│
├── playwright.config.ts               # Homepage Playwright config
├── pdp-playwright.config.ts           # PDP-specific Playwright config
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies and scripts
├── package-lock.json                  # Dependency lock file
│
├── CLAUDE.md                          # Original project instructions
├── README.md                          # Project README
├── START-HERE.md                      # Setup guide
├── SETUP-GUIDE.md                     # Detailed setup
│
├── PDP-QA-BOT.md                      # PDP QA Bot Documentation
└── PDP-PROJECT-STRUCTURE.md           # This file
```

## File Purposes

### Type Definitions (`pdp/types/index.ts`)
Central repository for all TypeScript interfaces and types used throughout the PDP QA Bot.

**Key Types:**
- `ProductType` - Product classification
- `TestMode` - Test execution modes
- `Severity/Priority` - Bug classification
- `PDPSection/PDPElement` - Page structure
- `ProductAttribute` - Variant options
- `TestCase/TestStep` - Test definitions
- `BugReport` - Bug documentation
- `EvidenceFile` - Test evidence
- `PDPDiscoveryResult` - Discovery output
- `QAReport` - Final report

### Page Object (`pdp/pages/PDPPage.ts`)
Encapsulates all PDP interactions using Playwright's resilient selectors.

**Features:**
- Resilient selectors (getByRole, getByLabel, getByText)
- No hardcoded XPath selectors
- Dynamic element discovery
- Built-in wait and visibility checks
- Screenshot and performance capture
- Accessibility helpers

**Common Methods:**
- Navigation: `goto()`, `goBack()`
- Elements: `getProductName()`, `getPrice()`, `getAddToCartButton()`
- Interactions: `click()`, `fill()`, `select()`
- Utilities: `scrollToElement()`, `waitForElement()`, `isElementVisible()`

### Discovery Module (`pdp/utilities/PDPDiscovery.ts`)
Automatically discovers PDP structure without hardcoded knowledge.

**Capabilities:**
- Discovers all visible sections
- Extracts product information
- Identifies interactive elements
- Detects variants and attributes
- Classifies sections by type
- No configuration required

**Output:**
```json
{
  "url": "https://...",
  "productName": "...",
  "sections": [...],
  "attributes": [...],
  "totalElements": 50
}
```

### Product Classifier (`pdp/utilities/ProductClassifier.ts`)
Determines product type and available features.

**Classifications:**
- `simple` - Basic product
- `configurable` - Has variants
- `bundle` - Bundle of items
- `grouped` - Product group
- `out-of-stock` - Not available
- `low-stock` - Limited quantity
- `with-reviews` - Has customer reviews
- `with-fbt` - Frequently Bought Together

**Feature Detection:**
- Variant types (color, size, storage, RAM)
- Payment options (Tabby, Tamara, EMKAN)
- Content types (video, zoom, gallery)
- Information types (delivery, returns)
- Quantity constraints (min, max)

### Bug Reporter (`pdp/utilities/BugReporter.ts`)
Creates and manages bug reports with full traceability.

**Features:**
- Auto-generated bug IDs
- Severity and priority classification
- Environment information capture
- Evidence linking
- Status tracking (NEW, CONFIRMED, FIXED, etc.)
- Bug summaries and reports

**Output Format:**
```json
{
  "bugId": "BUG-PDP-0001",
  "title": "...",
  "severity": "High",
  "priority": "P1",
  "environment": {...},
  "stepsToReproduce": [...],
  "evidence": [...]
}
```

### Evidence Collector (`pdp/utilities/EvidenceCollector.ts`)
Automatically collects various types of test evidence.

**Evidence Types:**
- **Screenshots**: Viewport and full-page
- **Videos**: On failure
- **Console Logs**: Errors and warnings
- **Network Activity**: Request/response HAR
- **Page State**: DOM info, metrics
- **Accessibility Issues**: A11y violations
- **Traces**: Playwright traces for debugging

**Automatic Organization:**
```
reports/evidence/TEST-ID/
├── screenshot.png
├── fullpage.png
├── console.json
├── network.json
├── page-state.json
├── a11y-issues.json
└── metadata.json
```

### Test Fixtures (`pdp/fixtures/pdpFixture.ts`)
Playwright test fixtures providing utilities to all tests.

**Fixtures Provided:**
- `pdpPage` - Page object
- `pdpDiscovery` - Discovery utility
- `productClassifier` - Classification utility
- `bugReporter` - Bug reporting
- `evidenceCollector` - Evidence collection

**Usage in Tests:**
```typescript
test('Example', async ({ pdpPage, pdpDiscovery, evidenceCollector }) => {
  // All utilities automatically injected
});
```

### Test Data (`pdp/test-data/commonTests.ts`)
Pre-built, reusable test cases for PDPs.

**Test Case Collections:**
- `commonTestCases` - 15 tests for all PDPs
- `configurableProductTests` - 4 tests for variants
- `bundleProductTests` - 3 tests for bundles

**Each Test Case Includes:**
- ID, name, description
- Preconditions and steps
- Expected results
- Priority and severity
- Applicable test modes

### Discovery Test (`tests/pdp/pdp-discovery.spec.ts`)
Automated PDP structure discovery.

**Tests:**
1. Discover PDP Structure - Maps all sections
2. Classify Product Type - Identifies product type
3. Capture Initial Screenshots - Visual documentation
4. Extract Console and Network Info - Error detection
5. Performance Metrics - Load time analysis

**Output:**
- `reports/pdp/discovery.json` - Complete structure
- `reports/pdp/classification.json` - Product type
- Screenshots and page state
- Performance metrics

### Smoke Test (`tests/pdp/pdp-smoke.spec.ts`)
Quick validation of critical functionality.

**7 Tests:**
1. Page Load and Basic Elements
2. Product Information Accuracy
3. Add to Cart Functionality
4. Header Navigation Elements
5. Product Images Display
6. No Critical Console Errors
7. Mobile Responsiveness

**Duration:** ~2-3 minutes
**Focus:** Critical user journeys

### Full Test Suite (`tests/pdp/pdp-full.spec.ts`)
Comprehensive testing of all PDP features.

**15+ Tests:**
- Core functionality (load, info, cart, pricing)
- Navigation (header, breadcrumb, search)
- Features (images, wishlist, share)
- Content (reviews, related, recommendations)
- Responsive design
- Browser compatibility
- Variants and bundles

**Duration:** ~10-15 minutes per browser
**Coverage:** All testable PDP features

## Configuration Files

### `pdp-playwright.config.ts`
PDP-specific Playwright configuration.

**Features:**
- Dedicated test directory: `tests/pdp`
- PDP-specific reporters
- Multi-browser: Chromium, Firefox, WebKit
- Multi-viewport: Desktop, Tablet, Mobile
- Trace and screenshot on failure
- Video retention on failure

**Browser/Viewport Combinations:** 10
- Chromium: 1440x900, 1920x1080, 1366x768, tablet, mobile
- Firefox: 1440x900
- WebKit: 1440x900

### `playwright.config.ts`
Original homepage test configuration.

### `tsconfig.json`
TypeScript compiler configuration.

- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Source maps enabled
- Output to `dist/`

### `package.json`
Dependencies and test scripts.

**PDP-Specific Scripts:**
- `npm run test:pdp:discovery` - Run discovery
- `npm run test:pdp:smoke` - Run smoke tests
- `npm run test:pdp:full` - Run full suite
- `npm run test:pdp:headed` - Watch tests
- `npm run test:pdp:debug` - Debug tests
- `npm run test:pdp:trace` - Trace collection

### `.env.pdp.example`
Example environment configuration for PDP testing.

**Key Variables:**
- `PDP_URL` - Required: Product URL to test
- `BASE_URL` - Website base URL
- `ENVIRONMENT` - Environment (staging/prod)
- `COLLECT_*` - Evidence collection flags
- `TEST_*` - Which features to test

## Environment Setup

### Required Environment Variables

```bash
# Must be set before running tests
export PDP_URL="https://thekanaa.com/en-sa/p/your-product"

# Optional: Usually set in .env file
export BASE_URL="https://thekanaa.com/en-sa/"
export ENVIRONMENT="staging"
```

### .env File Template

Copy `.env.pdp.example` to `.env`:

```bash
cp .env.pdp.example .env
```

Then edit `.env` with your values:

```env
BASE_URL=https://thekanaa.com/en-sa/
ENVIRONMENT=staging
HEADLESS=true
```

## Test Execution Flow

### Discovery Flow

```
PDP URL Provided
    ↓
Navigate to PDP
    ↓
Wait for Load
    ↓
Discover Sections (dynamically)
    ↓
Extract Product Info
    ↓
Detect Attributes
    ↓
Classify Product Type
    ↓
Save Results
    ├── discovery.json
    ├── classification.json
    ├── screenshots
    └── page-state.json
```

### Smoke Test Flow

```
Load Test Setup
    ↓
Navigate to PDP
    ↓
Test Page Load ✓
    ↓
Test Product Info ✓
    ↓
Test Add to Cart ✓
    ↓
Test Header ✓
    ↓
Test Images ✓
    ↓
Test Mobile ✓
    ↓
Test Console ✓
    ↓
Generate Report ✓
```

### Full Test Flow

```
Load Discovery Results
    ↓
Run Core Tests (15 cases)
    ├── Test 1: Page Load
    ├── Test 2: Product Info
    ├── Test 3: Add to Cart
    ├── Test 4: Price Accuracy
    ├── Test 5: Quantity Controls
    ├── ...
    └── Test 15: Browser Compat
    ↓
Detect Product Type
    ↓
Run Type-Specific Tests
    ├── If Configurable → Variant Tests
    ├── If Bundle → Bundle Tests
    └── If Simple → Variant Tests
    ↓
Generate Report
    ↓
Link Evidence
    ├── Screenshots
    ├── Videos
    ├── Console Logs
    └── Network Activity
```

## Evidence Organization

### By Test

```
reports/evidence/TC-PDP-001/
├── screenshot.png      # Viewport screenshot
├── fullpage.png        # Full page screenshot
├── console.json        # Console messages
├── network.json        # Network requests
├── page-state.json     # Page state snapshot
├── a11y-issues.json    # Accessibility issues
└── metadata.json       # Test metadata
```

### By Issue

```
reports/evidence/BUG-PDP-0001/
├── reproduction-1.png  # Issue reproduction
├── reproduction-2.png  # Issue in different state
├── error-log.json      # Error details
└── network-trace.json  # Network during error
```

## Report Generation

### Discovery Report

```
reports/pdp/discovery.json
{
  "url": "...",
  "productType": "configurable",
  "productName": "...",
  "sections": [
    { "id": "SECTION-HEADER", "name": "Header", "elements": [...] },
    { "id": "SECTION-PRODUCT-MAIN", "name": "Product Main", "elements": [...] },
    ...
  ],
  "attributes": [
    { "name": "Color", "options": [...] },
    { "name": "Size", "options": [...] }
  ],
  "totalElements": 47
}
```

### Bug Report

```
reports/bugs/BUG-PDP-0001.json
{
  "bugId": "BUG-PDP-0001",
  "title": "Add to Cart button unresponsive",
  "severity": "High",
  "priority": "P1",
  "environment": {
    "browser": "chromium",
    "viewport": "1440x900",
    "language": "en"
  },
  "stepsToReproduce": [...],
  "evidence": [
    { "type": "screenshot", "path": "..." },
    { "type": "console", "path": "..." }
  ]
}
```

### QA Report

```
reports/pdp/qa-report.md
# PDP QA Report

## Executive Summary
- Tests Executed: 25
- Passed: 23
- Failed: 2
- Pass Rate: 92%

## Bugs Found
- Critical: 0
- High: 1
- Medium: 2
- Low: 0

## Recommendation
PASS_WITH_OBSERVATIONS
```

## Running Tests

### Command Summary

```bash
# Set PDP URL (required for all tests)
export PDP_URL="https://thekanaa.com/en-sa/p/your-product"

# Discovery - Understand PDP structure
npm run test:pdp:discovery

# Smoke - Quick validation
npm run test:pdp:smoke

# Full - Comprehensive testing
npm run test:pdp:full

# Watch - See tests run
npm run test:pdp:headed

# Debug - Step through
npm run test:pdp:debug

# Trace - Detailed debugging
npm run test:pdp:trace
```

### Expected Output

```
PDP Discovery
✓ Discover PDP Structure
✓ Classify Product Type
✓ Capture Initial Screenshots
✓ Extract Console and Network Info
✓ Performance Metrics

5 passed (15s)

Reports:
- reports/pdp/discovery.json
- reports/pdp/classification.json
- reports/evidence/DISCOVERY/
```

## Best Practices

1. **Always Start with Discovery**
   - Understand PDP structure first
   - Identify product type
   - Verify element discovery

2. **Use Appropriate Test Mode**
   - Discovery → Smoke → Full → Regression

3. **Review Evidence**
   - Check screenshots for visual issues
   - Review console logs
   - Analyze network activity

4. **Test Different Product Types**
   - Simple products
   - Configurable products
   - Bundle products

5. **Run Across Multiple Browsers**
   - Tests automatically run all browsers
   - Cross-browser compatibility verified

## Troubleshooting

### Elements Not Found
- Run discovery first to see discovered elements
- Check `reports/pdp/discovery.json`
- Verify PDP URL is accessible

### Tests Timeout
- Increase timeout in `pdp-playwright.config.ts`
- Check network conditions
- Verify Playwright is installed

### Reports Not Generated
- Verify `reports/` directory exists
- Check write permissions
- Review console error messages

## References

- [Playwright Documentation](https://playwright.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

**PDP QA Bot v1.0.0**  
Built for Thekanaa ecommerce testing  
Last Updated: 2026-09-16
