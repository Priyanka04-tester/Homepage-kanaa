/**
 * Executes the two remaining global test cases: interaction robustness (spec
 * sections 16-17: rapid clicks, back/forward navigation, refresh) and a bounded,
 * observational performance check (spec section 22 — not a load/stress test).
 */
const { test, expect } = require('@playwright/test');
const { findGlobalTestCase, recordExecution, evidenceDir, LOCALE_PATH, BASE_URL, PATTERNS, NEXT_CONTROL_PATTERN } = require('../../utils/qaState');

const negativeTc = findGlobalTestCase('interaction robustness');
test(`${negativeTc.id}: Global negative/edge — interaction robustness`, async ({ page }, testInfo) => {
  const tc = negativeTc;
  const dir = evidenceDir(tc.id);
  const findings = [];

  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  // 1. Rapid (but real, sequential — not concurrent) double-click on Add to Cart.
  // An earlier version fired two clicks via Promise.all(), which is a race on the
  // same locator rather than a realistic fast double-click, and once corrupted the
  // page's navigation history for the rest of this test (see fix note below). Two
  // quick sequential clicks reproduce the user scenario without that risk.
  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
  // Product widgets lazy-mount as they scroll into view (not just their images) — scroll
  // partway down first, or "Add to Cart" won't exist in the DOM yet on a cold load.
  await page.evaluate(() => { (document.getElementById('main-container') || document.scrollingElement).scrollTop = 900; });
  await page.waitForTimeout(500);
  const addToCartBtn = page.getByRole('button', { name: PATTERNS.addToCart }).first();
  if (await addToCartBtn.count() > 0) {
    const before = consoleErrors.length;
    try {
      await addToCartBtn.click({ timeout: 5000 });
      await addToCartBtn.click({ timeout: 2000 }).catch(() => {}); // 2nd click may legitimately be a no-op if the button's label/state already changed
      await page.waitForTimeout(1000);
      if (consoleErrors.length > before) findings.push(`Rapid double-click on Add to Cart introduced console error(s): ${consoleErrors.slice(before).join(' | ').slice(0, 150)}`);
    } catch (e) {
      findings.push(`Rapid double-click on Add to Cart failed: ${e.message.slice(0, 150)}`);
    }
  } else {
    findings.push('No Add to Cart button found for rapid-click check');
  }

  // 2. Back / forward through homepage -> PDP -> homepage. Run in its own fresh
  // navigation and independent of step 1 so a glitch here can't be blamed on state
  // step 1 left behind, and vice versa.
  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { (document.getElementById('main-container') || document.scrollingElement).scrollTop = 900; });
  await page.waitForTimeout(500);
  const firstCard = page.getByRole('button', { name: PATTERNS.addToCart }).first().locator('xpath=ancestor::a[1]');
  const pdpHref = await firstCard.getAttribute('href').catch(() => null);
  if (pdpHref) {
    await firstCard.click();
    await page.waitForLoadState('domcontentloaded');
    const onPdp = page.url().includes(pdpHref.replace(BASE_URL, '')) || page.url() !== new URL(LOCALE_PATH, BASE_URL).toString();
    if (!onPdp) findings.push(`Clicking a product card did not navigate away from the homepage (still at ${page.url()})`);
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500); // let a client-side router finish settling before checking
    if (page.url() === 'about:blank' || !page.url().includes(LOCALE_PATH)) {
      findings.push(`Back navigation did not return to homepage (at ${page.url()}) — reproduced once; rerun to confirm before filing as a bug`);
    } else {
      await page.goForward({ waitUntil: 'domcontentloaded' }).catch(() => {});
    }
  } else {
    findings.push('Could not resolve a product card href for back/forward check');
  }

  // 3. Refresh shortly after navigation (mid-load) — independent fresh navigation again.
  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const stillUsable = await page.getByPlaceholder(PATTERNS.searchPlaceholder).count();
  if (stillUsable === 0) findings.push('Search box not present after a reload — page may not have settled into a usable state');

  await page.screenshot({ path: require('path').join(dir, 'final-state.png') }).catch(() => {});
  require('fs').writeFileSync(require('path').join(dir, 'robustness-findings.json'), JSON.stringify(findings, null, 2), 'utf-8');

  const status = findings.length === 0 ? 'PASS' : 'FAIL';
  recordExecution({
    testCaseId: tc.id,
    status,
    browser: testInfo.project.name,
    viewport: page.viewportSize(),
    evidencePath: `evidence/homepage/${tc.id}/`,
    notes: 'Rapid double-click Add to Cart, back/forward through a PDP, and reload-shortly-after-navigation were exercised, each from an independent fresh navigation.',
    actualResult: status === 'PASS' ? 'No crashes or stuck state under any scenario.' : findings.join(' | '),
  });
  expect(findings, findings.join('\n')).toEqual([]);
});

const perfTc = findGlobalTestCase('initial load');
test(`${perfTc.id}: Global performance observation — initial load`, async ({ page, context }, testInfo) => {
  const tc = perfTc;
  const dir = evidenceDir(tc.id);
  const requestsSeen = [];
  page.on('request', (req) => requestsSeen.push(req.url()));

  const start = Date.now();
  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: NEXT_CONTROL_PATTERN }).first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  const heroInteractiveMs = Date.now() - start;

  const counts = {};
  for (const url of requestsSeen) counts[url] = (counts[url] || 0) + 1;
  const duplicates = Object.entries(counts).filter(([, n]) => n > 1).map(([url, n]) => `${n}x ${url}`);

  require('fs').writeFileSync(require('path').join(dir, 'performance-observation.json'), JSON.stringify({ heroInteractiveMs, duplicateRequestCount: duplicates.length, duplicates: duplicates.slice(0, 30) }, null, 2), 'utf-8');

  // Observational: report, don't hard-fail the suite over a load-time number, but do fail
  // on a clearly pathological duplicate-fetch pattern (the kind that would 2x real API load).
  const status = duplicates.length > 10 ? 'FAIL' : 'PASS';
  recordExecution({
    testCaseId: tc.id,
    status,
    browser: testInfo.project.name,
    viewport: page.viewportSize(),
    evidencePath: `evidence/homepage/${tc.id}/`,
    notes: `Hero interactive in ${heroInteractiveMs}ms; ${duplicates.length} URL(s) fetched more than once in one load.`,
    actualResult: `heroInteractiveMs=${heroInteractiveMs}, duplicateRequestCount=${duplicates.length}`,
  });
  expect(duplicates.length, `Excessive duplicate requests: ${duplicates.slice(0, 5).join(', ')}`).toBeLessThanOrEqual(10);
});
