/**
 * PHASE 10 — Regression (spec section 28).
 *
 * Reads state/bugs.json for open bugs, maps each to its impacted test cases via
 * state/traceability.json (same sectionId = impacted), and re-runs exactly those
 * test cases by --grep-matching their "TC-HOME-NNN:" title prefix — every test()
 * in tests/homepage/*.spec.js is titled that way specifically so this works.
 *
 * With zero open bugs (the state today) this intentionally does nothing but report
 * that, rather than re-running the whole suite "just in case" — regression is scoped
 * to what actually changed/broke, not a full re-run.
 */
const { execSync } = require('child_process');
const { loadJson } = require('../utils/qaState');

const bugs = loadJson('bugs.json');
const traceability = loadJson('traceability.json');

const ACTIVE_STATUSES = ['OPEN', 'REOPENED'];
const openBugs = bugs.filter((b) => ACTIVE_STATUSES.includes((b.status || 'OPEN').toUpperCase()));

if (openBugs.length === 0) {
  console.log('[regression] No open/reopened bugs in state/bugs.json — nothing to regress.');
  process.exit(0);
}

const impactedTcIds = new Set();
for (const bug of openBugs) {
  const relatedTraces = traceability.filter((t) => t.sectionId === bug.sectionId);
  for (const t of relatedTraces) impactedTcIds.add(t.testCaseId);
  for (const extra of bug.relatedRegressionTests || []) impactedTcIds.add(extra);
}

if (impactedTcIds.size === 0) {
  console.log(`[regression] ${openBugs.length} open bug(s), but no test cases traced to their sections — check state/traceability.json.`);
  process.exit(0);
}

const grepPattern = [...impactedTcIds].join('|');
console.log(`[regression] ${openBugs.length} open bug(s) -> ${impactedTcIds.size} impacted test case(s): ${[...impactedTcIds].join(', ')}`);
execSync(`npx playwright test tests/homepage --project=chromium --grep "${grepPattern}"`, { stdio: 'inherit' });
