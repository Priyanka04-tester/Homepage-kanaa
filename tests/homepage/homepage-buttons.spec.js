/**
 * Executes the generated "<section> — buttons" test cases against every button
 * state/homepage-map.json found in that section (see agents/homepage-executor.md).
 *
 * Excluded from this generic sweep (each has its own dedicated, more careful spec —
 * duplicating the click here would risk the exact failure modes README.md already
 * documents for this dev environment):
 *  - "Previous slide" / "Next slide"      -> homepage-sliders.spec.js
 *  - "Add to wishlist" / "Add to Cart"    -> homepage-products.spec.js (README: the
 *    stock/price check behind Add to Cart appears to throttle on repeated calls)
 *  - The language switcher ("عربي")       -> covered by the RTL/localization global
 *    test case; switching mid-sweep would break every later English-text assertion
 *  - "Sign In"                            -> opens the real login modal; login itself
 *    is intentionally out of scope (always sends a real OTP, see CLAUDE.md)
 *  - Anything with "chat" in its name     -> third-party Haptik chat widget, opens an
 *    unpredictable external iframe
 *
 * A button recorded at discovery time but not found on this run's fresh load is logged
 * as a note, not a failure: several of this homepage's widgets are personalized/rotate
 * content between loads (confirmed — see specs/homepage-test-plan.md), so a mismatch
 * here is expected noise, not evidence of breakage on its own.
 */
const { test, expect } = require('@playwright/test');
const {
  loadHomepageMap, findTestCase, recordExecution, evidenceDir,
  LOCALE_PATH, PATTERNS, WISHLIST_PATTERN, PREV_CONTROL_PATTERN, NEXT_CONTROL_PATTERN,
} = require('../../utils/qaState');

function isExcluded(name) {
  return PREV_CONTROL_PATTERN.test(name) || NEXT_CONTROL_PATTERN.test(name)
    || WISHLIST_PATTERN.test(name) || PATTERNS.addToCart.test(name)
    || PATTERNS.switchToOtherLocale.test(name) || /chat/i.test(name);
}

const map = loadHomepageMap();
const sectionsWithButtons = map.sections.filter((s) => s.elementCounts && s.elementCounts.buttons > 0);

for (const section of sectionsWithButtons) {
  const tc = findTestCase(section.id, 'buttons');
  const candidates = section.elements.buttons.filter((b) => b.visible && !isExcluded(b.name));

  test(`${tc.id}: ${section.name || section.id} — buttons behave as expected`, async ({ page }, testInfo) => {
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });

    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const failures = [];
    const notFound = [];
    const disabledSkipped = [];
    let tested = 0;

    for (const btn of candidates) {
      const name = btn.name || '(unnamed)';

      if (btn.disabled) {
        disabledSkipped.push(name);
        continue;
      }

      try {
        const before = consoleErrors.length;
        const target = page.getByRole('button', { name: btn.name, exact: false }).first();
        const count = await target.count();
        if (count === 0) {
          notFound.push(name);
          continue;
        }
        await target.scrollIntoViewIfNeeded();
        await expect(target, `"${name}" should be visible`).toBeVisible({ timeout: 5000 });
        await target.click({ timeout: 5000 });
        await page.waitForTimeout(400);
        tested += 1;

        const newErrors = consoleErrors.slice(before);
        if (newErrors.length) failures.push(`"${name}": introduced console error(s): ${newErrors.join(' | ').slice(0, 200)}`);

        // Restore a clean homepage state before the next button in this section.
        if (page.url() !== new URL(LOCALE_PATH, page.url()).toString() && !page.url().endsWith(LOCALE_PATH)) {
          await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
        }
        await page.keyboard.press('Escape').catch(() => {});
      } catch (e) {
        failures.push(`"${name}": ${e.message.slice(0, 150)}`);
        await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' }).catch(() => {});
      }
    }

    const status = failures.length === 0 ? 'PASS' : 'FAIL';
    let evidencePath = null;
    if (status === 'FAIL' || notFound.length) {
      const dir = evidenceDir(tc.id);
      if (status === 'FAIL') await page.screenshot({ path: require('path').join(dir, 'last-state.png') }).catch(() => {});
      require('fs').writeFileSync(require('path').join(dir, 'button-check.json'), JSON.stringify({ tested, failures, notFound, disabledSkipped }, null, 2), 'utf-8');
      evidencePath = `evidence/homepage/${tc.id}/`;
    }

    recordExecution({
      testCaseId: tc.id,
      status,
      browser: testInfo.project.name,
      viewport: page.viewportSize(),
      evidencePath,
      notes: `Tested ${tested}/${candidates.length} eligible buttons (${disabledSkipped.length} disabled, correctly skipped, ${notFound.length} not found on this load — see button-check.json).`,
      actualResult: status === 'PASS' ? 'All tested buttons clicked without introducing a console error.' : failures.join(' | ').slice(0, 500),
    });

    expect(failures, failures.join('\n')).toEqual([]);
  });
}
