/**
 * PHASE 4 — Test plan generation.
 *
 * Reads state/<locale>/homepage-map.json (produced by tests/homepage/homepage-discovery.spec.js,
 * locale selected via the HOMEPAGE_LOCALE env var this script also reads — see utils/qaState.js)
 * and derives requirements/scenarios/test-cases/traceability. Test cases are written at
 * the scenario/pattern level (e.g. "every link in this section resolves"), not one literal
 * row per DOM element — with 240+ buttons and 442 images on this homepage, a catalog with
 * one row per element would be unreadable and wouldn't reflect how a QA engineer actually
 * scopes a plan. Each test case still covers every concrete instance: execution specs apply
 * it data-driven over homepage-map.json, so "test every button" is satisfied at run time,
 * not by pre-listing every button here.
 */
const fs = require('fs');
const path = require('path');
const { LOCALE, ID_PREFIX, BASE_URL, STATE_DIR, loadHomepageMap, isFirstPartyUrl } = require('../utils/qaState');

const REQUIREMENTS_DIR = path.join(__dirname, '..', 'requirements');
const SPECS_DIR = path.join(__dirname, '..', 'specs');

const homepageMap = loadHomepageMap();

let reqSeq = 0, scSeq = 0, tcSeq = 0;
const nextReq = () => `REQ-HOME-${ID_PREFIX}-${String(++reqSeq).padStart(3, '0')}`;
const nextSc = () => `SC-HOME-${ID_PREFIX}-${String(++scSeq).padStart(3, '0')}`;
const nextTc = () => `TC-HOME-${ID_PREFIX}-${String(++tcSeq).padStart(3, '0')}`;

const requirements = [];
const scenarios = [];
const testCases = [];
const traceability = [];

function addUnit({ sectionId, elementId = null, feature, requirementText, scenarioText, priority, preconditions, testData, steps, expectedResult }) {
  const reqId = nextReq();
  const scId = nextSc();
  const tcId = nextTc();

  requirements.push({ id: reqId, sectionId, feature, text: requirementText });
  scenarios.push({ id: scId, requirementId: reqId, sectionId, text: scenarioText, priority });
  testCases.push({
    id: tcId,
    requirementId: reqId,
    sectionId,
    elementId,
    scenarioId: scId,
    feature,
    scenario: scenarioText,
    priority,
    preconditions,
    testData,
    steps,
    expectedResult,
    actualResult: null,
    status: 'NOT_EXECUTED',
    environment: `production (${BASE_URL}), locale=${LOCALE}`,
    browser: null,
    viewport: null,
    executionId: null,
    evidencePath: `evidence/homepage/${LOCALE}/${tcId}/`,
  });
  traceability.push({ requirementId: reqId, sectionId, elementId, scenarioId: scId, testCaseId: tcId, bugIds: [] });
  return tcId;
}

