/**
 * PHASE 10 — Regression (spec section 28). Locale-scoped via HOMEPAGE_LOCALE
 * (reads state/<locale>/bugs.json, run once per locale).
 *
 * Reads bugs.json for open/reopened bugs, maps each to its impacted test cases via
 * traceability.json (same sectionId = impacted), and re-runs exactly those test
 * cases by --grep-matching their "TC-HOME-<LOCALE>-NNN:" title prefix — every test()
 * in tests/homepage/*.spec.js is titled that way specifically so this works.
 *
 * With zero open bugs this intentionally does nothing but report that, rather than
 * re-running the whole suite "just in case" — regression is scoped to what actually
 * changed/broke, not a full re-run. Runs via playwright.homepage.config.js (NOT the
 * default playwright.config.js) — that's what targets production/HOMEPAGE_BASE_URL
 * instead of dev-nx; a bare `npx playwright test` would silently hit the wrong site.
 */
const { execSync } = require('child_process');
const { LOCALE, loadJson } = require('../utils/qaState');

const bugs = loadJson('bugs.json');
const traceability = loadJson('traceability.json');

const ACTIVE_STATUSES = ['OPEN', 'REOPENED'];
const openBugs = bugs.filter((b) => ACTIVE_STATUSES.includes((b.status || 'OPEN').toUpperCase()));

if (openBugs.length === 0) {
  console.log(`[regression] locale=${LOCALE}: no open/reopened bugs — nothing to regress.`);
  process.exit(0);
}

const impactedTcIds = new Set();
for (const bug of openBugs) {
  const relatedTraces = traceability.filter((t) => t.sectionId === bug.sectionId);
  for (const t of relatedTraces) impactedTcIds.add(t.testCaseId);
  for (const extra of bug.relatedRegressionTests || []) impactedTcIds.add(extra);
}

if (impactedTcIds.size === 0) {
  console.log(`[regression] locale=${LOCALE}: ${openBugs.length} open bug(s), but no test cases traced to their sections — check traceability.json.`);
  process.exit(0);
}

const grepPattern = [...impactedTcIds].join('|');
console.log(`[regression] locale=${LOCALE}: ${openBugs.length} open bug(s) -> ${impactedTcIds.size} impacted test case(s): ${[...impactedTcIds].join(', ')}`);
execSync(`npx playwright test --config=playwright.homepage.config.js tests/homepage --project=chromium --grep "${grepPattern}"`, { stdio: 'inherit' });
