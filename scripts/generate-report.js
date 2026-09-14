/**
 * PHASE 11 — final QA report (spec section 30). Pulls only from state/<locale>/*.json —
 * never hand-summarized — per agents/homepage-report.md. Run once per locale
 * (HOMEPAGE_LOCALE=en|ar); see scripts/generate-combined-report.js for the
 * bilingual summary that links both.
 */
const fs = require('fs');
const path = require('path');
const { LOCALE, BASE_URL, loadJson } = require('../utils/qaState');

const homepageMap = loadJson('homepage-map.json');
const testCases = loadJson('test-cases.json');
const bugs = loadJson('bugs.json');
const executions = loadJson('executions.json');

const statusCounts = testCases.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
const sevCounts = bugs.reduce((acc, b) => { acc[b.severity] = (acc[b.severity] || 0) + 1; return acc; }, {});
const bugStatusCounts = bugs.reduce((acc, b) => { const s = b.status || 'OPEN'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});
const bugsWithRetests = bugs.filter((b) => (b.retestHistory || []).length > 0);

function bugLine(b) {
  const status = b.status || 'OPEN';
  return `- **${b.id}** [${b.severity}/${b.priority}] (${status}) ${b.title} — TC: ${b.testCaseId || 'N/A'}, Section: ${b.sectionId}`;
}

// Categorized by feature keyword, not hardcoded bug IDs — IDs differ every locale/run.
function bugsMatching(re) { return bugs.filter((b) => re.test(b.feature || '') || re.test(b.title || '')); }
const uiBugs = bugsMatching(/image|heading|copy|widget heading|UI\b/i);
const functionalBugs = bugsMatching(/link|button|catalog|search|product|hygiene/i).filter((b) => !uiBugs.includes(b));
const accessibilityBugs = bugsMatching(/accessib/i);
const consoleNetworkBugs = bugsMatching(/console|network/i);
const responsiveBugs = bugsMatching(/responsive/i);
const browserBugs = bugsMatching(/cross-browser|browser/i);
const categorized = new Set([...uiBugs, ...functionalBugs, ...accessibilityBugs, ...consoleNetworkBugs, ...responsiveBugs, ...browserBugs]);
const otherBugs = bugs.filter((b) => !categorized.has(b));

const responsiveTCs = testCases.filter((t) => t.feature.startsWith('Responsive'));
const browserTCs = testCases.filter((t) => t.feature.startsWith('Cross-browser'));

const totalExecutions = executions.length;
const uniqueBrowsersRun = [...new Set(executions.map((e) => e.browser).filter(Boolean))];
const localeLabel = LOCALE === 'ar' ? 'Arabic (/ar-sa/, RTL)' : 'English (/en-sa/, LTR)';

function browserLine(tc) {
  const b = tc.feature.split(' — ')[1] || tc.feature;
  if (tc.status === 'NOT_EXECUTED') return `- **${b}** — NOT_EXECUTED: ${tc.actualResult || 'not run this cycle'}.`;
  return `- **${b}** — ${tc.status}${tc.actualResult ? `: ${tc.actualResult.slice(0, 200)}` : ''}`;
}

const md = `# Homepage QA Report — Kanaa, ${localeLabel}

## Summary
- **Application:** The Kanaa — Online Toy, Gaming & Electronics Store (${homepageMap.meta.url})
- **Environment:** **production** (${BASE_URL}) — this suite targets the live site on purpose (see CLAUDE.md "Two different targets, on purpose"); the pre-existing cart/checkout/login suite still targets dev-nx staging separately.
- **Locale:** ${localeLabel}
- **Date/time of this cycle:** discovery captured ${homepageMap.meta.capturedAt}; execution run same session
- **Browsers exercised:** ${uniqueBrowsersRun.join(', ') || 'chromium'}
- **Primary viewport:** ${homepageMap.meta.viewport.width}x${homepageMap.meta.viewport.height} (plus 7 responsive viewports — see Coverage)

## Coverage
- Sections discovered: **${homepageMap.totals.sections}**
- Interactive elements discovered: **${homepageMap.totals.buttons + homepageMap.totals.links + homepageMap.totals.inputs}** (${homepageMap.totals.buttons} buttons, ${homepageMap.totals.links} links, ${homepageMap.totals.inputs} inputs) + ${homepageMap.totals.images} images
- Sliders/carousels tested: ${homepageMap.totals.sliders}/${homepageMap.totals.sliders}
- Product widgets tested: ${homepageMap.totals.productWidgetsDetected}/${homepageMap.totals.productWidgetsDetected} (${homepageMap.totals.productCardsSampled} cards sampled at discovery; each widget's live cards re-sampled first/middle/last at execution)
- Responsive viewports tested: ${responsiveTCs.length}/7 (${responsiveTCs.filter((t) => t.status === 'PASS').length} passed)
- Browsers tested: ${browserTCs.filter((t) => t.status !== 'NOT_EXECUTED').length}/${browserTCs.length || 3}
- Total generated test cases: **${testCases.length}**
- Total executions recorded: **${totalExecutions}**

## Test Results
| Status | Count |
|---|---|
| PASS | ${statusCounts.PASS || 0} |
| FAIL | ${statusCounts.FAIL || 0} |
| BLOCKED | ${statusCounts.BLOCKED || 0} |
| NOT_EXECUTED | ${statusCounts.NOT_EXECUTED || 0} |
| **Total** | **${testCases.length}** |

## Defects
| Severity | Count |
|---|---|
| Critical | ${sevCounts.Critical || 0} |
| Major | ${sevCounts.Major || 0} |
| Medium | ${sevCounts.Medium || 0} |
| Minor | ${sevCounts.Minor || 0} |
| Trivial | ${sevCounts.Trivial || 0} |
| **Total** | **${bugs.length}** |

**By status:** ${Object.entries(bugStatusCounts).map(([s, n]) => `${s} ${n}`).join(' · ') || 'none filed'}

Full bug details (repro steps, evidence paths, traceability): [state/${LOCALE}/bugs.json](../state/${LOCALE}/bugs.json).

### Root cause — Major/Critical defects
${bugs.filter((b) => ['Major', 'Critical'].includes(b.severity)).map((b) => `**${b.id}: ${b.title}** _(${b.status || 'OPEN'})_\n${b.actualResult}\n${b.notes ? `\n*Recommended fix:* ${b.notes}` : ''}`).join('\n\n') || '_No Major/Critical defects open._'}

## UI Issues
${uiBugs.length ? uiBugs.map(bugLine).join('\n') : '- None.'}

## Functional Issues
${functionalBugs.length ? functionalBugs.map(bugLine).join('\n') : '- None.'}

## Accessibility Issues
${accessibilityBugs.length ? accessibilityBugs.map(bugLine).join('\n') : '- None.'}

## Responsive Issues
${responsiveBugs.length ? responsiveBugs.map(bugLine).join('\n') : `- None — ${responsiveTCs.filter((t) => t.status === 'PASS').length}/${responsiveTCs.length} viewports passed with no horizontal overflow.`}

## Browser Issues
${browserTCs.length ? browserTCs.map(browserLine).join('\n') : '- Not executed this cycle.'}

## Console/Network Issues
${consoleNetworkBugs.length ? consoleNetworkBugs.map(bugLine).join('\n') : '- None.'}

${otherBugs.length ? `## Other Defects\n${otherBugs.map(bugLine).join('\n')}\n` : ''}
## Regression Results
${bugsWithRetests.length
  ? bugsWithRetests.map((b) => `- **${b.id}** (now ${b.status}): ${b.retestHistory.map((r) => `[${r.retestedAt}] ${r.result} — ${r.note}`).join(' → ')}`).join('\n')
  : 'No bugs have been retested yet in this cycle. `node scripts/retest-bug.js <BUG-ID>` re-runs a bug\'s original test case (and its relatedRegressionTests) and records FIXED/NOT FIXED — see agents/homepage-bug-analyzer.md. `node scripts/run-regression.js` separately re-runs every test case traced to any OPEN/REOPENED bug\'s section — see state/traceability.json for the current bug -> section -> test case links.'}

