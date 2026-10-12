/**
 * Compares a previous homepage map with the current one and appends the result
 * to the per-locale discovery history. Sections are matched by name.
 *
 *   node scripts/compare-homepage-map.js <previous.json> <current.json> <locale>
 *
 * Writes state/<locale>/discovery-diff.json and appends one line to
 * state/<locale>/discovery-history.jsonl. Nothing is deleted from the inventory:
 * removed sections are reported so they can be confirmed as intentional.
 */
const fs = require('fs');
const path = require('path');

const [, , previousPath, currentPath, locale = 'en'] = process.argv;
if (!previousPath || !currentPath) {
  console.error('usage: node scripts/compare-homepage-map.js <previous.json> <current.json> [locale]');
  process.exit(2);
}

const readMap = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const previous = readMap(previousPath);
const current = readMap(currentPath);

const key = (name) => name.trim().toLowerCase();
const names = (map) => (map.sections || []).map((s) => s.name);
const byKey = (map) => new Map((map.sections || []).map((s) => [key(s.name), s]));
const prevNames = names(previous);
const currNames = names(current);
const prevByKey = byKey(previous);
const currByKey = byKey(current);

const added = currNames.filter((n) => !prevByKey.has(key(n)));
const removed = prevNames.filter((n) => !currByKey.has(key(n)));

const changed = [];
for (const [k, after] of currByKey) {
  const before = prevByKey.get(k);
  if (!before) continue;
  const b = JSON.stringify(before.elementCounts || {});
  const a = JSON.stringify(after.elementCounts || {});
  if (b !== a) changed.push({ name: after.name, before: before.elementCounts, after: after.elementCounts });
}

const diff = {
  locale,
  comparedAt: new Date().toISOString(),
  previous: { file: path.basename(previousPath), capturedAt: previous.meta && previous.meta.capturedAt, sections: prevNames.length },
  current: { file: path.basename(currentPath), capturedAt: current.meta && current.meta.capturedAt, sections: currNames.length },
  added,
  removed,
  changed,
};

const stateDir = path.join(__dirname, '..', 'state', locale);
fs.mkdirSync(stateDir, { recursive: true });
fs.writeFileSync(path.join(stateDir, 'discovery-diff.json'), JSON.stringify(diff, null, 2));
fs.appendFileSync(
  path.join(stateDir, 'discovery-history.jsonl'),
  JSON.stringify({ comparedAt: diff.comparedAt, added: added.length, removed: removed.length, changed: changed.length, sections: currNames.length }) + '\n'
);

console.log(`[discovery ${locale}] sections ${prevNames.length} -> ${currNames.length}; added ${added.length}, removed ${removed.length}, changed ${changed.length}`);
for (const n of added) console.log(`  + ${n}`);
for (const n of removed) console.log(`  - ${n}`);
for (const c of changed) console.log(`  ~ ${c.name}`);
