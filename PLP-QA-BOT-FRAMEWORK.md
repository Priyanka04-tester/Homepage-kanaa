# PLP QA Testing Bot - Production Framework

## Overview

This is a production-quality PLP (Product Listing Page) QA Testing Bot that functions as both a Senior Manual QA Engineer and Senior Automation QA Engineer. The bot dynamically discovers, tests, and validates every meaningful PLP/category page on the Thekanaa ecommerce website.

**Target**: https://thekanaa.com  
**Scope**: All accessible PLPs in English and Arabic  
**Framework**: Playwright + TypeScript  
**Status**: Ready for Phase 1 - Discovery

## Key Features

✅ **Dynamic PLP Discovery** - Automatically discovers all accessible category pages
✅ **Filter Analysis** - Identifies and tests all available filters intelligently  
✅ **Sorting Verification** - Validates all sort options work correctly  
✅ **Product Card Testing** - Comprehensive product element validation  
✅ **Multi-Language Support** - English (LTR) and Arabic (RTL)  
✅ **Responsive Testing** - Desktop, Tablet, Mobile viewports  
✅ **Business Rule Validation** - Tests from product perspective, not just UI  
✅ **Evidence Collection** - Automatic screenshots, videos, traces, and logs  
✅ **Bug Reporting** - Production-ready bug reports with full traceability  
✅ **Regression Testing** - Automated verification of fixes  

## Project Structure

```
plp/
├── pages/
│   └── PLPPage.ts                    # PLP page object with common interactions
├── utilities/
│   ├── PLPDiscovery.ts              # Dynamically discover PLPs, filters, sorts
│   ├── EvidenceCollector.ts         # Screenshot, video, trace, and log collection
│   └── BugReporter.ts               # Bug creation and tracking
├── fixtures/
│   └── plpFixture.ts                # Test fixture with all utilities
├── types/
│   └── index.ts                     # TypeScript interfaces for all data
└── test-data/
    └── commonTests.ts               # Reusable test scenarios and data

state/
├── plp-inventory.json               # All discovered PLPs
├── plp-filter-inventory.json        # All discovered filters
├── plp-sort-inventory.json          # All discovered sort options
├── plp-product-card-inventory.json  # Product card element analysis
├── plp-bugs.json                    # Bug tracking and reporting
└── plp-test-results.json            # Test execution results

specs/
└── plp-test-plan.md                 # Generated test strategy

reports/
├── plp-test-report.md               # Final QA report
├── bugs.md                          # Bug report in markdown
├── enhancements.md                  # Improvement suggestions
└── coverage-report.md               # Test coverage analysis
```

## Execution Phases

### Phase 1: Environment Validation ✓
- ✓ Node.js and npm installed
- ✓ Playwright installed
- ✓ .env configuration
- ✓ Project structure created
- [ ] Run test to verify setup

### Phase 2: Dynamic PLP Discovery
**Goal**: Build complete inventory of all accessible PLPs and their structure

```bash
npm run test:plp:discovery
```

**Output**:
- `state/plp-inventory.json` - All discovered categories
- `state/plp-filter-inventory.json` - All discovered filters
- `state/plp-sort-inventory.json` - All discovered sort options
- Screenshots of each PLP discovered

**Expected Discovery**:
- Parent categories
- Subcategories
- Nested categories
- Filter types (checkbox, radio, range, dropdown, custom)
- Filter values for each filter
- Sort options available
- Pagination/load more type

### Phase 3: Test Strategy Generation
**Goal**: Create intelligent test plan based on actual discoveries

**Manual Step**:
1. Review discovered PLPs in `state/plp-inventory.json`
2. Review discovered filters in `state/plp-filter-inventory.json`
3. Create `specs/plp-test-plan.md` with:
   - PLP coverage strategy
   - Filter testing strategy (representative vs. all)
   - Sort testing strategy
   - Responsive testing priority
   - Language testing priority
   - Risk-based prioritization

### Phase 4: Navigation & Structure Testing
**Goal**: Verify PLP accessibility and navigation works correctly

```bash
npm run test:plp:navigation
```

