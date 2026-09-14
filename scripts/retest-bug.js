/**
 * PHASE 9 — RETEST (spec section 27): "when a bug is marked fixed, don't trust the
 * developer statement alone — execute the original failing test case (and anything
 * that regresses with it), and record FIXED or NOT FIXED."
 *
 * Usage:
 *   node scripts/retest-bug.js BUG-HOME-001
 *   node scripts/retest-bug.js BUG-HOME-001 --browser=webkit
 *   node scripts/retest-bug.js BUG-HOME-008 --manual FIXED "confirmed heading text corrected"
 *
 * Automated mode re-runs the bug's testCaseId plus its relatedRegressionTests via
 * --grep against their "TC-HOME-NNN: ..." title prefix (every homepage-*.spec.js test
 * is titled that way specifically so this works — see agents/homepage-executor.md).
 * A "Cross-browser — <browser>" test case is routed to playwright.homepage.config.js
 * instead, since that's a separate config/project matrix.
 *
 * A bug with no testCaseId (a content/manual bug like a copy typo) can't be
 * re-verified by running a script — use --manual instead of guessing.
 *
 * Every call appends to the bug's retestHistory (never overwrites it), so the full
 * retest timeline stays visible even across multiple attempts.
 */
const { execSync } = require('child_process');
const { loadJson, saveJson } = require('../utils/qaState');

const [, , bugId, ...rest] = process.argv;
if (!bugId) {
  console.error('Usage: node scripts/retest-bug.js <BUG-ID> [--browser=chromium|webkit] | [--manual FIXED|NOT_FIXED "note"]');
  process.exit(1);
}

const bugs = loadJson('bugs.json');
const bug = bugs.find((b) => b.id === bugId);
if (!bug) {
  console.error(`No such bug: ${bugId}. Known bug IDs: ${bugs.map((b) => b.id).join(', ')}`);
  process.exit(1);
}
if (bug.status === 'FIXED') {
  console.log(`[retest] ${bugId} is already marked FIXED — retesting to confirm it hasn't regressed.`);
}

function recordRetest(result, note, executionIds) {
  bug.retestHistory = bug.retestHistory || [];
  bug.retestHistory.push({ retestedAt: new Date().toISOString(), result, note, executionIds: executionIds || [] });
  const wasFixed = bug.status === 'FIXED';
  bug.status = result === 'FIXED' ? 'FIXED' : (wasFixed ? 'REOPENED' : 'OPEN');
  saveJson('bugs.json', bugs);
  console.log(`[retest] ${bugId} -> ${bug.status} (this retest: ${result})`);
  console.log(`[retest] ${note}`);
}

const manualIdx = rest.indexOf('--manual');
if (manualIdx !== -1) {
  const result = rest[manualIdx + 1];
  const note = rest[manualIdx + 2];
  if (!['FIXED', 'NOT_FIXED'].includes(result)) {
    console.error('--manual must be followed by FIXED or NOT_FIXED and a note explaining how it was checked.');
    process.exit(1);
  }
  if (!note) {
    console.error('A note is required for a manual retest — how was this actually checked?');
    process.exit(1);
  }
  recordRetest(result, `Manual retest: ${note}`, []);
  process.exit(result === 'FIXED' ? 0 : 1);
}

const browserArg = rest.find((a) => a.startsWith('--browser='));
const browser = browserArg ? browserArg.split('=')[1] : 'chromium';

const targetTcIds = new Set();
if (bug.testCaseId) targetTcIds.add(bug.testCaseId);
for (const t of bug.relatedRegressionTests || []) targetTcIds.add(t);

if (targetTcIds.size === 0) {
  console.log(`[retest] ${bugId} has no automated test case attached (a content/manual bug) — use:`);
  console.log(`  node scripts/retest-bug.js ${bugId} --manual FIXED|NOT_FIXED "how you checked it"`);
  process.exit(1);
}

const testCases = loadJson('test-cases.json');
const isBrowserSmoke = [...targetTcIds].some((id) => {
  const tc = testCases.find((t) => t.id === id);
  return tc && tc.feature.startsWith('Cross-browser');
});

const cmd = isBrowserSmoke
  ? `npx playwright test --config=playwright.homepage.config.js homepage-browsers.spec.js --project=${browser}`
  : `npx playwright test tests/homepage --project=chromium --grep "${[...targetTcIds].join('|')}"`;

console.log(`[retest] ${bugId}: re-running ${[...targetTcIds].join(', ')}`);
console.log(`[retest] ${cmd}`);
try {
  execSync(cmd, { stdio: 'inherit' });
} catch {
  // non-zero exit just means at least one targeted test failed — the real verdict
  // comes from state/test-cases.json below, not this exit code.
}

const freshTestCases = loadJson('test-cases.json');
const results = [...targetTcIds].map((id) => freshTestCases.find((t) => t.id === id)).filter(Boolean);
const stillFailing = results.filter((t) => t.status !== 'PASS');
const executionIds = results.map((t) => t.executionId).filter(Boolean);

if (stillFailing.length === 0) {
  recordRetest('FIXED', `All ${results.length} targeted test case(s) passed on retest.`, executionIds);
  process.exit(0);
} else {
  const detail = stillFailing.map((t) => `${t.id}: ${(t.actualResult || 'no detail').slice(0, 200)}`).join(' | ');
  recordRetest('NOT_FIXED', `Still failing (${stillFailing.length}/${results.length}): ${detail}`, executionIds);
  process.exit(1);
}
