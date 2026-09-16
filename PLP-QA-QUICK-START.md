# PLP QA Bot - Quick Start Guide

## 5-Minute Setup

### Step 1: Verify Prerequisites

```bash
# Check Node.js
node --version        # Should be v16+

# Check npm
npm --version        # Should be v8+

# Check Playwright
npx playwright --version
```

### Step 2: Install Dependencies

```bash
cd "C:\Users\ThinkPad T480s Pro\Documents\homepage qa bot"
npm install
```

### Step 3: Configure Environment

```bash
# Copy template
copy .env.pdp.example .env

# Verify settings in .env:
# BASE_URL=https://thekanaa.com/en-sa/
# BASE_URL_AR=https://thekanaa.com/ar-sa/
```

### Step 4: Verify Playwright Browsers

```bash
npx playwright install chromium
```

## Running Discovery

### Phase 1A: Quick Smoke Test

```bash
npm run test:plp:smoke
```

This will:
- Load the homepage
- Verify page connectivity
- Take a screenshot
- Report results

**Expected Output**:
```
PASS tests/plp/plp-smoke.spec.ts (5.2s)
✓ Should load PLP homepage (3.1s)
```

If this passes, continue to Phase 2.

### Phase 1B: Full Discovery

```bash
npm run test:plp:discovery
```

This will:
1. Navigate to the Thekanaa homepage
2. Discover all category links
3. For each category:
   - Navigate to PLP
   - Discover filters
   - Discover sort options
   - Identify product cards
   - Detect pagination type
   - Take screenshots
4. Save all discoveries to `state/` directory

**Expected Duration**: 5-15 minutes depending on number of categories

**Expected Output Files**:
- `state/plp-inventory.json` - All discovered categories
- `state/plp-filter-inventory.json` - All filters discovered
- `state/plp-sort-inventory.json` - All sort options
- `state/plp-product-card-inventory.json` - Product structure
- `evidence/plp/` - Screenshots of each PLP

## Reviewing Discovery Results

### View Discovered PLPs

```bash
# On Windows (PowerShell)
Get-Content state/plp-inventory.json | ConvertFrom-Json | Select-Object -ExpandProperty categories

# On Mac/Linux
cat state/plp-inventory.json | jq '.categories'
```

### View Discovered Filters

```bash
cat state/plp-filter-inventory.json | jq '.summary'
```

### View Evidence

```bash
# Open evidence directory in Explorer/Finder
start evidence/plp/    # Windows
open evidence/plp/     # Mac
nautilus evidence/plp/ # Linux
```

## Troubleshooting Discovery

### Issue: "No categories discovered"

**Cause**: Navigation structure might be different  
**Solution**:
1. Open browser manually: `npm run test:plp:headed`
2. Inspect the homepage HTML
3. Look for category links in `<nav>`, `<header>`, or menus
4. Update selectors in `PLPDiscovery.ts`:

```typescript
// Add to discoverCategories() method
const customSelectors = [
  '.navbar a',
  '.menu-item',
  '[data-role="category-link"]',
];
```

### Issue: "Filters not found on PLP"

**Cause**: Filter container selectors might not match  
**Solution**:
1. Manually navigate to a PLP in headed mode
2. Inspect filter section
3. Note the actual class names
4. Update `PLPDiscovery.ts`:

```typescript
private async discoverFilters(): Promise<PLPFilter[]> {
  const filterContainers = await this.page.locator(
    '[class*="filter"], .sidebar, .filter-panel, [data-module="filters"]'
  ).all();
  // ... rest of implementation
}
```

### Issue: "Products not detected"

**Cause**: Product card selectors might differ  
**Solution**:
1. Open PLP in headed mode
2. Right-click on a product card
3. Inspect element
4. Find the common container
5. Update selector in `PLPDiscovery.ts`:

```typescript
private async discoverProductCards(): Promise<ProductCard[]> {
  const productSelectors = [
    '[class*="product-card"]',
    '.product-item',
    '[data-item-type="product"]',
    '.card-product',
  ];
  // Add the actual selector here
}
```

### Issue: "Timeout waiting for page load"

**Cause**: Slow network or page taking long to load  
**Solution**:
1. Increase timeout in `.env`:
```env
NAVIGATION_TIMEOUT=60000  # 60 seconds
```

2. Or run in headed mode to watch:
```bash
npm run test:plp:headed
```

### Issue: "Cannot find module PLPPage"

**Cause**: TypeScript not compiled  
**Solution**:
```bash
npm run build
npm run test:plp:discovery
```

## Next Steps After Discovery

### 1. Review Inventory (10 minutes)

```bash
# View summary
cat state/plp-inventory.json | jq '.summary'

# Check filter count
cat state/plp-filter-inventory.json | jq '.summary.totalFilters'
```

### 2. Create Test Strategy (30 minutes)

Edit `specs/plp-test-plan.md`:
```markdown
# PLP Test Strategy

## Categories Discovered
- X parent categories
- Y subcategories
- Z nested categories

## Filter Testing Approach
For each filter type:
- Checkbox: Test 3 values per filter
- Radio: Test all values (usually 2-5)
- Range: Test min, max, middle
- Dropdown: Test 3 values

## Risk-Based Prioritization
1. [List most critical PLPs first]
2. [List business-critical filters]
3. [List optional testing]

## Coverage Goals
- Navigation: 100% of discovered PLPs
- Filters: All types, representative values
- Sorting: All options
- Responsive: Mobile, Tablet, Desktop
- Languages: English, Arabic
- Business rules: All critical validations
```

