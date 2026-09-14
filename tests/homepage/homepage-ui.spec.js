/**
 * Executes the generated "<section> — images" test cases (one page load, all
 * sections checked together — much cheaper than reloading per section), plus the
 * three global non-functional test cases: accessibility (keyboard & names), RTL/
 * localization, and console/network health.
 */
const { test, expect } = require('@playwright/test');
const { loadHomepageMap, findTestCase, findGlobalTestCase, recordExecution, evidenceDir, isFirstPartyUrl } = require('../../utils/qaState');

const LOCALE_PATH = process.env.LOCALE_PATH || '/en-sa/';
const map = loadHomepageMap();
const sectionsWithImages = map.sections.filter((s) => s.elementCounts && s.elementCounts.images > 0);
const sectionsWithInputs = map.sections.filter((s) => s.elementCounts && s.elementCounts.inputs > 0);

test('HOME-IMG-SWEEP: broken-image check across all sections', async ({ page }, testInfo) => {
  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
  // Full scroll of the real scroll container (#main-container) to trigger native lazy-loading —
  // see agents/homepage-explorer.md for why this isn't window.scrollTo on this site.
  for (let i = 1; i <= 12; i++) {
    await page.evaluate((step) => {
      const scroller = document.getElementById('main-container') || document.scrollingElement;
      scroller.scrollTop = (scroller.scrollHeight / 12) * step;
    }, i);
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(800);

  const brokenNow = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src') || img.currentSrc)
  );
  const brokenSet = new Set(brokenNow);

  for (const section of sectionsWithImages) {
    const tc = findTestCase(section.id, 'images');
    const sectionSrcs = section.elements.images.map((i) => i.src).filter(Boolean);
    const brokenInSection = sectionSrcs.filter((src) => brokenSet.has(src));
    const status = brokenInSection.length === 0 ? 'PASS' : 'FAIL';

    recordExecution({
      testCaseId: tc.id,
      status,
      browser: testInfo.project.name,
      viewport: page.viewportSize(),
      evidencePath: status === 'FAIL' ? `evidence/homepage/${tc.id}/` : null,
      notes: `${sectionSrcs.length} images checked after full-page scroll.`,
      actualResult: status === 'PASS' ? 'No broken images after lazy-load.' : `Broken: ${brokenInSection.join(', ')}`,
    });
    if (status === 'FAIL') {
      const dir = evidenceDir(tc.id);
      require('fs').writeFileSync(require('path').join(dir, 'broken-images.json'), JSON.stringify(brokenInSection, null, 2), 'utf-8');
    }
  }

  expect(brokenNow.length, `Broken images site-wide: ${brokenNow.join(', ')}`).toBe(0);
});

const a11yTc = findGlobalTestCase('keyboard & names');
test(`${a11yTc.id}: Global accessibility — keyboard reachability & accessible names`, async ({ page }, testInfo) => {
  const tc = a11yTc;
  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });

  const dir = evidenceDir(tc.id);
  const findings = [];

  // Tab through the header/hero region and confirm a visible focus indicator at each stop.
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      return {
        tag: el.tagName,
        name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 60),
        hasOutline: style.outlineStyle !== 'none' || style.boxShadow !== 'none',
      };
    });
    if (info && !info.hasOutline) findings.push(`Tab stop ${i} (<${info.tag}> "${info.name}") has no visible focus indicator (no outline/box-shadow)`);
  }
  await page.screenshot({ path: require('path').join(dir, 'final-focus-state.png') }).catch(() => {});

  // Cross-reference the static discovery data for interactive elements with no accessible name.
  const unnamed = [];
  for (const section of map.sections) {
    if (!section.elements) continue;
    for (const l of section.elements.links) if (l.visible && !l.name?.trim()) unnamed.push(`${section.id} link href="${l.href}"`);
    for (const b of section.elements.buttons) if (b.visible && !b.name?.trim()) unnamed.push(`${section.id} button`);
  }
  if (unnamed.length) findings.push(`${unnamed.length} visible interactive element(s) with no accessible name (sample: ${unnamed.slice(0, 5).join('; ')})`);

  require('fs').writeFileSync(require('path').join(dir, 'accessibility-findings.json'), JSON.stringify({ findings, unnamedCount: unnamed.length, unnamedSample: unnamed.slice(0, 20) }, null, 2), 'utf-8');

  const status = findings.length === 0 ? 'PASS' : 'FAIL';
  recordExecution({
    testCaseId: tc.id,
    status,
    browser: testInfo.project.name,
    viewport: page.viewportSize(),
    evidencePath: `evidence/homepage/${tc.id}/`,
    notes: '15 Tab stops checked for visible focus; homepage-map.json cross-checked for blank accessible names.',
    actualResult: status === 'PASS' ? 'All checked stops had visible focus and non-empty accessible names.' : findings.join(' | ').slice(0, 500),
  });
  // Accessibility gaps are recorded as findings for bug triage, not a hard pipeline failure.
  test.info().annotations.push({ type: 'a11y-findings', description: String(findings.length) });
});

