# Claude QA Agent Instructions

## Core Objective

Build and execute an autonomous QA testing bot for the Thekanaa ecommerce homepage that behaves like a senior QA engineer.

The bot must:
1. **Discover** the complete homepage structure
2. **Analyze** all interactive elements
3. **Generate** comprehensive test plans
4. **Execute** tests in real browsers
5. **Collect** evidence (screenshots, videos, traces)
6. **Detect** bugs and anomalies
7. **Create** developer-ready bug reports
8. **Verify** fixes with regression tests
9. **Report** with complete traceability

## Target Application

- **Homepage URL (EN)**: https://thekanaa.com/en-sa/
- **Homepage URL (AR)**: https://thekanaa.com/ar-sa/
- **Environment**: Staging/Test
- **Scope**: Homepage only (Phase 1)
- **Multi-language**: English & Arabic (RTL)
- **Multi-browser**: Chromium, Firefox, WebKit
- **Multi-viewport**: Desktop, Tablet, Mobile

## Execution Sequence

### Phase 1: Environment Validation ✓
- [ ] Verify Node.js and npm installed
- [ ] Verify Playwright installed
- [ ] Verify .env configuration
- [ ] Test URL connectivity
- [ ] Verify evidence directories exist
- [ ] Initialize state JSON files

### Phase 2: Homepage Discovery
- [ ] Open homepage in browser
- [ ] Wait for full page load
- [ ] Capture initial screenshot
- [ ] Map entire DOM structure
- [ ] Identify all visible sections
- [ ] Identify all interactive elements
- [ ] Identify lazy-loaded content
- [ ] Detect console errors
- [ ] Detect network failures
- [ ] Create `state/homepage-map.json`

### Phase 3: Homepage Mapping
Generate `state/homepage-map.json` with:
- Section ID (HOME-SEC-001, etc.)
- Section name and type
- Location on page
- Visible/hidden state
- All interactive elements
- Element coordinates
- Accessibility metadata

Expected sections:
- HEADER (logo, search, nav, cart, account)
- HERO BANNER (image, text, CTAs, carousel)
- CATEGORY SECTION (category cards, links)
- PRODUCT SECTIONS (product cards, sliders)
- PROMOTIONAL SECTIONS (banners, offers)
- NEWSLETTER SECTION (signup form)
- FOOTER (links, social, contact)

### Phase 4: Test Plan Generation
Create:
- `state/requirements.json` - Test requirements
- `state/scenarios.json` - Test scenarios
- `state/test-cases.json` - Detailed test cases

Each test case must have:
```
{
  "testCaseId": "TC-HOME-001",
  "requirementId": "REQ-HOME-001",
  "sectionId": "HOME-SEC-001",
  "elementId": "ELEM-001",
  "feature": "Header Navigation",
  "scenario": "User clicks on menu item",
  "priority": "P0",
  "preconditions": "User on homepage",
  "steps": [...],
  "expectedResult": "Menu expands, navigation works",
  "browsers": ["chromium", "firefox", "webkit"],
  "viewports": ["1440x900", "390x844"],
  "languages": ["en", "ar"]
}
```

### Phase 5: Test Execution
Execute tests in sequence:
1. **Navigation Testing** - All buttons, links, menus
2. **Button/CTA Testing** - Every button on page
3. **Link Testing** - All internal/external links
4. **Slider/Carousel Testing** - Carousels, image sliders
5. **Product Card Testing** - Product widgets
6. **UI/Visual Testing** - Layout, spacing, alignment
7. **Responsive Testing** - Multiple viewports
8. **Browser Testing** - Chromium, Firefox, WebKit
9. **Negative Testing** - Network failures, edge cases
10. **Accessibility Testing** - Keyboard nav, focus, labels

For each test:
- [ ] Execute in browser
- [ ] Monitor console for errors
- [ ] Monitor network for failures
- [ ] Collect evidence if failure
- [ ] Record actual result
- [ ] Compare to expected result

### Phase 6: Bug Detection
For each failure:
- [ ] Confirm reproducibility
- [ ] Collect complete evidence
- [ ] Classify severity/priority
- [ ] Create bug report
- [ ] Link to test case
- [ ] Add to `state/bugs.json`

Bug structure:
```json
{
  "bugId": "BUG-HOME-001",
  "title": "Clear bug title",
  "testCaseId": "TC-HOME-023",
  "severity": "Major|Medium|Minor",
  "priority": "P0|P1|P2|P3",
  "reproducibility": "Always|Usually|Sometimes|Rare",
  "environment": "Chrome 1440x900",
  "browser": "chromium",
  "viewport": "1440x900",
  "language": "en",
  "stepsToReproduce": [...],
  "expectedResult": "...",
  "actualResult": "...",
  "evidencePath": "evidence/homepage/TC-HOME-023/",
  "consoleErrors": [...],
  "networkErrors": [...],
  "affectedElements": [...],
  "relatedRegressionTests": [...]
}
```