// --- Per-section, data-driven-by-category test cases ---
for (const section of homepageMap.sections) {
  const counts = section.elementCounts;
  if (!counts) continue; // footer placeholder section with no captured elements
  const sid = section.id;
  const sname = section.name || '(untitled section)';

  if (counts.links > 0) {
    addUnit({
      sectionId: sid,
      feature: `${sname} — links`,
      requirementText: `Every link in "${sname}" (${counts.links} discovered) must navigate to its declared href without a 404, unexpected redirect, or broken destination.`,
      scenarioText: `For each link in section ${sid}, click it, confirm the resulting URL/page matches the href's intent, then navigate back.`,
      priority: sid.endsWith('-001') || sid.endsWith('-002') ? 'P1' : 'P2',
      preconditions: 'Homepage loaded at HOMEPAGE_BASE_URL (production) + locale path; guest session.',
      testData: `state/${LOCALE}/homepage-map.json → sections[id=${sid}].elements.links`,
      steps: [
        'Load the homepage.',
        `Locate section ${sid} ("${sname}").`,
        'For each link: assert visible+enabled, click, assert no 4xx/5xx navigation and no new console error, assert back navigation restores the homepage.',
      ],
      expectedResult: 'All links resolve to a live page matching their href; no console errors or failed navigation requests are introduced.',
    });
  }

  if (counts.buttons > 0) {
    addUnit({
      sectionId: sid,
      feature: `${sname} — buttons`,
      requirementText: `Every interactive button in "${sname}" (${counts.buttons} discovered) must be visible, enabled (unless intentionally disabled), and produce its expected effect when clicked.`,
      scenarioText: `For each button in section ${sid}, verify pre-click state, click, and verify the expected UI/state change with no console or network error.`,
      priority: 'P2',
      preconditions: 'Homepage loaded at HOMEPAGE_BASE_URL (production) + locale path; guest session.',
      testData: `state/${LOCALE}/homepage-map.json → sections[id=${sid}].elements.buttons`,
      steps: [
        'Load the homepage.',
        `Locate section ${sid} ("${sname}").`,
        'For each button: assert accessible name is non-empty, assert visible/enabled state matches design intent, click, assert expected state change, assert no new console error.',
      ],
      expectedResult: 'Every button performs its expected action; disabled buttons stay disabled and are not treated as failures.',
    });
  }

  if (counts.sliders > 0) {
    addUnit({
      sectionId: sid,
      feature: `${sname} — carousel`,
      requirementText: `The carousel in "${sname}" must support first/next/previous/last slide navigation, looping, and (if present) pagination indicators, without blank slides, stuck state, or broken CTAs.`,
      scenarioText: 'Exercise Next repeatedly to the last slide and confirm it loops or stops correctly; exercise Previous back to the first slide; rapid-click Next/Previous; click any slide CTA/link.',
      priority: 'P1',
      preconditions: 'Homepage loaded; carousel visible in viewport.',
      testData: `state/${LOCALE}/homepage-map.json → sections[id=${sid}].elements.sliders`,
      steps: [
        'Load the homepage and scroll the carousel into view.',
        'Click Next N times (N = detected slide/link count) and screenshot each slide.',
        'Click Previous back to the first slide.',
        'Rapid-click Next 5x in quick succession; confirm the carousel settles on a valid, non-blank slide.',
        'Click each pagination indicator (if any) and confirm the matching slide shows.',
        'Click a slide CTA/link where present and confirm navigation (flag any href="#" placeholder as a finding rather than a pass).',
      ],
      expectedResult: 'No blank/duplicate slides, no stuck navigation, pagination indicators (if present) reflect the active slide, and CTAs navigate to real destinations.',
    });
  }

  if (counts.productCards > 0) {
    addUnit({
      sectionId: sid,
      feature: `${sname} — product cards`,
      requirementText: `Product cards in "${sname}" (${counts.productCards} sampled) must show a consistent image, name, price, and working wishlist/add-to-cart/navigation controls.`,
      scenarioText: 'Sample 3 representative cards (first, middle, last of the sampled set): verify image loads, name is fully visible (no unexpected clipping), price is present, wishlist toggles, Add to Cart succeeds, and clicking the card navigates to a matching PDP.',
      priority: 'P1',
      preconditions: 'Homepage loaded; guest session; widget scrolled into view.',
      testData: `state/${LOCALE}/homepage-map.json → sections[id=${sid}].elements.productCards`,
      steps: [
        'Load the homepage and scroll the widget into view.',
        'Pick first/middle/last sampled card.',
        'Assert image is not broken (naturalWidth > 0).',
        'Assert product name is present and not truncated in a way that hides essential info.',
        'Assert a price is displayed.',
        'Click the wishlist control and confirm a visible state change.',
        'Click Add to Cart and confirm a cart-updated confirmation appears.',
        'Click the card and confirm the destination PDP matches the card\'s product name.',
      ],
      expectedResult: 'Card content is complete and consistent; wishlist/add-to-cart succeed; PDP navigation lands on the matching product.',
    });
  }

  if (counts.images > 0) {
    addUnit({
      sectionId: sid,
      feature: `${sname} — images`,
      requirementText: `All images in "${sname}" (${counts.images} discovered) must load successfully (no broken images) and carry meaningful alt text.`,
      scenarioText: `Assert every image in section ${sid} has naturalWidth > 0 once loaded, and that decorative-vs-informational alt text follows a consistent pattern.`,
      priority: homepageMap.discoveredIssues.some((i) => i.type === 'broken-image') ? 'P1' : 'P3',
      preconditions: 'Homepage loaded; section scrolled into view (image loading is native-lazy).',
      testData: `state/${LOCALE}/homepage-map.json → sections[id=${sid}].elements.images`,
      steps: [
        'Scroll the section fully into view to trigger native lazy-loading.',
        'For each image, assert complete=true and naturalWidth > 0.',
        'Spot-check alt text is non-generic for informational images (product/banner images).',
      ],
      expectedResult: 'Zero broken images after the section has been scrolled into view.',
    });
  }

  if (counts.inputs > 0) {
    addUnit({
      sectionId: sid,
      feature: `${sname} — inputs`,
      requirementText: `Form inputs in "${sname}" must accept valid input and behave predictably for empty/boundary/invalid values.`,
      scenarioText: 'Enter typical, empty, very long, and special-character values; confirm no crash, no console error, and reasonable UI feedback.',
      priority: 'P2',
      preconditions: 'Homepage loaded.',
      testData: `state/${LOCALE}/homepage-map.json → sections[id=${sid}].elements.inputs`,
      steps: [
        'Locate each input in the section.',
        'Type a typical query/value and confirm expected behavior (e.g. search suggestions).',
        'Clear and submit empty; confirm no crash.',
        'Type a very long string (200+ chars) and Unicode/Arabic text; confirm no overflow/crash.',
      ],
      expectedResult: 'Inputs handle all cases gracefully with no console errors or broken layout.',
    });
  }
}

