/**
 * Builds the Excel run report from the CSV run report and the discovery diff.
 *
 *   node scripts/generate-run-xlsx.js <run-report.csv> <locale> <out.xlsx>
 *
 * Sheets: Summary, Detailed Results, Failures, Discovery Changes.
 * The discovery diff is read from state/<locale>/discovery-diff.json when present.
 */
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const [, , csvPath, locale = 'en', outPath] = process.argv;
if (!csvPath || !outPath) {
  console.error('usage: node scripts/generate-run-xlsx.js <run-report.csv> <locale> <out.xlsx>');
  process.exit(2);
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\r') { /* skip */ }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length && r.some((v) => v !== ''));
}

const raw = fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, '');
const [header, ...body] = parseCsv(raw);
const records = body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));

const count = (rows, key, value) => rows.filter((r) => r[key] === value).length;
const byDevice = {};
for (const r of records) {
  byDevice[r.device] = byDevice[r.device] || { PASS: 0, FAIL: 0, FLAKY: 0, 'NOT RUN': 0 };
  byDevice[r.device][r.status] = (byDevice[r.device][r.status] || 0) + 1;
}

const wb = new ExcelJS.Workbook();
wb.creator = 'Homepage QA bot';
wb.created = new Date();

const headerStyle = {
  font: { bold: true, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } },
};
const statusFill = {
  PASS: 'FFC6EFCE', FAIL: 'FFFFC7CE', FLAKY: 'FFFFEB9C', 'NOT RUN': 'FFD9D9D9',
};

// Summary
const summary = wb.addWorksheet('Summary');
summary.columns = [{ header: 'Metric', key: 'metric', width: 36 }, { header: 'Value', key: 'value', width: 60 }];
summary.getRow(1).font = headerStyle.font;
summary.getRow(1).fill = headerStyle.fill;
const total = records.length;
const summaryRows = [
  ['Locale', locale],
  ['Environment', records[0] ? records[0].environment : ''],
  ['Total test rows', total],
  ['PASS', count(records, 'status', 'PASS')],
  ['FAIL', count(records, 'status', 'FAIL')],
  ['FLAKY', count(records, 'status', 'FLAKY')],
  ['NOT RUN', count(records, 'status', 'NOT RUN')],
  ['Known defects (expected failures counted as PASS)', records.filter((r) => r.note).length],
  ['Pass rate (PASS / total)', total ? `${Math.round((count(records, 'status', 'PASS') / total) * 1000) / 10}%` : 'n/a'],
];
for (const [metric, value] of summaryRows) summary.addRow({ metric, value });
summary.addRow({});
summary.addRow({ metric: 'Results by device', value: '' });
for (const [device, s] of Object.entries(byDevice)) {
  summary.addRow({ metric: device, value: `PASS ${s.PASS || 0} | FAIL ${s.FAIL || 0} | FLAKY ${s.FLAKY || 0} | NOT RUN ${s['NOT RUN'] || 0}` });
}

const columns = [
  { header: 'Test case ID', key: 'test_case_id', width: 16 },
  { header: 'Feature', key: 'feature', width: 40 },
  { header: 'Scenario', key: 'scenario', width: 60 },
  { header: 'Environment', key: 'environment', width: 28 },
  { header: 'Locale', key: 'locale', width: 8 },
  { header: 'Device / project', key: 'device', width: 22 },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Note', key: 'note', width: 30 },
  { header: 'Expected', key: 'expected', width: 60 },
  { header: 'Actual', key: 'actual', width: 40 },
  { header: 'Error', key: 'error', width: 60 },
  { header: 'Duration (ms)', key: 'duration_ms', width: 14 },
  { header: 'Evidence', key: 'evidence', width: 40 },
  { header: 'Severity', key: 'severity', width: 12 },
];

function addSheet(name, rows) {
  const ws = wb.addWorksheet(name);
  ws.columns = columns;
  ws.getRow(1).font = headerStyle.font;
  ws.getRow(1).fill = headerStyle.fill;
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: 'A1', to: { row: 1, column: columns.length } };
  for (const r of rows) {
    const row = ws.addRow(r);
    const fill = statusFill[r.status];
    if (fill) row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
  }
  return ws;
}

addSheet('Detailed Results', records);
addSheet('Failures', records.filter((r) => r.status === 'FAIL' || r.status === 'FLAKY'));

// Discovery changes
const diffPath = path.join(__dirname, '..', 'state', locale, 'discovery-diff.json');
const discovery = wb.addWorksheet('Discovery Changes');
discovery.columns = [{ header: 'Change', key: 'change', width: 14 }, { header: 'Section', key: 'section', width: 50 }, { header: 'Detail', key: 'detail', width: 60 }];
discovery.getRow(1).font = headerStyle.font;
discovery.getRow(1).fill = headerStyle.fill;
if (fs.existsSync(diffPath)) {
  const diff = JSON.parse(fs.readFileSync(diffPath, 'utf8'));
  for (const s of diff.added) discovery.addRow({ change: 'Added', section: s, detail: 'New on the homepage since the previous scan; needs test coverage' });
  for (const s of diff.removed) discovery.addRow({ change: 'Removed', section: s, detail: 'Missing from the homepage; confirm the removal was intentional before changing the inventory' });
  for (const c of diff.changed) discovery.addRow({ change: 'Changed', section: c.name, detail: `element counts ${JSON.stringify(c.before)} -> ${JSON.stringify(c.after)}` });
  if (!diff.added.length && !diff.removed.length && !diff.changed.length) discovery.addRow({ change: 'None', section: '', detail: 'No changes since the previous scan' });
} else {
  discovery.addRow({ change: 'n/a', section: '', detail: 'No discovery diff for this locale' });
}

const planPath = path.join(__dirname, '..', 'state', locale, 'plan-changes.json');
const coverage = wb.addWorksheet('Coverage & Plan');
coverage.columns = [{ header: 'Item', key: 'item', width: 14 }, { header: 'Feature / section', key: 'feature', width: 50 }, { header: 'Status', key: 'status', width: 36 }];
coverage.getRow(1).font = headerStyle.font;
coverage.getRow(1).fill = headerStyle.fill;
if (fs.existsSync(planPath)) {
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  const tcIds = plan.newIds || {};
  for (const f of plan.newFeatures) coverage.addRow({ item: 'New section', feature: f, status: 'Test cases appended; not yet executed' });
  for (const f of plan.retiredFeatures) coverage.addRow({ item: 'Retired section', feature: f, status: 'Cases kept and flagged; confirm removal' });
  coverage.addRow({ item: 'Summary', feature: `${plan.appendedTestCases} test cases appended`, status: `${plan.retiredTestCasesFlagged} cases flagged` });
} else {
  coverage.addRow({ item: 'n/a', feature: '', status: 'No plan changes recorded for this locale' });
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
wb.xlsx.writeFile(outPath).then(() => console.log(`[run-xlsx ${locale}] ${total} rows -> ${outPath}`));