**Tests**:
- Navigate to each discovered PLP
- Verify breadcrumb navigation
- Verify header links
- Verify back/forward buttons
- Verify product counts accurate
- Capture screenshots

### Phase 5: Filter Testing
**Goal**: Validate all filter functionality end-to-end

```bash
npm run test:plp:filters
```

**Representative Testing**:
- Single filter value selection
- Multiple values from same filter
- Multiple filters from different groups
- Filter persistence on page refresh
- Filter URL parameter handling
- Clear individual filter
- Clear all filters
- No-result combinations
- Invalid combinations

**Avoid**: Testing every filter × every value × every combination (combinatorial explosion)

### Phase 6: Sorting Testing
**Goal**: Verify all sort options work correctly

```bash
npm run test:plp:sorting
```

**Tests**:
- Each sort option changes product order
- Sort state reflects in UI
- Sort persists on refresh
- Sort combined with filters
- Default sort is correct

### Phase 7: Product Card Testing
**Goal**: Validate product element consistency and functionality

```bash
npm run test:plp:product-cards
```

**Tests**:
- Product name displays
- Price displays correctly
- Discount percentage accurate
- Product images load
- Rating displays (if applicable)
- Add to cart available and functional
- Wishlist available and functional
- Out-of-stock indication correct
- Product link works
- Quick view available (if applicable)

### Phase 8: Pagination & Load More Testing
**Goal**: Verify page traversal works correctly

```bash
npm run test:plp:pagination
```

**Tests**:
- Pagination buttons work
- Load more button works
- Infinite scroll works (if applicable)
- Product count correct per page
- No duplicate products across pages

### Phase 9: Responsive & Layout Testing
**Goal**: Verify layout adapts correctly to all viewports

```bash
npm run test:plp:responsive
```

**Viewports**:
- Desktop: 1440x900
- Tablet: 768x1024
- Mobile: 390x844

**Tests**:
- Product grid adapts
- Filter sidebar visibility
- Touch target sizes
- No horizontal overflow
- Text wrapping correct
- Images scale correctly

### Phase 10: Language & Localization Testing
**Goal**: Verify English and Arabic versions work correctly

```bash
npm run test:plp:localization
```

**Tests**:
- English version loads (LTR)
- Arabic version loads (RTL)
- Language switching works
- No broken layouts for Arabic
- No untranslated strings
- Currency displays correctly
- Text alignment matches language

### Phase 11: Business Rule Validation
**Goal**: Verify business logic, not just UI mechanics

**Manual Analysis**:
- Product visibility matches category rules
- Product ordering makes sense
- Price consistency (old price > current price)
- Discount calculations correct
- Product labels meaningful and accurate
- Out-of-stock handling appropriate
- Filter results accurate to rules
- Brand filtering works as expected

### Phase 12: Performance Testing
**Goal**: Identify performance issues affecting user experience

**Measurements**:
- Page load time < 3 seconds
- DOM ready time < 2 seconds
- Filter application time
- Sort application time
- Image load times
- API response times

### Phase 13: Bug Investigation & Reporting
**Goal**: Create developer-ready bug reports for all issues found

**For Each Bug**:
1. Confirm reproducibility (Always/Usually/Sometimes/Rare)
2. Capture full evidence:
   - Screenshots
   - Video of reproduction
   - Console errors
   - Network activity
   - HTML/DOM state
3. Create bug report with:
   - Clear title
   - Severity and priority
   - Steps to reproduce
   - Expected vs. actual result
   - Business impact
   - Evidence paths

### Phase 14: Regression Testing
**Goal**: Verify bug fixes don't break other functionality

For each fixed bug:
1. Re-execute original test case
2. Verify fix works
3. Execute related test cases
4. Check for side effects
5. Capture evidence

### Phase 15: Final Reporting
**Goal**: Comprehensive QA summary for stakeholders

**Deliverables**:
- `reports/plp-test-report.md` - Executive summary
- `reports/bugs.md` - All bugs found
- `reports/enhancements.md` - Improvement suggestions
- `reports/coverage-report.md` - Coverage metrics
- `evidence/plp/` - All supporting evidence

