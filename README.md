# Autonomous QA Testing Bot - Thekanaa Homepage

An autonomous, browser-based QA testing bot that behaves like a senior QA engineer testing the Thekanaa ecommerce homepage.

## Project Overview

This bot automatically discovers, tests, verifies, and reports on the Thekanaa homepage across multiple:
- Browsers (Chromium, Firefox, WebKit)
- Viewport sizes (Desktop, Tablet, Mobile)
- Languages (English, Arabic)

The bot executes actual tests in a real browser, collects evidence (screenshots, videos, traces), analyzes failures, and generates developer-ready bug reports.

## Target Application

- **URL (English)**: https://thekanaa.com/en-sa/
- **URL (Arabic)**: https://thekanaa.com/ar-sa/
- **Environment**: Staging/Test
- **Scope**: Homepage only (Phase 1)

## Technology Stack

- **Automation**: Playwright (Chromium, Firefox, WebKit)
- **Language**: TypeScript
- **Runtime**: Node.js
- **Version Control**: Git
- **Reporting**: HTML, JSON, JUnit XML

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`
2. Verify `BASE_URL` is set correctly:
   ```
   BASE_URL=https://thekanaa.com/en-sa/
   BASE_URL_AR=https://thekanaa.com/ar-sa/
   ```
3. Adjust other environment variables as needed

## Test Execution

### Phase 1: Homepage Discovery
```bash
npm run test:discovery
```

### Phase 2: Navigation Testing
```bash
npm run test:navigation
```

### Phase 3: Button Testing
```bash
npm run test:buttons
```

### Phase 4: Link Testing
```bash
npm run test:links
```

### Phase 5: Slider Testing
```bash
npm run test:sliders
```

### Phase 6: Product Card Testing
```bash
npm run test:products
```

### Phase 7: UI Testing
```bash
npm run test:ui
```

### Phase 8: Responsive Testing
```bash
npm run test:responsive
```

### Phase 9: Negative Testing
```bash
npm run test:negative
```

### Phase 10: Regression Testing
```bash
npm run test:regression
```

### Run All Tests
```bash
npm test
```

### Debug Mode (with UI)
```bash
npm run test:debug
```

### Headed Mode (see browser)
```bash
npm run test:headed
```

### With Trace Collection
```bash
npm run test:trace
```

## Project Structure

```
qa-homepage-agent/
├── CLAUDE.md                 # Agent instructions
├── README.md                 # This file
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── playwright.config.ts      # Playwright configuration
├── .env                      # Environment variables (SECRET)
├── .env.example              # Example environment variables
├── .gitignore                # Git ignore rules
│
├── requirements/
│ └── homepage-requirements.md # Requirements document
│
├── specs/
│ └── homepage-test-plan.md  # Test plan and scenarios
│
├── tests/
│ └── homepage/
│   ├── homepage-discovery.spec.ts    # Homepage exploration
│   ├── homepage-navigation.spec.ts   # Navigation testing
│   ├── homepage-buttons.spec.ts      # Button/CTA testing
│   ├── homepage-links.spec.ts        # Link testing
│   ├── homepage-sliders.spec.ts      # Slider/carousel testing
│   ├── homepage-products.spec.ts     # Product card testing
│   ├── homepage-ui.spec.ts           # UI/visual testing
│   ├── homepage-responsive.spec.ts   # Responsive testing
│   ├── homepage-negative.spec.ts     # Negative testing
│   └── homepage-regression.spec.ts   # Regression testing
│
├── pages/
│ └── HomePage.ts             # Page Object Model
│
├── agents/
│ ├── homepage-explorer.md    # Discovery agent
│ ├── homepage-test-planner.md # Test planning agent
│ ├── homepage-executor.md    # Test execution agent
│ ├── homepage-bug-analyzer.md # Bug analysis agent
│ └── homepage-report.md      # Report generation agent
│
├── state/
│ ├── homepage-map.json       # Discovered elements
│ ├── requirements.json        # Test requirements
│ ├── scenarios.json           # Test scenarios
│ ├── test-cases.json         # Generated test cases
│ ├── executions.json         # Test execution results
│ ├── bugs.json               # Detected bugs
│ └── traceability.json       # Requirement-to-bug traceability
│
├── evidence/
│ └── homepage/               # Evidence artifacts
│   └── TC-HOME-XXX/         # Per test case
│     ├── screenshot.png
│     ├── reproduction.webm
│     ├── trace.zip
│     ├── console.log
│     ├── network.har
│     └── metadata.json
│
└── reports/
  └── homepage-qa-report.md   # Final QA report

```

## Test Execution Phases

### Phase 1: Environment Validation ✓
- Environment connectivity
- URL accessibility
- Dependency verification

### Phase 2: Homepage Discovery
- Automated DOM exploration
- Element discovery and mapping
- Interactive component identification

### Phase 3: Homepage Mapping
- Creation of `homepage-map.json`
- Element categorization
- Metadata collection

### Phase 4: Test Plan Generation
- Requirement definition
- Scenario generation
- Test case creation

### Phase 5: Full Test Execution
- Functional testing
- UI/UX testing
- Responsive testing
- Browser compatibility testing
- Negative scenario testing
- Edge case testing

### Phase 6: Bug Detection & Reporting
- Bug identification
- Evidence collection
- Developer-ready bug reports
- Severity/priority classification

### Phase 7: Bug Retesting
- Verification of fixes
- Regression testing
- Traceability confirmation

### Phase 8: Final Reporting
- Comprehensive QA report
- Coverage metrics
- Risk assessment

## Key Features

✓ Autonomous operation
✓ Multi-browser testing
✓ Responsive design testing
✓ Console and network monitoring
✓ Automatic evidence collection (screenshots, videos, traces)
✓ Bug detection and reporting
✓ Traceability matrix
✓ Regression testing
✓ Internationalization (English/Arabic)
✓ Accessibility checks

## Test Evidence

All evidence is automatically collected to `evidence/homepage/` with structure:

```
evidence/homepage/
└── TC-HOME-001/
  ├── screenshot.png         # Visual evidence
  ├── reproduction.webm      # Video reproduction
  ├── trace.zip             # Playwright trace
  ├── console.log           # Console output
  ├── network.har           # Network activity
  └── metadata.json         # Test metadata
```

## Bug Reports

Bugs are stored in `state/bugs.json` with full traceability:

```json
{
  "BUG-HOME-001": {
    "title": "Button not clickable in mobile viewport",
    "severity": "Major",
    "testCaseId": "TC-HOME-023",
    "evidencePath": "evidence/homepage/TC-HOME-023/",
    ...
  }
}
```

## Reporting

Final comprehensive report is generated as:
- `reports/homepage-qa-report.md` (Markdown)
- `test-results/results.json` (JSON)
- `test-results/junit.xml` (JUnit XML)

## Important Notes

- **Safety First**: Tests run against staging/test environment only
- **Evidence-Driven**: Every bug has supporting evidence
- **Traceability**: Every bug links back to the exact test case
- **Autonomous**: Agent makes reasonable QA decisions based on observed behavior
- **No Assumptions**: Documents assumptions when requirements are unclear

## Support

For issues or improvements, contact the QA engineering team.

---

**Last Updated**: 2026-09-16
**Status**: Phase 1 - Environment Setup ✓