// --- Global, cross-cutting requirements ---
function addGlobal({ feature, requirementText, scenarioText, priority, preconditions, testData, steps, expectedResult }) {
  return addUnit({ sectionId: 'HOME-GLOBAL', feature, requirementText, scenarioText, priority, preconditions, testData, steps, expectedResult });
}

const VIEWPORTS = [
  { name: 'Desktop 1440x900', width: 1440, height: 900 },
  { name: 'Desktop 1920x1080', width: 1920, height: 1080 },
  { name: 'Tablet 1024x768', width: 1024, height: 768 },
  { name: 'Tablet 768x1024', width: 768, height: 1024 },
  { name: 'Mobile 390x844', width: 390, height: 844 },
  { name: 'Mobile 393x852', width: 393, height: 852 },
  { name: 'Mobile 412x915', width: 412, height: 915 },
];
for (const vp of VIEWPORTS) {
  addGlobal({
    feature: `Responsive — ${vp.name}`,
    requirementText: `The homepage must render without horizontal overflow, overlapping elements, or clipped CTAs at ${vp.name} (${vp.width}x${vp.height}).`,
    scenarioText: `Load the homepage at ${vp.width}x${vp.height} and check header, hero, category grid, product widgets, footer for layout breakage.`,
    priority: 'P1',
    preconditions: `Viewport set to ${vp.width}x${vp.height}.`,
    testData: 'N/A',
    steps: [
      `Set viewport to ${vp.width}x${vp.height}.`,
      'Load the homepage.',
      'Check for horizontal scroll on body/html.',
      'Screenshot header, hero, first two product widgets, and footer.',
      'Confirm no element overlap or CTA clipping.',
    ],
    expectedResult: 'No horizontal overflow; all key sections are usable and visually intact at this viewport.',
  });
}

const BROWSERS = ['chromium', 'firefox', 'webkit'];
for (const browser of BROWSERS) {
  addGlobal({
    feature: `Cross-browser — ${browser}`,
    requirementText: `The homepage must load and its core interactions (nav, hero carousel, add to cart) must function on ${browser}.`,
    scenarioText: `Run the homepage smoke path (load, hero carousel next/prev, header nav link, add first product to cart) on ${browser}.`,
    priority: 'P1',
    preconditions: `Playwright ${browser} project configured.`,
    testData: 'N/A',
    steps: [
      `Launch ${browser}.`,
      'Load the homepage; assert title and hero heading visible.',
      'Exercise hero carousel Next/Previous.',
      'Click a header category link and confirm navigation.',
      'Add a product to cart from a homepage widget and confirm confirmation UI.',
    ],
    expectedResult: `Smoke path passes on ${browser} with no console errors introduced.`,
  });
}

