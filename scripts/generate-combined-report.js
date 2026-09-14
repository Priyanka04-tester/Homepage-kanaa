/**
 * Bilingual executive summary linking the per-locale reports. Reads both
 * state/en/*.json and state/ar/*.json directly (not through utils/qaState.js,
 * which is locale-bound to a single HOMEPAGE_LOCALE per process) — this script
 * itself isn't locale-scoped, it summarizes across both.
 */
const fs = require('fs');
const path = require('path');

const STATE_ROOT = path.join(__dirname, '..', 'state');
const REPORTS_DIR = path.join(__dirname, '..', 'reports');

function readLocale(locale) {
  const dir = path.join(STATE_ROOT, locale);
  const load = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf-8'));
  return { testCases: load('test-cases.json'), bugs: load('bugs.json'), homepageMap: load('homepage-map.json') };
}

const en = readLocale('en');
const ar = readLocale('ar');

function summarize(locale, data) {
  const statusCounts = data.testCases.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
  const sevCounts = data.bugs.reduce((acc, b) => { acc[b.severity] = (acc[b.severity] || 0) + 1; return acc; }, {});
  const openBugs = data.bugs.filter((b) => ['OPEN', 'REOPENED'].includes((b.status || 'OPEN').toUpperCase()));
  return { locale, statusCounts, sevCounts, total: data.testCases.length, openCount: openBugs.length, bugCount: data.bugs.length, capturedAt: data.homepageMap.meta.capturedAt };
}

const enSummary = summarize('en', en);
const arSummary = summarize('ar', ar);

function row(s) {
  return `| ${s.locale === 'en' ? 'English' : 'Arabic'} | ${s.statusCounts.PASS || 0} | ${s.statusCounts.FAIL || 0} | ${s.statusCounts.NOT_EXECUTED || 0} | ${s.total} | ${s.bugCount} (${s.openCount} open) | ${s.sevCounts.Critical || 0} | ${s.sevCounts.Major || 0} |`;
}

const md = `# Homepage QA — Bilingual Summary (English + Arabic)

Executive summary linking the two full per-locale runs. Each locale has its own
complete discovery → plan → execution → bug cycle, run independently against
production (https://thekanaa.com) — see the linked reports for full detail.

- [English homepage report](homepage-qa-report.en.md) (\`/en-sa/\`, captured ${enSummary.capturedAt})
- [Arabic homepage report](homepage-qa-report.ar.md) (\`/ar-sa/\`, RTL, captured ${arSummary.capturedAt})

## At a glance
| Locale | PASS | FAIL | NOT_EXECUTED | Total TCs | Bugs (open) | Critical | Major |
|---|---|---|---|---|---|---|---|
${row(enSummary)}
${row(arSummary)}

## Cross-locale notes
- Test case IDs are locale-prefixed and never overlap (\`TC-HOME-EN-*\` vs \`TC-HOME-AR-*\`), so the two runs can be compared side by side without ambiguity — see \`state/en/\` and \`state/ar/\` respectively.
- A defect found in one locale doesn't automatically apply to the other — production content, translation completeness, and layout direction (LTR vs RTL) all differ. Each locale's own report is the source of truth for that locale; don't assume symmetry.
- Known, deliberately untranslated controls (see \`utils/qaState.js\` PATTERNS): the "Add to wishlist" control and the hero carousel's "Previous"/"Next" controls render in English on both \`/en-sa/\` and \`/ar-sa/\` — this is itself a real localization-completeness gap worth checking whether it's filed as a bug in the Arabic report.

## Final Recommendation
Combined verdict is the more conservative of the two locale verdicts — see each report's own "Final Recommendation" section for the reasoning behind it.
`;

fs.writeFileSync(path.join(REPORTS_DIR, 'homepage-qa-report.md'), md, 'utf-8');
console.log('[combined-report] written to reports/homepage-qa-report.md');