### Phase 7: Bug Retesting
When marked FIXED:
- [ ] Re-execute original test case
- [ ] Verify fix with fresh evidence
- [ ] Execute related regression tests
- [ ] Update bug status (FIXED or NOT FIXED)
- [ ] Add new evidence if still failing

### Phase 8: Final Reporting
Generate `reports/homepage-qa-report.md`:

- Executive Summary
- Test Coverage
  - Sections discovered
  - Elements tested
  - Scenarios covered
  - Browsers tested
  - Viewports tested
- Test Results
  - Total tests
  - Passed/Failed/Blocked
  - Pass rate %
- Defects by Severity
  - Critical (blocking)
  - Major (significant functionality)
  - Medium (noticeable issue)
  - Minor (cosmetic)
  - Trivial (documentation)
- Defects by Category
  - Functional issues
  - UI/UX issues
  - Responsive issues
  - Browser compatibility
  - Accessibility issues
- Evidence Summary
  - Screenshots
  - Videos
  - Traces
  - Console/Network logs
- Recommendation
  - READY
  - READY WITH KNOWN ISSUES
  - NOT READY

## Critical Decisions

### When to Fail a Test
A test FAILS when:
- Expected behavior does NOT occur
- Element not found/visible/clickable
- Wrong URL navigation
- Console error related to functionality
- Network failure related to functionality
- Visual defect confirmed

### When to Create a Bug
A bug is created when:
- Issue is ACTUALLY observed (not assumed)
- Reproducibility is confirmed
- Issue is not temporary/environmental
- Clear evidence exists
- Expected behavior is known

### When to Pass a Test
A test PASSES when:
- All steps executed successfully
- Expected result achieved
- No console/network errors
- No visual defects

## Important Constraints

### Safety
- [ ] Never test production destructively
- [ ] Use staging environment only
- [ ] Do not modify real customer data
- [ ] Do not use real payment cards
- [ ] Do not expose credentials in reports

### Evidence Quality
- [ ] Every failure has supporting evidence
- [ ] Screenshots include full context
- [ ] Videos show complete interaction
- [ ] Traces capture browser state
- [ ] Console logs recorded
- [ ] Network activity documented

### Traceability
- [ ] Every bug links to test case
- [ ] Every test case links to requirement
- [ ] Every requirement is testable
- [ ] Every element is discoverable
- [ ] Complete chain of custody

## Autonomous Operation

The agent MUST make reasonable QA decisions:

✓ Discover elements from actual DOM
✓ Classify sections by type/position
✓ Identify interactive patterns
✓ Generate scenarios based on UI
✓ Test reasonable edge cases
✓ Correlate failures to root cause
✓ Classify severity appropriately

✗ Do NOT wait for manual input for standard decisions
✗ Do NOT assume behavior not visible
✗ Do NOT stop after first bug
✗ Do NOT skip difficult sections
✗ Do NOT guess expected behavior

## File Management

### State Files (JSON)
- `state/homepage-map.json` - Element discovery
- `state/requirements.json` - Test requirements
- `state/scenarios.json` - Test scenarios
- `state/test-cases.json` - Test cases
- `state/executions.json` - Test results
- `state/bugs.json` - Bug tracking
- `state/traceability.json` - Requirement-to-bug matrix

### Evidence Files
```
evidence/homepage/TC-HOME-XXX/
├── screenshot.png         # Single screenshot
├── fullpage.png          # Full-page screenshot
├── reproduction.webm     # Video of issue
├── trace.zip            # Playwright trace
├── console.log          # Console output
├── network.har          # Network activity
└── metadata.json        # Test metadata
```

### Reports
```
reports/
└── homepage-qa-report.md # Final QA report
```

## Configuration

`.env` file contains:
```
BASE_URL=https://thekanaa.com/en-sa/
BASE_URL_AR=https://thekanaa.com/ar-sa/
ENVIRONMENT=staging
HEADLESS=true
SLOW_MO=100
```

Never commit `.env` to Git.
Always document required env vars in `.env.example`.

## Execution Commands

```bash
npm run test:discovery    # Phase 2: Discovery
npm run test:navigation   # Phase 5: Navigation tests
npm run test:buttons      # Phase 5: Button tests
npm run test:links        # Phase 5: Link tests
npm run test:sliders      # Phase 5: Slider tests
npm run test:products     # Phase 5: Product tests
npm run test:ui           # Phase 5: UI tests
npm run test:responsive   # Phase 5: Responsive tests
npm run test:negative     # Phase 5: Negative tests
npm run test:regression   # Phase 7: Regression tests

npm test                  # Run all phases
npm run test:headed       # See browser during test
npm run test:trace        # Collect traces
```

## Success Criteria

Phase complete when:
- [ ] All steps marked complete
- [ ] State JSON files generated
- [ ] Evidence collected for failures
- [ ] Bug reports created
- [ ] Report generated
- [ ] No blocking issues

Do NOT skip phases or steps.
Do NOT generate fake evidence.
Do NOT assume behavior - test it.

---

**Agent Version**: 1.0.0
**Target**: Thekanaa Homepage (English & Arabic)
**Last Updated**: 2026-09-16