addGlobal({
  feature: 'Accessibility — keyboard & names',
  requirementText: 'Primary interactive elements (search, nav links, carousel controls, add-to-cart, wishlist) must be reachable via Tab and expose a non-empty accessible name.',
  scenarioText: 'Tab through the homepage from the top and confirm a visible focus indicator on every stop; cross-check accessible names against homepage-map.json for blank names.',
  priority: 'P2',
  preconditions: 'Homepage loaded, desktop viewport.',
  testData: 'state/${LOCALE}/homepage-map.json → any element with name === ""',
  steps: [
    'Load the homepage.',
    'Press Tab repeatedly from the top of the page and screenshot the focus ring at each header/hero control.',
    'Cross-reference homepage-map.json for interactive elements with an empty accessible name (candidates already flagged: unlabeled logo/cart/menu icon links).',
    'Confirm heading structure is hierarchical (no skipped levels) for the section headings captured in homepage-map.json.',
  ],
  expectedResult: 'All interactive elements are keyboard-reachable with a visible focus state and a non-empty accessible name.',
});

addGlobal({
  feature: 'Negative & edge — interaction robustness',
  requirementText: 'The homepage must not error or enter a broken state under rapid repeated interaction, back/forward navigation, or a refresh mid-load.',
  scenarioText: 'Rapid double-click the same CTA, navigate back/forward through a homepage->PDP->homepage sequence, and refresh mid-load; confirm no console errors or stuck UI.',
  priority: 'P2',
  preconditions: 'Homepage loaded.',
  testData: 'N/A',
  steps: [
    'Double-click "Add to Cart" on a homepage product card in quick succession; confirm no duplicate cart entries and no crash.',
    'Navigate homepage -> a product PDP -> browser Back -> browser Forward; confirm each state renders correctly.',
    'Reload the homepage mid-carousel-animation; confirm it settles into a valid state.',
    'Throttle network to slow 3G (or simulate) and confirm skeleton/loading states appear rather than a blank page.',
  ],
  expectedResult: 'No crashes, duplicate actions, or stuck UI under any of the above; console stays free of new errors.',
});

addGlobal({
  feature: 'Console & network health',
  requirementText: 'A homepage load must not produce first-party JavaScript console errors or failed first-party network requests (third-party analytics/beacon failures are tracked separately and are not, by themselves, blocking).',
  scenarioText: 'Load the homepage fresh and classify every console error / failed request as first-party (site code, API, CDN-hosted asset) vs third-party (analytics/ads beacon), then evaluate only the first-party ones as candidate defects.',
  priority: 'P1',
  preconditions: 'Fresh session, no ad blocker.',
  testData: `state/${LOCALE}/homepage-map.json → consoleErrors (${homepageMap.consoleErrors.length} captured), networkFailures (${homepageMap.networkFailures.length} captured)`,
  steps: [
    'Load the homepage with console/network listeners attached from before navigation.',
    'Classify each captured error/failure by host (thekanaa.com and its subdomains, e.g. media-stage.thekanaa.com = first-party; google.com, doubleclick.net, google-analytics.com, merchant-center-analytics.goog = third-party).',
    'For first-party failures only, correlate to the section/element responsible and file as a candidate bug.',
  ],
  expectedResult: 'Zero first-party console errors or failed first-party requests on a clean homepage load.',
});