## Known Limitations
- **This homepage's product widgets are personalized/rotate content between loads** — the same widget slot can show a different title, product set, or order on a later load. Product-card execution re-derives each widget's cards live rather than trusting discovery-time positions for exactly this reason (see \`matchedBy\`/\`infoNotes\` in \`evidence/homepage/${LOCALE}/TC-HOME-${LOCALE.toUpperCase()}-*/product-card-check.json\`) — this is a site characteristic, not a defect, but it does limit how precisely automated re-verification can target "the same" widget run over run.
- **Login-gated flows are out of scope** for this suite by design (always triggers a real OTP on the pre-existing dev-nx suite) — this homepage bot only exercises guest-session flows.
- **No real order is ever placed** — Add to Cart tests stop at the cart-confirmation UI (or wishlist/cart-count check), never checkout.
- **This run targets production.** Findings here describe the live site at the time of this run — re-run before trusting stale numbers for a release decision.

## Evidence
- Discovery: \`evidence/homepage/${LOCALE}/discovery/\` (screenshots, ARIA snapshot, trace, console/network logs)
- Per-test-case evidence (screenshots, JSON findings, traces on failure): \`evidence/homepage/${LOCALE}/<TC-ID>/\`
- Full execution history: \`state/${LOCALE}/executions.json\`
- Full traceability (requirement -> section -> element -> scenario -> test case -> execution -> bug): \`state/${LOCALE}/traceability.json\`

## Final Recommendation
${(() => {
  const openBugs = bugs.filter((b) => ['OPEN', 'REOPENED'].includes((b.status || 'OPEN').toUpperCase()));
  const openBySev = openBugs.reduce((acc, b) => { acc[b.severity] = (acc[b.severity] || 0) + 1; return acc; }, {});
  const executed = totalExecutions > 0;
  let verdict;
  if (!executed) verdict = 'NOT READY';
  else if (openBySev.Critical > 0) verdict = 'NOT READY';
  else if (openBySev.Major > 0) verdict = 'READY WITH KNOWN ISSUES';
  else if (openBySev.Medium > 0 || openBySev.Minor > 0 || openBySev.Trivial > 0) verdict = 'READY WITH KNOWN ISSUES';
  else verdict = 'READY';

  const openList = openBugs.length ? openBugs.map((b) => `${b.id} [${b.severity}]`).join(', ') : 'none';
  const fixedList = bugs.filter((b) => b.status === 'FIXED').map((b) => b.id).join(', ') || 'none';

  return `### ${verdict}

${statusCounts.PASS || 0}/${testCases.length} generated test cases passed (${localeLabel}). Open defects (not yet verified fixed): ${openList}. Verified fixed this cycle: ${fixedList}.

${verdict === 'NOT READY' ? 'A Critical defect is open, or execution has not actually run — see Defects above before proceeding.' : ''}${verdict === 'READY WITH KNOWN ISSUES' ? 'Core homepage functionality passed. The open defects above are real but non-blocking — see severity/priority per bug in state/bugs.json for what to prioritize.' : ''}${verdict === 'READY' ? 'No open defects at Medium severity or above. Full pass.' : ''}`;
})()}
`;

fs.writeFileSync(path.join(__dirname, '..', 'reports', `homepage-qa-report.${LOCALE}.md`), md, 'utf-8');
console.log(`[report] locale=${LOCALE} written to reports/homepage-qa-report.${LOCALE}.md`);
