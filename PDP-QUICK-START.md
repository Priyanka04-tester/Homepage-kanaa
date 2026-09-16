# PDP QA Bot - Quick Start Guide

Get started testing your first PDP in 5 minutes.

## Prerequisites

- Node.js 16+ installed
- npm installed
- Access to Thekanaa website
- A valid PDP URL to test

## 1. Installation (30 seconds)

```bash
# Install dependencies (already done if you ran npm install)
npm install

# Verify Playwright is installed
npx playwright install chromium
```

## 2. Configuration (1 minute)

### Option A: Environment Variable (Recommended)

```bash
# Set PDP URL in your terminal
export PDP_URL="https://thekanaa.com/en-sa/p/test-product"

# Or on Windows:
set PDP_URL=https://thekanaa.com/en-sa/p/test-product
```

### Option B: Environment File

```bash
# Create .env file
echo 'PDP_URL=https://thekanaa.com/en-sa/p/test-product' > .env

# Or copy template and edit
cp .env.pdp.example .env
# Edit .env with your PDP URL
```

## 3. Your First Discovery (2 minutes)

Run discovery to see what's on the PDP:

```bash
# Replace with your PDP URL
PDP_URL="https://thekanaa.com/en-sa/p/your-test-product" npm run test:pdp:discovery
```

### What Happens

```
✓ Discovers all PDP sections
✓ Detects product type
✓ Identifies all elements
✓ Captures screenshots
✓ Measures performance

Results saved to: reports/pdp/discovery.json
```

### View Results

```bash
# View discovered structure
cat reports/pdp/discovery.json

# View classification
cat reports/pdp/classification.json

# View screenshots
open reports/evidence/DISCOVERY/viewport-top.png
```

## 4. Run Smoke Tests (2 minutes)

Quick validation of critical functionality:

```bash
PDP_URL="https://thekanaa.com/en-sa/p/your-test-product" npm run test:pdp:smoke
```

### Tests Included

```
✓ Page Load and Basic Elements
✓ Product Information Accuracy  
✓ Add to Cart Functionality
✓ Header Navigation Elements
✓ Product Images Display
✓ No Critical Console Errors
✓ Mobile Responsiveness
```

## 5. View Report

```bash
# Open HTML report in browser
npx playwright show-report playwright-report/pdp

# View test results
cat test-results/pdp/results.json
```

## Common Commands

```bash
# Discovery - Understand the PDP
PDP_URL="..." npm run test:pdp:discovery

# Smoke - Quick validation
PDP_URL="..." npm run test:pdp:smoke

# Full - Comprehensive testing
PDP_URL="..." npm run test:pdp:full

# Watch - See browser during testing
PDP_URL="..." npm run test:pdp:headed

# Debug - Step through tests
PDP_URL="..." npm run test:pdp:debug

# All browsers/viewports
# (Tests run automatically across all configured browsers and viewports)
```

## Real-World Example

### Test a Simple Product

```bash
# Product: Men's T-Shirt
# URL: https://thekanaa.com/en-sa/p/mens-tshirt-blue

# Step 1: Discover
PDP_URL="https://thekanaa.com/en-sa/p/mens-tshirt-blue" npm run test:pdp:discovery

# Step 2: Check results
cat reports/pdp/discovery.json | grep -i "productType"
# Output: "productType": "simple"

# Step 3: Smoke test
PDP_URL="https://thekanaa.com/en-sa/p/mens-tshirt-blue" npm run test:pdp:smoke

# Step 4: View report
npx playwright show-report playwright-report/pdp
```

### Test a Configurable Product

```bash
# Product: Shoes with sizes
# URL: https://thekanaa.com/en-sa/p/shoes-all-sizes

# Step 1: Discover
PDP_URL="https://thekanaa.com/en-sa/p/shoes-all-sizes" npm run test:pdp:discovery

# Step 2: Check results
cat reports/pdp/discovery.json | grep -i "attributes"
# Output shows detected sizes and colors

# Step 3: Full test (auto-tests all variants)
PDP_URL="https://thekanaa.com/en-sa/p/shoes-all-sizes" npm run test:pdp:full

# Step 4: Check for variant-specific issues
cat reports/pdp/qa-report.md | grep -i "variant"
```

### Test a Bundle Product

```bash
# Product: Electronics Bundle
# URL: https://thekanaa.com/en-sa/p/electronics-bundle

# Step 1: Discover
PDP_URL="https://thekanaa.com/en-sa/p/electronics-bundle" npm run test:pdp:discovery

# Step 2: Full test (auto-tests bundle configuration)
PDP_URL="https://thekanaa.com/en-sa/p/electronics-bundle" npm run test:pdp:full

# Step 3: View bundle-specific results
cat reports/pdp/qa-report.md | grep -i "bundle"
```

## File Locations

```
reports/
├── pdp/
│   ├── discovery.json           # What was found on PDP
│   ├── classification.json       # Product type and features
│   └── qa-report.md             # Final report
│
├── evidence/
│   └── TEST-ID/                 # Evidence for each test
│       ├── screenshot.png
│       ├── console.json
│       └── metadata.json
│
└── bugs/
    └── BUG-PDP-0001.json        # Bug reports (if issues found)

test-results/
└── pdp/
    ├── results.json             # Test execution results
    └── junit.xml                # JUnit format

playwright-report/
└── pdp/                         # Interactive HTML report
```