// The homepage is now discovered/planned/executed natively per locale (this file
// runs once per HOMEPAGE_LOCALE), so RTL layout correctness for Arabic is already
// covered end-to-end by the "ar" run's own full test suite — no separate "switch
// to Arabic and eyeball it" check is needed from the "en" run for that. What's
// still worth a dedicated check per locale is the switcher CONTROL itself: does
// clicking it actually take you to the other locale's homepage.
addGlobal({
  feature: LOCALE === 'ar' ? 'Localization — switch to English' : 'Localization — switch to Arabic',
  requirementText: `The language switcher must navigate from the ${LOCALE === 'ar' ? 'Arabic' : 'English'} homepage to the ${LOCALE === 'ar' ? 'English' : 'Arabic'} homepage, with no horizontal overflow introduced by the switch.`,
  scenarioText: `Click the header language switcher ("${LOCALE === 'ar' ? 'EN' : 'عربي'}") and confirm the resulting URL and <html dir> attribute match the target locale, with no overflow.`,
  priority: 'P2',
  preconditions: `Homepage loaded in ${LOCALE === 'ar' ? 'Arabic' : 'English'}.`,
  testData: `Header language switcher button (accessible name "${LOCALE === 'ar' ? 'EN' : 'عربي'}")`,
  steps: [
    'Click the header language switcher.',
    `Confirm the URL now contains "${LOCALE === 'ar' ? '/en-sa/' : '/ar-sa/'}".`,
    `Confirm <html dir="${LOCALE === 'ar' ? 'ltr' : 'rtl'}"> (or equivalent) is applied on the destination page.`,
    'Confirm no horizontal overflow was introduced by the switch.',
  ],
  expectedResult: 'Language switcher reliably navigates to the other locale with the correct text direction and no layout breakage.',
});

addGlobal({
  feature: 'Performance observation — initial load',
  requirementText: 'The homepage must reach a usable state (hero banner interactive) within a reasonable time on staging, and must not issue duplicate/redundant API calls on a single load.',
  scenarioText: 'Measure time-to-first-contentful-paint-equivalent (hero banner visible) and count duplicate network requests to the same endpoint within one page load.',
  priority: 'P3',
  preconditions: 'Fresh session, no throttling (baseline) then Slow 3G (comparison).',
  testData: 'Network log from a full homepage load.',
  steps: [
    'Load the homepage with network logging enabled.',
    'Record time until the hero carousel controls are interactive.',
    'Group network requests by URL and flag any endpoint called more than once with identical params within the same load.',
  ],
  expectedResult: 'No destructive/duplicate-fetch pattern; load reaches an interactive hero within a few seconds on an unthrottled connection. This is an observational check, not a load/stress test.',
});

// --- Known risks / observations surfaced directly by discovery (not yet confirmed bugs) ---
const knownRisks = homepageMap.discoveredIssues.map((issue, i) => ({
  id: `RISK-HOME-${String(i + 1).padStart(3, '0')}`,
  type: issue.type,
  description: issue.description,
  note: `Surfaced during automated discovery. Requires a dedicated execution + evidence capture before being filed as a bug (see specs/homepage-test-plan.${LOCALE}.md).`,
}));

// --- Write state files ---
function writeJson(name, data) {
  fs.writeFileSync(path.join(STATE_DIR, name), JSON.stringify(data, null, 2), 'utf-8');
}
writeJson('requirements.json', requirements);
writeJson('scenarios.json', scenarios);
writeJson('test-cases.json', testCases);
writeJson('traceability.json', traceability);
writeJson('known-risks.json', knownRisks);
if (!fs.existsSync(path.join(STATE_DIR, 'executions.json'))) writeJson('executions.json', []);
if (!fs.existsSync(path.join(STATE_DIR, 'bugs.json'))) writeJson('bugs.json', []);

// --- Human-readable docs ---
const uniqueConsoleErrors = [...new Set(homepageMap.consoleErrors.map((e) => e.text))];
const firstPartyFailures = homepageMap.networkFailures.filter((f) => isFirstPartyUrl(f.url));
const thirdPartyFailureCount = homepageMap.networkFailures.length - firstPartyFailures.length;
const localeLabel = LOCALE === 'ar' ? 'Arabic (/ar-sa/)' : 'English (/en-sa/)';