### 3. Run Filter Tests (20 minutes)

```bash
npm run test:plp:filters
```

### 4. Run Responsive Tests (15 minutes)

```bash
npm run test:plp:responsive
```

### 5. Run Language Tests (15 minutes)

```bash
npm run test:plp:localization
```

### 6. Review Bugs Found

```bash
# View bugs
cat state/plp-bugs.json | jq '.'

# Generate bug report
npm run test:plp:report
```

### 7. Generate Final Report

```bash
# All reports in ./reports/
ls reports/
```

## Test Commands Reference

| Command | Purpose | Duration | Output |
|---------|---------|----------|--------|
| `npm run test:plp:smoke` | Quick connectivity check | 30s | 1 test |
| `npm run test:plp:discovery` | Find all PLPs & structure | 10-15m | 4 JSON files |
| `npm run test:plp:navigation` | Test PLP accessibility | 5-10m | Navigation issues |
| `npm run test:plp:filters` | Test filter functionality | 10-20m | Filter issues |
| `npm run test:plp:sorting` | Test sort functionality | 5-10m | Sort issues |
| `npm run test:plp:product-cards` | Test product elements | 5-10m | Product issues |
| `npm run test:plp:pagination` | Test navigation | 5-10m | Pagination issues |
| `npm run test:plp:responsive` | Test all viewports | 15-20m | Responsive issues |
| `npm run test:plp:localization` | Test EN/AR versions | 10-15m | Localization issues |
| `npm run test:plp:performance` | Measure performance | 5-10m | Performance metrics |
| `npm run test:plp:full` | Run all tests | 60-90m | Complete report |
| `npm run test:plp:headed` | See browser during test | variable | Visual verification |
| `npm run test:plp:debug` | Step through code | variable | Debug output |

## Understanding Evidence Structure

After running tests, evidence is organized as:

```
evidence/plp/
├── CAT-001/                    # Category discovery
│   ├── discover.png
│   ├── filters.json
│   └── metadata.json
├── TC-NAV-001/                 # Navigation test
│   ├── step-1-navigate.png
│   ├── step-2-verify.png
│   └── metadata.json
├── TC-FIL-001/                 # Filter test
│   ├── before-filter.png
│   ├── after-filter.png
│   └── results.json
└── BUG-001/                    # Bug evidence
    ├── screenshot.png
    ├── console.json
    └── metadata.json
```

## Common Patterns

### Checking if Discovery Found Categories

```bash
# Windows PowerShell
$categories = Get-Content state/plp-inventory.json | ConvertFrom-Json
$categories.summary.totalCategories

# Mac/Linux
cat state/plp-inventory.json | jq '.summary.totalCategories'
```

### Viewing All Discovered Filters

```bash
# Windows PowerShell
$filters = Get-Content state/plp-filter-inventory.json | ConvertFrom-Json
$filters.filters | Select-Object name, type | Format-Table

# Mac/Linux
cat state/plp-filter-inventory.json | jq '.filters[] | {name, type}'
```

### Checking for Bugs

```bash
# Windows PowerShell
$bugs = Get-Content state/plp-bugs.json | ConvertFrom-Json
$bugs | Where-Object {$_.status -eq "Open"} | Measure-Object

# Mac/Linux
cat state/plp-bugs.json | jq '[.[] | select(.status == "Open")] | length'
```

## Performance Tips

1. **Limit Browsers**: By default tests run on chromium only. To test all:
   ```env
   TEST_FIREFOX=true
   TEST_WEBKIT=true
   ```

2. **Limit Viewports**: To test only desktop:
   ```env
   TEST_TABLET=false
   TEST_MOBILE=false
   ```

3. **Limit Languages**: To test only English:
   ```env
   TEST_ARABIC=false
   ```

4. **Run in Parallel**: Playwright runs multiple tests in parallel:
   ```bash
   npm run test:plp:full -- --workers=4
   ```

5. **Skip Evidence Collection**: If evidence is not needed:
   ```env
   COLLECT_SCREENSHOTS=false
   COLLECT_VIDEOS=false
   ```

## Getting Help

**Issue**: Tests are failing  
**Solution**: Run in headed mode to see what's happening:
```bash
npm run test:plp:headed
```

**Issue**: Need to debug specific test  
**Solution**: Use debug mode:
```bash
npm run test:plp:debug
```

**Issue**: Want to see detailed logs  
**Solution**: Check console output:
```bash
npm run test:plp:discovery 2>&1 | tee discovery.log
```

## Next Phase

Once discovery is complete:

1. ✅ Run `npm run test:plp:discovery`
2. ✅ Review `state/plp-inventory.json`
3. ✅ Edit `specs/plp-test-plan.md` with strategy
4. → Run `npm run test:plp:navigation`
5. → Run `npm run test:plp:filters`
6. → Run `npm run test:plp:full`
7. → Generate `reports/plp-test-report.md`

---

**Status**: Ready to run Phase 1 - Discovery  
**Estimated Time**: 30 minutes for complete discovery + initial testing  
**Next Check**: Run `npm run test:plp:smoke` first to verify setup