## Quick Start

### 1. Setup Environment

```bash
# Copy .env example and update with real URLs
cp .env.example .env

# Install dependencies
npm install

# Verify setup
npm run test:plp:smoke
```

### 2. Run Discovery

```bash
npm run test:plp:discovery
```

Review results in `state/` directory.

### 3. Create Test Strategy

Edit `specs/plp-test-plan.md` with your strategy based on discoveries.

### 4. Run All Tests

```bash
npm run test:plp:full
```

### 5. Review Evidence

Open `./evidence/plp/` directory to review screenshots and logs.

### 6. Generate Reports

```bash
npm run test:plp:report
```

## Test Commands

```bash
# Discovery and smoke tests
npm run test:plp:discovery        # Discover all PLPs, filters, sorts
npm run test:plp:smoke            # Quick smoke test
npm run test:plp:full             # Run all PLP tests

# Specific test suites
npm run test:plp:navigation       # Navigation tests
npm run test:plp:filters          # Filter tests
npm run test:plp:sorting          # Sorting tests
npm run test:plp:product-cards    # Product card tests
npm run test:plp:pagination       # Pagination tests
npm run test:plp:responsive       # Responsive tests
npm run test:plp:localization     # Language tests
npm run test:plp:performance      # Performance tests
npm run test:plp:regression       # Regression tests

# Debug modes
npm run test:plp:headed           # Run tests with browser visible
npm run test:plp:debug            # Debug mode
npm run test:plp:trace            # Collect detailed traces
```

## Configuration

### .env Variables

```env
# URLs
BASE_URL=https://thekanaa.com/en-sa/
BASE_URL_AR=https://thekanaa.com/ar-sa/

# Timeouts
TEST_TIMEOUT=60000              # 60 seconds per test
ACTION_TIMEOUT=10000            # 10 seconds per action
NAVIGATION_TIMEOUT=30000        # 30 seconds for navigation

# Evidence Collection
COLLECT_SCREENSHOTS=true
COLLECT_VIDEOS=false
COLLECT_TRACES=false

# Test Configuration
TEST_ENGLISH=true
TEST_ARABIC=true
TEST_CHROMIUM=true
TEST_FIREFOX=false              # Optional
TEST_WEBKIT=false               # Optional
TEST_DESKTOP=true
TEST_TABLET=true
TEST_MOBILE=true
```

## Key Concepts

### Smart Discovery
The bot doesn't assume structure. It:
- Inspects actual DOM for navigation links
- Identifies filters from common patterns
- Detects filter types (checkbox, radio, etc.)
- Discovers sort options dynamically
- Finds pagination or load-more
- Captures product card structure

### Representative Testing
Not every combination is tested:
- Test ~3 values per filter
- Test ~2 filter combinations per type
- Focus on high-risk scenarios
- Use business rules to prioritize

### Business-Centric QA
Tests verify business requirements:
- Product availability accuracy
- Price consistency
- Discount calculations
- Product ordering logic
- Category relationships
- Out-of-stock handling

### Evidence-Driven
Every finding is supported by evidence:
- Screenshots show the issue
- Videos document reproduction
- Console logs show errors
- Network logs show API issues
- HTML snapshots preserve state

## Important Rules

### Discovery
✓ Discover from actual DOM, not assumptions  
✓ Test real URLs, not mock data  
✓ Wait for dynamic content to load  
✓ Handle both pagination types (pages & load-more)  
✗ Don't assume filter names or values  
✗ Don't hardcode expected counts

### Testing
✓ Navigate like a real user  
✓ Collect evidence for every failure  
✓ Test all viewport sizes  
✓ Test both languages  
✓ Verify business logic, not just mechanics  
✗ Don't test every filter × value combination  
✗ Don't assume behavior without testing

### Reporting
✓ Every bug has reproducible steps  
✓ Every bug has supporting evidence  
✓ Bugs include business impact  
✓ Reproducibility is realistic  
✗ Don't report assumptions as bugs  
✗ Don't skip difficult areas

## Common Issues & Solutions

### Issue: Filters not detected
**Solution**: Check filter container selectors in `PLPDiscovery.ts`, add custom patterns if needed