const reqMd = `# Homepage Requirements — Kanaa, ${localeLabel} (${BASE_URL})

Generated from \`state/${LOCALE}/homepage-map.json\` (captured ${homepageMap.meta.capturedAt}) by \`scripts/generate-test-plan.js\` (HOMEPAGE_LOCALE=${LOCALE}).
Do not hand-edit this file — regenerate it after re-running discovery.

${requirements.map((r) => `- **${r.id}** (${r.sectionId}) — ${r.feature}: ${r.text}`).join('\n')}
`;
fs.writeFileSync(path.join(REQUIREMENTS_DIR, `homepage-requirements.${LOCALE}.md`), reqMd, 'utf-8');

const planMd = `# Homepage Test Plan — Kanaa, ${localeLabel} (${BASE_URL})

Generated from \`state/${LOCALE}/homepage-map.json\` (captured ${homepageMap.meta.capturedAt}) by \`scripts/generate-test-plan.js\` (HOMEPAGE_LOCALE=${LOCALE}).

## Source discovery
- URL: ${homepageMap.meta.url}
- Title: ${homepageMap.meta.title}
- Viewport at capture: ${homepageMap.meta.viewport.width}x${homepageMap.meta.viewport.height}
- Sections discovered: ${homepageMap.totals.sections}
- Buttons: ${homepageMap.totals.buttons} · Links: ${homepageMap.totals.links} · Inputs: ${homepageMap.totals.inputs} · Images: ${homepageMap.totals.images} (broken: ${homepageMap.totals.brokenImages}) · Sliders: ${homepageMap.totals.sliders} · Product widgets: ${homepageMap.totals.productWidgetsDetected} (cards sampled: ${homepageMap.totals.productCardsSampled})

## Sections
${homepageMap.sections.map((s) => `- **${s.id}** — ${s.name || '(untitled)'} _(${s.type})_`).join('\n')}

## Coverage
- Requirements: ${requirements.length}
- Scenarios: ${scenarios.length}
- Test cases: ${testCases.length}
- Viewports covered: ${VIEWPORTS.map((v) => v.name).join(', ')}
- Browsers covered: ${BROWSERS.join(', ')}

## Known risks / assumptions from discovery (not yet confirmed as bugs)
${knownRisks.length ? knownRisks.map((r) => `- **${r.id}** [${r.type}] — ${r.description}`).join('\n') : '- None flagged.'}

## Console errors observed during discovery load (deduplicated)
${uniqueConsoleErrors.length ? uniqueConsoleErrors.map((e) => `- ${e.slice(0, 200)}`).join('\n') : '- None.'}

## Network failures observed during discovery load
- First-party (thekanaa.com and subdomains, e.g. media-stage) — **actionable, likely correlates with the ${homepageMap.totals.brokenImages} broken images above**: ${firstPartyFailures.length}
${firstPartyFailures.length ? firstPartyFailures.map((f) => `  - ${f.method} ${f.url} — ${f.failure || f.status}`).join('\n') : '  - None.'}
- Third-party (analytics/ads beacons — informational, not blocking): ${thirdPartyFailureCount}

## Assumptions
- "Every button/link" requirements are executed data-driven against \`state/${LOCALE}/homepage-map.json\`, not enumerated one row per element in this plan.
- Product-card test cases sample representative cards (first/middle/last of the widget) per spec section 12, not every card in every widget.
- No real order is ever placed; Add to Cart tests stop at cart confirmation, consistent with README safety notes for this project.
- Login-gated flows are out of scope for the homepage suite (kanaa-test-bot's existing \`tests/e2e/login.spec.js\`/\`checkout.spec.js\` cover those separately and are tagged \`@otp\` since they trigger a real OTP).

## Not yet executed
This plan has been generated but **no test cases have been executed yet**. Execution, evidence capture, bug filing, retesting, regression and the final QA report are later phases — see \`agents/homepage-executor.md\` and \`agents/homepage-bug-analyzer.md\`.
`;
fs.writeFileSync(path.join(SPECS_DIR, `homepage-test-plan.${LOCALE}.md`), planMd, 'utf-8');

console.log(`[plan] locale=${LOCALE} requirements=${requirements.length} scenarios=${scenarios.length} testCases=${testCases.length} knownRisks=${knownRisks.length}`);
