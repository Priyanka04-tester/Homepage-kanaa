/**
 * Executes the 3 generated "Cross-browser — <browser>" global test cases: a smoke
 * path (load, hero carousel, header nav link, add-to-cart) run on chromium, firefox,
 * and webkit via the dedicated playwright.homepage.config.js (kept separate from the
 * root config, which intentionally stays chromium-only for the rest of the suite —
 * see playwright.homepage.config.js for why).
 */
const { test, expect } = require('@playwright/test');
const { findGlobalTestCase, recordExecution, evidenceDir } = require('../../utils/qaState');

const LOCALE_PATH = process.env.LOCALE_PATH || '/en-sa/';

test('Cross-browser homepage smoke', async ({ page }, testInfo) => {
  const browserName = testInfo.project.name;
  const tc = findGlobalTestCase(`Cross-browser — ${browserName}`);
  const dir = evidenceDir(tc.id);
  const findings = [];

  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Kanaa/i);

  const next = page.getByRole('button', { name: 'Next slide' }).first();
  try {
    await expect(next).toBeVisible({ timeout: 10_000 });
    await next.click();
    await page.waitForTimeout(400);
  } catch (e) {
    findings.push(`Hero carousel Next control failed: ${e.message.slice(0, 150)}`);
  }

  try {
    // Next.js client-side routing: the URL changes via the History API, not a full
    // navigation, so waitForLoadState('domcontentloaded') resolves immediately against
    // the *already-loaded* page and never actually waits for the route change. Wait for
    // the URL itself instead.
    await page.getByRole('link', { name: 'Toys & Games' }).first().click();
    await page.waitForURL(/toys-games/, { timeout: 10_000 });
  } catch (e) {
    findings.push(`Header category nav failed: ${e.message.slice(0, 150)} (at ${page.url()})`);
  }
  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' }).catch(() => {});

  try {
    const addBtn = page.getByRole('button', { name: 'Add to Cart' }).first();
    await addBtn.click({ timeout: 5000 });
    await expect(page.getByText('View Cart')).toBeVisible({ timeout: 10_000 });
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