### Issue: Product cards not found
**Solution**: Inspect page, update product card selectors in `PLPPage.ts`

### Issue: Screenshots not saved
**Solution**: Ensure `./evidence/plp/` directory exists and is writable

### Issue: Tests timing out
**Solution**: Increase `NAVIGATION_TIMEOUT` in `.env` for slower connections

### Issue: Arabic content not appearing
**Solution**: Verify `BASE_URL_AR` is correct, wait for content with `waitForLoadState('networkidle')`

## Data Structures

### PLPCategory
```typescript
{
  id: string;                          // Unique ID
  name: string;                        // Category name
  url: string;                         // Full URL
  type: 'parent' | 'subcategory' | 'nested';
  parentId?: string;
  level: number;                       // Nesting level
  visible: boolean;
  productCount?: number;
  breadcrumb?: string[];
  locale: 'en' | 'ar';
  discoveredAt: string;                // ISO timestamp
}
```

### PLPFilter
```typescript
{
  id: string;
  name: string;                        // e.g., "Price", "Brand", "Size"
  type: 'checkbox' | 'radio' | 'range' | 'dropdown' | 'custom';
  values: FilterValue[];
  applied: string[];                   // Currently applied values
  persistent: boolean;                 // Persists on refresh?
  urlParameter?: string;               // URL query parameter name
  visible: boolean;
  locale: 'en' | 'ar';
}
```

### ProductCard
```typescript
{
  id: string;
  name: string;
  url: string;
  imageUrl?: string;
  price: number;
  oldPrice?: number;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  labels: string[];                    // e.g., ["New", "Sale"]
  inStock: boolean;
  hasWishlist: boolean;
  hasAddToCart: boolean;
  hasQuickView: boolean;
  locale: 'en' | 'ar';
}
```

### BugReport
```typescript
{
  bugId: string;                       // Auto-generated
  title: string;
  severity: 'Critical' | 'Major' | 'Medium' | 'Minor';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  url: string;
  categoryId: string;
  locale: 'en' | 'ar';
  viewport: string;
  browser: string;
  reproducibility: 'Always' | 'Usually' | 'Sometimes' | 'Rare';
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  screenshotPath?: string;
  businessImpact: string;
  status: 'Open' | 'Fixed' | 'Not-Fixable' | 'Duplicate';
  createdAt: string;
  updatedAt: string;
}
```

## Integration with CI/CD

Example GitHub Actions workflow:

```yaml
name: PLP QA Tests

on: [push, pull_request]

jobs:
  plp-qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run PLP discovery
        run: npm run test:plp:discovery
      
      - name: Run PLP tests
        run: npm run test:plp:full
      
      - name: Upload evidence
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: plp-evidence
          path: evidence/plp/
      
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: plp-reports
          path: reports/
```

## Success Criteria

Phase 1 - Discovery:
- ✓ All accessible PLPs discovered
- ✓ All filters identified and categorized
- ✓ All sort options documented
- ✓ Product card structure mapped
- ✓ Pagination type identified

Phase 2 - Testing:
- ✓ All discovered PLPs tested
- ✓ Representative filter combinations tested
- ✓ All sort options verified
- ✓ All responsive viewports tested
- ✓ Both languages tested
- ✓ Evidence collected for all findings

Phase 3 - Reporting:
- ✓ All bugs have reproducible steps
- ✓ All bugs have supporting evidence
- ✓ All bugs have business impact
- ✓ Coverage report complete
- ✓ Improvement suggestions provided

## Next Steps

1. **Verify Setup** - Run `npm run test:plp:smoke`
2. **Discover PLPs** - Run `npm run test:plp:discovery`
3. **Review Inventory** - Check `state/plp-inventory.json`
4. **Create Test Plan** - Edit `specs/plp-test-plan.md`
5. **Execute Tests** - Run `npm run test:plp:full`
6. **Generate Reports** - Review `reports/` directory

---

**Framework Version**: 1.0.0  
**Last Updated**: 2026-09-16  
**Status**: Ready for Phase 1 - Discovery
