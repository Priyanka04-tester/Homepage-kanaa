# Setup Guide - Autonomous QA Bot for Thekanaa

## Quick Start (5 minutes)

### Step 1: Initial Setup
The following files have been created in your `Documents/homepage qa bot` folder:
- ✓ README.md
- ✓ CLAUDE.md
- ✓ package.json
- ✓ tsconfig.json
- ✓ playwright.config.ts
- ✓ .env.example
- ✓ .gitignore

### Step 2: Create .env File
Create a new file in your project root called `.env` with:

```
# Thekanaa ecommerce homepage QA test environment
BASE_URL=https://thekanaa.com/en-sa/
BASE_URL_AR=https://thekanaa.com/ar-sa/

# Environment
ENVIRONMENT=staging
NODE_ENV=test

# Logging
DEBUG=false
VERBOSE=true

# Timeouts (milliseconds)
NAVIGATION_TIMEOUT=30000
ELEMENT_TIMEOUT=10000
NETWORK_TIMEOUT=30000

# Test Configuration
PARALLEL_TESTS=1
RETRIES=0
HEADLESS=true
SLOW_MO=100

# Evidence Collection
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=true
TRACE_ON_FAILURE=true
CONSOLE_LOGGING=true
NETWORK_LOGGING=true

# Performance
PERFORMANCE_MONITORING=true
IMAGE_LOADING_TIMEOUT=15000
```

Or copy from `.env.example`:
```bash
cp .env.example .env
```

### Step 3: Install Dependencies
```bash
npm install
```

This will install:
- Playwright (browser automation)
- TypeScript
- Node.js dependencies

**Note**: If you get symlink errors on Windows, try:
```bash
npm install --legacy-peer-deps
```

Or use Windows Subsystem for Linux (WSL) for better npm compatibility.

### Step 4: Verify Setup
```bash
npx playwright --version
```

Should show: `Version X.XX.X`

### Step 5: Verify Connectivity
```bash
curl https://thekanaa.com/en-sa/ -I
```

Should return: `HTTP/1.1 200 OK` (or similar)

## Project Structure

After setup, your project should look like:

```
homepage qa bot/
├── README.md                 ← Start here
├── CLAUDE.md                 ← Agent instructions
├── SETUP-GUIDE.md           ← This file
├── package.json              ← Dependencies
├── package-lock.json         ← Auto-generated
├── tsconfig.json             ← TypeScript config
├── playwright.config.ts      ← Playwright config
├── .env                      ← Your environment vars (DO NOT COMMIT)
├── .env.example              ← Template (safe to commit)
├── .gitignore                ← Git ignore rules
│
├── node_modules/             ← Dependencies (auto-created)
│
├── requirements/             ← Create during discovery
├── specs/                    ← Create during planning
├── tests/homepage/           ← Create during generation
│   ├── homepage-discovery.spec.ts
│   ├── homepage-navigation.spec.ts
│   └── ... (other test files)
│
├── pages/                    ← Page Object Model
├── agents/                   ← Agent instructions
├── state/                    ← JSON state files
│   ├── homepage-map.json
│   ├── requirements.json
│   ├── test-cases.json
│   └── ... (other state files)
│
├── evidence/                 ← Test evidence
│   └── homepage/
│       └── TC-HOME-XXX/
│           ├── screenshot.png
│           ├── reproduction.webm
│           └── ...
│
└── reports/                  ← QA reports
    └── homepage-qa-report.md
```

## Execution Guide

### Phase 1: Environment Validation ✓
Already complete - you've set up the project.

### Phase 2: Homepage Discovery

Run the discovery test:
```bash
npm run test:discovery
```

This will:
- Open the Thekanaa homepage
- Explore the DOM
- Identify all sections
- Identify all interactive elements
- Create `state/homepage-map.json`
- Generate screenshots

**Expected output**:
```
✓ Discovery complete
Sections discovered: 8
Elements discovered: 42
Buttons found: 15
Links found: 28
Sliders found: 3
Product widgets: 2
```

### Phase 3: Full Test Execution

Run individual test suites:
```bash
npm run test:navigation     # Test all navigation
npm run test:buttons        # Test all buttons
npm run test:links          # Test all links
npm run test:sliders        # Test carousels
npm run test:products       # Test product cards
npm run test:ui             # Test UI/layout
npm run test:responsive     # Test responsive design
npm run test:negative       # Test error scenarios
npm run test:regression     # Test regressions
```

Or run all tests:
```bash
npm test
```

### Phase 4: View Results

After tests complete, open the report:
```bash
# HTML report (visual)
open test-results/index.html

# JSON results
cat test-results/results.json

# Markdown report
cat reports/homepage-qa-report.md
```

## Troubleshooting

### Issue: npm install fails with symlink errors
**Solution**: Use WSL or Windows native console with Administrator privileges
```bash
# If using WSL
npm install

# If using native Windows CMD with Admin
npm install --legacy-peer-deps --no-save
```

### Issue: Browser fails to launch
**Solution**: Playwright browsers not installed
```bash
npx playwright install
```

### Issue: Homepage not loading
**Solution**: Verify URL and internet connection
```bash
curl https://thekanaa.com/en-sa/ -I
```

If fails, update `BASE_URL` in `.env`

### Issue: Tests hang/timeout
**Solution**: Increase timeouts in `.env`
```
NAVIGATION_TIMEOUT=60000
NETWORK_TIMEOUT=60000
```

## Configuration Details

### Browsers Tested
- **Chromium**: Default browser (85% market share)
- **Firefox**: Alternative engine
- **WebKit**: Safari equivalent

### Viewports Tested
- **Desktop**: 1440x900, 1920x1080
- **Tablet**: 1024x768, 768x1024
- **Mobile**: 390x844, 393x852, 412x915

### Languages
- English (en-SA): https://thekanaa.com/en-sa/
- Arabic (ar-SA): https://thekanaa.com/ar-sa/

## Git Setup

Initialize git (optional but recommended):
```bash
git init
git add .
git commit -m "Initial QA bot setup"
```

`.gitignore` already excludes:
- `node_modules/`
- `.env` (secrets)
- `test-results/`
- `evidence/`
- `*.log`

## Next Steps

After setup is complete:

1. **Run discovery**:
   ```bash
   npm run test:discovery
   ```

2. **Review homepage map**:
   ```
   state/homepage-map.json
   ```

3. **Run full tests**:
   ```bash
   npm test
   ```

4. **Review results**:
   ```
   test-results/index.html
   reports/homepage-qa-report.md
   ```

5. **Create issues for any bugs found**:
   ```
   state/bugs.json
   ```

## Support

For issues:
1. Check `.env` is configured correctly
2. Verify `BASE_URL` is accessible
3. Run `npx playwright install` to ensure browsers are available
4. Check `test-results/results.json` for detailed errors

## Environment Validation Checklist

- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] .env file created with BASE_URL
- [ ] `npm install` completed without errors
- [ ] `npx playwright --version` shows version
- [ ] `curl BASE_URL -I` returns 200 status
- [ ] `npm run test:discovery` runs without crashing

---

**Setup Status**: Phase 1 - Environment Validation
**Ready for**: Phase 2 - Homepage Discovery
**Next Command**: `npm run test:discovery`

Questions? See README.md or CLAUDE.md
