/**
 * Append-only update of the homepage test plan after a discovery scan.
 *
 *   node scripts/append-plan-changes.js <sandbox-state-dir> <locale>
 *
 * <sandbox-state-dir> is a state/<locale> folder produced by running
 * scripts/generate-test-plan.js against the NEW homepage map in a scratch copy.
 * Existing test cases, requirements, scenarios and traceability rows are never
 * renumbered or deleted:
 *   - cases whose feature (section) is new are appended with the next free IDs;
 *   - cases whose section is no longer on the homepage get a status_note and stay.
 * Run it once per scan; it is idempotent (already-appended features are skipped).
 */
const fs = require('fs');
const path = require('path');

const [, , sandboxDir, locale = 'en'] = process.argv;
if (!sandboxDir) {
  console.error('usage: node scripts/append-plan-changes.js <sandbox-state-dir> [locale]');
  process.exit(2);
}

const stateDir = path.join(__dirname, '..', 'state', locale);
const read = (dir, name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const write = (dir, name, data) => fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2));

const realCases = read(stateDir, 'test-cases.json');
const sandCases = read(sandboxDir, 'test-cases.json');
const realReqs = read(stateDir, 'requirements.json');
const sandReqs = read(sandboxDir, 'requirements.json');
const realScen = read(stateDir, 'scenarios.json');
const sandScen = read(sandboxDir, 'scenarios.json');
const realTrace = read(stateDir, 'traceability.json');
const sandTrace = read(sandboxDir, 'traceability.json');

const key = (feature) => feature.trim().toLowerCase();
// Section IDs are assigned by position in the discovery map, so they shift when sections
// are added or removed. Re-point existing cases at the section that has the same name today.
const currentMap = read(stateDir, 'homepage-map.json');
const idByName = new Map((currentMap.sections || []).map((s) => [key(s.name), s.id]));
let remapped = 0;
for (const c of realCases) {
  const sectionName = key((c.feature || '').split(' — ')[0]);
  const id = idByName.get(sectionName);
  if (!id || c.sectionId === id) continue;
  c.sectionId = id;
  remapped++;
  for (const r of realReqs) if (r.id === c.requirementId) r.sectionId = id;
  for (const s of realScen) if (s.id === c.scenarioId) s.sectionId = id;
  for (const t of realTrace) if (t.testCaseId === c.id) t.sectionId = id;
}

const realFeatures = new Set(realCases.map((c) => key(c.feature)));
const sandFeatures = new Set(sandCases.map((c) => key(c.feature)));
const newFeatures = [...sandFeatures].filter((f) => !realFeatures.has(f));
const retiredFeatures = [...realFeatures].filter((f) => !sandFeatures.has(f));

const nextNumber = (items, prefix) => {
  const nums = items.map((i) => Number((i.id || '').replace(prefix, ''))).filter(Number.isFinite);
  return (nums.length ? Math.max(...nums) : 0) + 1;
};
let tcNext = nextNumber(realCases, /^TC-HOME-[A-Z]+-/.exec(realCases[0].id)[0]);
const tcPrefix = /^TC-HOME-[A-Z]+-/.exec(realCases[0].id)[0];
const scPrefix = realScen.length ? /^SC-HOME-[A-Z]+-/.exec(realScen[0].id)[0] : `SC-HOME-${locale.toUpperCase()}-`;
const reqPrefix = realReqs.length ? /^REQ-HOME-[A-Z]+-/.exec(realReqs[0].id)[0] : `REQ-HOME-${locale.toUpperCase()}-`;
let scNext = nextNumber(realScen, scPrefix);
let reqNext = nextNumber(realReqs, reqPrefix);
const pad = (n) => String(n).padStart(3, '0');

const idMap = { tc: {}, sc: {}, req: {} };
let added = 0;
for (const sandCase of sandCases.filter((c) => newFeatures.includes(key(c.feature)))) {
  const newTc = `${tcPrefix}${pad(tcNext++)}`;
  const newSc = `${scPrefix}${pad(scNext++)}`;
  const newReq = `${reqPrefix}${pad(reqNext++)}`;
  idMap.tc[sandCase.id] = newTc;
  idMap.sc[sandCase.scenarioId] = newSc;
  idMap.req[sandCase.requirementId] = newReq;

  const srcReq = sandReqs.find((r) => r.id === sandCase.requirementId);
  const srcScen = sandScen.find((s) => s.id === sandCase.scenarioId);
  realReqs.push({ ...srcReq, id: newReq });
  realScen.push({ ...srcScen, id: newSc, requirementId: newReq });
  realCases.push({ ...sandCase, id: newTc, requirementId: newReq, scenarioId: newSc, evidencePath: `evidence/homepage/${locale}/${newTc}/` });
  added++;
}

const sandTraceFor = (tcId) => sandTrace.find((t) => t.testCaseId === tcId);
for (const sandCase of sandCases.filter((c) => newFeatures.includes(key(c.feature)))) {
  const t = sandTraceFor(sandCase.id);
  if (!t) continue;
  realTrace.push({ ...t, requirementId: idMap.req[t.requirementId], scenarioId: idMap.sc[t.scenarioId], testCaseId: idMap.tc[t.testCaseId] });
}

let retired = 0;
for (const c of realCases) {
  if (retiredFeatures.includes(key(c.feature)) && !c.status_note) {
    c.status_note = `Section no longer on the homepage (discovery scan ${new Date().toISOString().slice(0, 10)}). Kept for traceability; confirm the removal is intentional before retiring this case.`;
    retired++;
  }
}

write(stateDir, 'test-cases.json', realCases);
write(stateDir, 'requirements.json', realReqs);
write(stateDir, 'scenarios.json', realScen);
write(stateDir, 'traceability.json', realTrace);
fs.writeFileSync(path.join(stateDir, 'plan-changes.json'), JSON.stringify({
  appliedAt: new Date().toISOString(),
  newFeatures,
  retiredFeatures,
  remappedSectionIds: remapped,
  appendedTestCases: added,
  retiredTestCasesFlagged: retired,
  newIds: idMap.tc,
}, null, 2));

console.log(`[plan ${locale}] appended ${added} test cases for ${newFeatures.length} new features; flagged ${retired} cases for ${retiredFeatures.length} retired features; total cases now ${realCases.length}`);
