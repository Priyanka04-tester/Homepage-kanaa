/**
 * Converts a Playwright JSON report into a CSV run report (opens directly in Excel).
 *
 *   PLAYWRIGHT_JSON_OUTPUT_NAME=<file> npx playwright test ... --reporter=list,json
 *   node scripts/generate-run-csv.js <playwright-results.json> <locale> <out.csv>
 *
 * One row per test and browser/viewport project. Status is PASS, FAIL, FLAKY, or
 * NOT RUN. A test marked test.fail() that fails as expected is PASS with the
 * note "known defect (expected failure)", so it stays visible in the report.
 */
const fs = require('fs');
const path = require('path');

const [, , resultsPath, locale = 'en', outPath] = process.argv;
if (!resultsPath || !outPath) {
  console.error('usage: node scripts/generate-run-csv.js <results.json> <locale> <out.csv>');
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const rows = [];

function walk(suite, trail) {
  const title = suite.title ? [...trail, suite.title] : trail;
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const last = (test.results || [])[test.results.length - 1] || {};
      const idMatch = spec.title.match(/TC-HOME-\d+|SC-\d+/);
      const id = idMatch ? idMatch[0] : spec.title.split(':')[0];
      const feature = title.filter(Boolean).slice(-1)[0] || '';
      const error = ((last.errors || [])[0] || {}).message || '';
      const firstLine = error.split('\n').find((l) => l.trim()) || '';
      let status = 'NOT RUN';
      let note = '';
      if (test.status === 'expected') {
        status = 'PASS';
        if (test.expectedStatus === 'failed') note = 'known defect (expected failure)';
      } else if (test.status === 'unexpected') {
        status = 'FAIL';
      } else if (test.status === 'flaky') {
        status = 'FLAKY';
      } else if (test.status === 'skipped') {
        status = 'NOT RUN';
      }
      const evidence = (last.attachments || []).map((a) => a.path).filter(Boolean).join('; ');
      rows.push({
        test_case_id: id,
        feature,
        scenario: spec.title,
        environment: 'live https://thekanaa.com',
        locale,
        device: test.projectName,
        status,
        note,
        expected: spec.title,
        actual: status === 'PASS' ? 'matches expected' : firstLine || last.status || '',
        error: error.replace(/\s+/g, ' ').slice(0, 500),
        duration_ms: last.duration || 0,
        evidence,
        severity: '',
      });
    }
  }
  for (const child of suite.suites || []) walk(child, title);
}

for (const suite of report.suites || []) walk(suite, []);

const columns = ['test_case_id', 'feature', 'scenario', 'environment', 'locale', 'device', 'status', 'note', 'expected', 'actual', 'error', 'duration_ms', 'evidence', 'severity'];
const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const lines = [columns.join(',')];
for (const r of rows) lines.push(columns.map((c) => esc(r[c])).join(','));
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, '﻿' + lines.join('\r\n'), 'utf8');

const count = (s) => rows.filter((r) => r.status === s).length;
console.log(`[run-report ${locale}] ${rows.length} rows: PASS ${count('PASS')}, FAIL ${count('FAIL')}, FLAKY ${count('FLAKY')}, NOT RUN ${count('NOT RUN')} -> ${outPath}`);
