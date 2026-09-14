/**
 * PHASE 8 — bug filing pass over the homepage execution results from this QA cycle.
 * Run once per locale (HOMEPAGE_LOCALE=en|ar) after execution — see
 * agents/homepage-bug-analyzer.md for the bar a finding has to clear before it's
 * filed here (observed + reproduced/evidenced, not just a discovery-time heuristic
 * hit, and not a test-harness artifact — see "Not every FAIL is a bug" there).
 *
 * The `bugs` array below is a CURATED list, not auto-generated from every FAIL —
 * fill it in by hand after reviewing state/<locale>/test-cases.json and
 * evidence/homepage/<locale>/, one locale's real results at a time. Use
 * BUG-HOME-<ID_PREFIX>-NNN for IDs (e.g. BUG-HOME-EN-001, BUG-HOME-AR-001) so
 * English and Arabic bugs never collide even if later merged into one view.
 */
const { ID_PREFIX, loadJson, saveJson } = require('../utils/qaState');

const bugs = [
  // Empty until this locale's execution has actually run and been reviewed.
  // Example shape (copy/adapt, don't leave placeholder fields unfilled):
  // {
  //   id: `BUG-HOME-${ID_PREFIX}-001`,
  //   title: '...',
  //   requirementId: 'REQ-HOME-...', sectionId: 'HOME-SEC-...', elementId: null, scenarioId: 'SC-HOME-...',
  //   testCaseId: 'TC-HOME-...', executionId: null, feature: '...',
  //   environment: 'production (https://thekanaa.com)', browser: 'chromium', viewport: '1280x800',
  //   buildVersion: 'unknown (production, captured <date>)',
  //   preconditions: '...', testData: '...', stepsToReproduce: ['...'],
  //   expectedResult: '...', actualResult: '...',
  //   severity: 'Major', priority: 'P1', reproducibility: '...',
  //   screenshot: null, video: null, trace: null, consoleEvidence: null, networkEvidence: null,
  //   relatedRegressionTests: [], notes: null, status: 'OPEN',
  // },
];

const executions = loadJson('executions.json');
function latestExecutionFor(testCaseId) {
  if (!testCaseId) return null;
  const matches = executions.filter((e) => e.testCaseId === testCaseId);
  return matches.length ? matches[matches.length - 1].id : null;
}
for (const bug of bugs) {
  bug.executionId = latestExecutionFor(bug.testCaseId);
}

saveJson('bugs.json', bugs);

const traceability = loadJson('traceability.json');
for (const bug of bugs) {
  if (!bug.testCaseId) continue;
  const row = traceability.find((t) => t.testCaseId === bug.testCaseId);
  if (row) {
    row.bugIds = row.bugIds || [];
    if (!row.bugIds.includes(bug.id)) row.bugIds.push(bug.id);
  }
}
saveJson('traceability.json', traceability);

console.log(`[bugs] locale=${ID_PREFIX} filed ${bugs.length} bugs. Severity breakdown:`, bugs.reduce((acc, b) => { acc[b.severity] = (acc[b.severity] || 0) + 1; return acc; }, {}));