## Troubleshooting

### Issue: "PDP_URL required"

**Solution:** Always set PDP_URL before running tests:

```bash
# Set it first
export PDP_URL="https://thekanaa.com/en-sa/p/your-product"

# Then run tests
npm run test:pdp:smoke
```

### Issue: Tests timeout

**Solution:** Increase timeout:

```bash
# Edit pdp-playwright.config.ts
# Change: actionTimeout: 15000 (from 10000)
# Change: navigationTimeout: 45000 (from 30000)
```

### Issue: Elements not found in discovery

**Solution:** Verify PDP is accessible:

```bash
# Open PDP in browser to verify it exists
# Check if you're behind a proxy or VPN
# Try a different product

# Test connectivity
curl -I "https://thekanaa.com/en-sa/p/your-product"
```

### Issue: "Cannot find reports directory"

**Solution:** Create reports directory:

```bash
mkdir -p reports/{pdp,evidence,bugs}
chmod 755 reports
```

## Next Steps

1. ✅ **Run Discovery** - Understand your PDP
2. ✅ **Run Smoke Tests** - Validate critical features
3. ✅ **Run Full Suite** - Comprehensive testing
4. ✅ **Review Reports** - Check results and evidence
5. ✅ **Check for Bugs** - Review generated bug reports
6. ✅ **Integrate with CI/CD** - Automate testing

## Advanced Usage

### Multi-Product Testing

```bash
# Test multiple products
for product in "product-1" "product-2" "product-3"; do
  echo "Testing: $product"
  PDP_URL="https://thekanaa.com/en-sa/p/$product" npm run test:pdp:smoke
  echo "---"
done
```

### CI/CD Integration

### GitHub Actions

```yaml
name: PDP Testing

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - run: npm install
      - run: npx playwright install chromium
      
      - name: Run PDP Tests
        run: PDP_URL="${{ secrets.TEST_PDP_URL }}" npm run test:pdp:smoke
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: pdp-reports
          path: reports/
```

### Using Environment Variables in CI

```bash
# GitHub Actions
# Add secret: Settings → Secrets → TEST_PDP_URL
# Then use in workflow: ${{ secrets.TEST_PDP_URL }}

# GitLab CI
# Add variable: Settings → CI/CD → Variables → TEST_PDP_URL
# Then use in .gitlab-ci.yml: $TEST_PDP_URL

# Jenkins
# Add as environment variable
# Use in shell: $TEST_PDP_URL
```

## Documentation

- **Complete Guide**: See [PDP-QA-BOT.md](./PDP-QA-BOT.md)
- **Project Structure**: See [PDP-PROJECT-STRUCTURE.md](./PDP-PROJECT-STRUCTURE.md)
- **API Reference**: See [PDP-QA-BOT.md#api-reference](./PDP-QA-BOT.md#api-reference)

## Getting Help

### Check Logs

```bash
# View latest test results
cat test-results/pdp/results.json

# View error details
tail -f test-results/pdp/junit.xml
```

### Check Evidence

```bash
# View screenshots taken
ls -la reports/evidence/*/screenshot.png

# View console errors
cat reports/evidence/*/console.json

# View network activity
cat reports/evidence/*/network.json
```

### View Playwright Report

```bash
# Open interactive HTML report
npx playwright show-report playwright-report/pdp

# Or open file directly
open playwright-report/pdp/index.html  # macOS
xdg-open playwright-report/pdp/index.html  # Linux
start playwright-report/pdp/index.html  # Windows
```

## Tips & Tricks

1. **Test While Viewing**
   ```bash
   PDP_URL="..." npm run test:pdp:headed  # Watch browser
   ```

2. **Debug Specific Test**
   ```bash
   PDP_URL="..." npm run test:pdp:debug  # Step through
   ```

3. **Collect Full Traces**
   ```bash
   PDP_URL="..." npm run test:pdp:trace  # Detailed traces
   ```

4. **Run Specific Test File**
   ```bash
   PDP_URL="..." npx playwright test tests/pdp/pdp-smoke.spec.ts --config=pdp-playwright.config.ts
   ```

5. **Use Different Browsers**
   Tests automatically run all browsers. To use only one:
   ```bash
   PDP_URL="..." npx playwright test --project=chromium-desktop-1440
   ```

## Test Results Interpretation

### All Tests Pass ✅

```
15 passed (8s)
Recommendation: PASS
```

Action: Approve the PDP for launch.

### Some Tests Fail ⚠️

```
12 passed, 3 failed
Recommendation: PASS_WITH_OBSERVATIONS
```

Action: Review bug reports and decide if critical.

### Critical Tests Fail ❌

```
8 passed, 7 failed
Recommendation: FAIL
```

Action: Fix issues before launch. Bugs documented in `reports/bugs/`.

## Common Test Modes

| Mode | When to Use | Duration |
|------|-----------|----------|
| Discovery | First time with new PDP | 1-2 min |
| Smoke | Quick validation | 2-3 min |
| Full | Before launch | 10-15 min |
| Regression | After changes | 10-15 min |

---

**Ready to test?**

```bash
# Set your PDP URL
export PDP_URL="https://thekanaa.com/en-sa/p/your-product"

# Run discovery
npm run test:pdp:discovery

# Then run smoke tests
npm run test:pdp:smoke

# View report
npx playwright show-report playwright-report/pdp
```

Happy testing! 🚀
