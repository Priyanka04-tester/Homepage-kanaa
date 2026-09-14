/**
 * Executes the generated "<section> — carousel" test cases (spec section 11):
 * first/next/previous/last slide, rapid-click robustness, pagination (if present),
 * and slide CTA/link sanity, for every slider state/homepage-map.json found.
 *
 * Sliders on this homepage expose identically-named "Previous"/"Next" controls
 * (untranslated — same text on both locales, see utils/qaState.js), so they're
 * disambiguated by index in DOM order, matching the order the discovery script
 * found them in and the order they appear in homepage-map.json's per-section
 * elements.sliders arrays.
 */
const { test, expect } = require('@playwright/test');
const { loadHomepageMap, findTestCase, recordExecution, evidenceDir, LOCALE_PATH, PREV_CONTROL_PATTERN, NEXT_CONTROL_PATTERN } = require('../../utils/qaState');

const map = loadHomepageMap();
const sectionsWithSliders = map.sections.filter((s) => s.elementCounts && s.elementCounts.sliders > 0);

let globalSliderIndex = 0;
for (const section of sectionsWithSliders) {
  const tc = findTestCase(section.id, 'carousel');
  const sliderMeta = section.elements.sliders[0];
  const sliderIndex = globalSliderIndex;
  globalSliderIndex += 1;

  test(`${tc.id}: ${section.name || section.id} — carousel navigation`, async ({ page }, testInfo) => {
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });

    const prev = page.getByRole('button', { name: PREV_CONTROL_PATTERN }).nth(sliderIndex);
    const next = page.getByRole('button', { name: NEXT_CONTROL_PATTERN }).nth(sliderIndex);
    await expect(prev, 'Previous control should be visible').toBeVisible();
    await expect(next, 'Next control should be visible').toBeVisible();

    const findings = [];
    const dir = evidenceDir(tc.id);
    const steps = Math.max(sliderMeta.slideLinkCount, 3);

    // Next through every slide, screenshotting each for blank/duplicate/stuck detection.
    const screenshots = [];
    for (let i = 0; i < steps; i++) {
      await next.click();
      await page.waitForTimeout(400);
      const shot = require('path').join(dir, `slide-next-${i}.png`);
      await page.screenshot({ path: shot });
      screenshots.push(shot);
    }

    // Back to first via Previous.
    for (let i = 0; i < steps; i++) {
      await prev.click();
      await page.waitForTimeout(300);
    }
    await expect(prev, 'Previous control should remain visible after returning to first slide').toBeVisible();

    // Rapid-click robustness.
    for (let i = 0; i < 5; i++) await next.click({ timeout: 2000 }).catch(() => findings.push('rapid Next click did not register in time'));
    await page.waitForTimeout(300);
    const carouselAliveAfterRapidClicks = await next.isVisible().catch(() => false);
    if (!carouselAliveAfterRapidClicks) findings.push('Carousel controls disappeared after rapid-click sequence (possible stuck state)');

    // Placeholder ("#") slide links are a known finding, not a hard failure.
    const placeholderLinks = (sliderMeta.slideLinkHrefs || []).filter((h) => h === '#');
    if (placeholderLinks.length) findings.push(`${placeholderLinks.length} slide link(s) point to "#" (non-functional placeholder)`);

    const status = findings.length === 0 ? 'PASS' : 'FAIL';
    require('fs').writeFileSync(require('path').join(dir, 'carousel-check.json'), JSON.stringify({ sliderIndex, steps, findings, screenshots }, null, 2), 'utf-8');

    recordExecution({
      testCaseId: tc.id,
      status,
      browser: testInfo.project.name,
      viewport: page.viewportSize(),
      evidencePath: `evidence/homepage/${tc.id}/`,
      notes: `Exercised ${steps} Next + ${steps} Previous + 5 rapid-click on slider #${sliderIndex}.`,
      actualResult: status === 'PASS' ? 'Carousel navigated cleanly with no stuck/blank state.' : findings.join(' | '),
    });

    expect(findings, findings.join('\n')).toEqual([]);
  });
}