const rtlTc = findGlobalTestCase('RTL / Arabic');
test(`${rtlTc.id}: Global localization — Arabic / RTL switch`, async ({ page }, testInfo) => {
  const tc = rtlTc;
  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
  const dir = evidenceDir(tc.id);
  const findings = [];

  await page.screenshot({ path: require('path').join(dir, 'before-ltr.png') });

  const switcher = page.getByRole('button', { name: /عربي/ });
  if (await switcher.count() === 0) {
    findings.push('Language switcher control not found by expected accessible name "عربي"');
  } else {
    await switcher.first().click();
    await page.waitForTimeout(1500);
    const dir_attr = await page.evaluate(() => document.documentElement.getAttribute('dir') || document.documentElement.dir);
    if (dir_attr !== 'rtl') findings.push(`Expected <html dir="rtl"> after switching language, got dir="${dir_attr}"`);

    const hasHorizontalOverflow = await page.evaluate(() => {
      const el = document.getElementById('main-container') || document.documentElement;
      return el.scrollWidth > el.clientWidth + 2;
    });
    if (hasHorizontalOverflow) findings.push('Horizontal overflow detected after switching to RTL');

    await page.screenshot({ path: require('path').join(dir, 'after-rtl.png') });
  }

  const status = findings.length === 0 ? 'PASS' : 'FAIL';
  recordExecution({
    testCaseId: tc.id,
    status,
    browser: testInfo.project.name,
    viewport: page.viewportSize(),
    evidencePath: `evidence/homepage/${tc.id}/`,
    notes: 'Clicked header language switcher and checked dir attribute + horizontal overflow.',
    actualResult: status === 'PASS' ? 'RTL applied cleanly with no overflow.' : findings.join(' | '),
  });
  expect(findings, findings.join('\n')).toEqual([]);
});

const consoleNetTc = findGlobalTestCase('Console & network health');
test(`${consoleNetTc.id}: Global console & network health — first-party only`, async ({ page }, testInfo) => {
  const tc = consoleNetTc;
  const dir = evidenceDir(tc.id);

  const consoleErrors = [];
  const firstPartyFailures = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('response', (res) => {
    if (res.status() >= 400 && isFirstPartyUrl(res.url())) {
      firstPartyFailures.push(`${res.request().method()} ${res.url()} -> ${res.status()}`);
    }
  });
  page.on('requestfailed', (req) => {
    if (isFirstPartyUrl(req.url())) firstPartyFailures.push(`${req.method()} ${req.url()} -> ${req.failure()?.errorText}`);
  });

  await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

  const firstPartyConsoleErrors = consoleErrors.filter((t) => !/googletagmanager|google-analytics|doubleclick|analytics\.google|google\.com\/ccm/.test(t));

  require('fs').writeFileSync(require('path').join(dir, 'console-network.json'), JSON.stringify({ firstPartyConsoleErrors, firstPartyFailures }, null, 2), 'utf-8');

  const status = firstPartyConsoleErrors.length === 0 && firstPartyFailures.length === 0 ? 'PASS' : 'FAIL';
  recordExecution({
    testCaseId: tc.id,
    status,
    browser: testInfo.project.name,
    viewport: page.viewportSize(),
    evidencePath: `evidence/homepage/${tc.id}/`,
    notes: 'Fresh homepage load; console + network listeners attached before navigation; classified by host.',
    actualResult: status === 'PASS' ? 'No first-party console errors or failed requests.' : `Console: ${firstPartyConsoleErrors.length}, Network: ${firstPartyFailures.join(' | ').slice(0, 400)}`,
  });
  // This is expected to fail today — see the image-loading 403/ORB failures already
  // captured at discovery time (specs/homepage-test-plan.md). Recorded, not silenced.
  expect(firstPartyFailures, firstPartyFailures.join('\n')).toEqual([]);
});

let cumulativeInputOffset = 0;
for (const section of sectionsWithInputs) {
  const tc = findTestCase(section.id, 'inputs');
  const localCount = section.elementCounts.inputs;
  const offset = cumulativeInputOffset;
  cumulativeInputOffset += localCount;

  test(`${tc.id}: ${section.name || section.id} — input edge values`, async ({ page }, testInfo) => {
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    const dir = evidenceDir(tc.id);
    const findings = [];
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    for (let i = 0; i < localCount; i++) {
      const input = page.getByRole('textbox').nth(offset + i);
      const visible = await input.isVisible().catch(() => false);
      if (!visible) { continue; } // hidden duplicate (e.g. mobile-only search) — nothing to type into

      const before = consoleErrors.length;
      try {
        await input.fill('toys');
        await page.waitForTimeout(400);
        await input.fill('');
        await input.fill('a'.repeat(220));
        await page.waitForTimeout(200);
        await input.fill('لعب أطفال 玩具 🧸');
        await page.waitForTimeout(200);
        await input.fill('');
      } catch (e) {
        findings.push(`input #${i}: interaction failed: ${e.message.slice(0, 150)}`);
      }
      if (consoleErrors.length > before) findings.push(`input #${i}: introduced console error(s): ${consoleErrors.slice(before).join(' | ').slice(0, 150)}`);
    }

    const overflow = await page.evaluate(() => {
      const el = document.getElementById('main-container') || document.documentElement;
      return el.scrollWidth > el.clientWidth + 2;
    });
    if (overflow) findings.push('Horizontal overflow detected after long/Unicode input');

    const status = findings.length === 0 ? 'PASS' : 'FAIL';
    require('fs').writeFileSync(require('path').join(dir, 'input-check.json'), JSON.stringify(findings, null, 2), 'utf-8');

    recordExecution({
      testCaseId: tc.id,
      status,
      browser: testInfo.project.name,
      viewport: page.viewportSize(),
      evidencePath: `evidence/homepage/${tc.id}/`,
      notes: `${localCount} input(s) checked with typical/empty/long/Unicode values.`,
      actualResult: status === 'PASS' ? 'No crashes, console errors, or overflow.' : findings.join(' | '),
    });
    expect(findings, findings.join('\n')).toEqual([]);
  });
}
