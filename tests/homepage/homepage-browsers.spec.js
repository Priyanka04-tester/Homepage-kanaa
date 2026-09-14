/**
 * Executes the 3 generated "Cross-browser — <browser>" global test cases: a smoke
 * path (load, hero carousel, header nav link, add-to-cart) run on chromium, firefox,
 * and webkit via the dedicated playwright.homepage.config.js (kept separate from the
 * root config, which intentionally stays chromium-only for the rest of the suite —
 * see playwright.homepage.config.js for why).
 */
const { test, expect } = require('@playwright/test');
const { findGlobalTestCase, recordExecution, evidenceDir, LOCALE_PATH, PATTERNS, NEXT_CONTROL_PATTERN } = require('../../utils/qaState');

test('Cross-browser homepage smoke', async ({ page }, testInfo) => {
  const browserName = testInfo.project.name;
  const tc = findGlobalTestCase(`Cross-browser — ${browserName}`);
  const dir = evidenceDir(tc.id);
  const findings = [];

  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/kanaa|كانا/i);

  const next = page.getByRole('button', { name: NEXT_CONTROL_PATTERN }).first();
  try {
    await expect(next).toBeVisible({ timeout: 10_000 });
    await next.click();
    await page.waitForTimeout(400);
  } catch (e) {
    findings.push(`Hero carousel Next control failed: ${e.message.slice(0, 150)}`);
  }

  try {
    // Not matched by link text — that's translated per locale. Any real category
    // link (locale-path prefix, .html suffix, not "#") works for a smoke check.
    // Next.js client-side routing changes the URL via the History API, not a full
    // navigation, so waitForLoadState('domcontentloaded') would resolve immediately
    // against the *already-loaded* page — wait for the URL itself instead.
    const catLink = page.locator(`a[href^="${LOCALE_PATH}"][href$=".html"]`).first();
    const href = await catLink.getAttribute('href');
    await catLink.click();
    await page.waitForURL((url) => url.pathname === href, { timeout: 10_000 });
  } catch (e) {
    findings.push(`Header category nav failed: ${e.message.slice(0, 150)} (at ${page.url()})`);
  }
  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' }).catch(() => {});

  try {
    const addBtn = page.getByRole('button', { name: PATTERNS.addToCart }).first();
    await addBtn.click({ timeout: 5000 });
    await expect(page.getByText(PATTERNS.viewCartConfirmation)).toBeVisible({ timeout: 10_000 });
  } catch (e) {
    findings.push(`Add to Cart smoke failed: ${e.message.slice(0, 150)}`);
  }

  await page.screenshot({ path: require('path').join(dir, 'final-state.png') }).catch(() => {});
  require('fs').writeFileSync(require('path').join(dir, 'smoke-findings.json'), JSON.stringify(findings, null, 2), 'utf-8');

  const status = findings.length === 0 ? 'PASS' : 'FAIL';
  recordExecution({
    testCaseId: tc.id,
    status,
    browser: browserName,
    viewport: page.viewportSize(),
    evidencePath: `evidence/homepage/${tc.id}/`,
    notes: 'Load + hero carousel + header nav link + Add to Cart smoke path.',
    actualResult: status === 'PASS' ? `Smoke path passed on ${browserName}.` : findings.join(' | '),
  });
  expect(findings, findings.join('\n')).toEqual([]);
});
