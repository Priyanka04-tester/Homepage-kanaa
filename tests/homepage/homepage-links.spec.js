/**
 * Executes the generated "<section> — links" test cases (state/test-cases.json,
 * feature ending in "links") against every link state/homepage-map.json found in
 * that section. See agents/homepage-executor.md for the overall execution design.
 *
 * Scope decision: with 246 links discovered (many external — app-store deep links,
 * Google Maps, social profiles), literally clicking and navigating through every one
 * would be slow and would repeatedly leave/rebuild the SPA. Instead each unique href
 * is checked with a real HTTP request (page.request), asserting it doesn't 404/5xx.
 * This covers "does this link go somewhere real" (spec section 10) without the cost
 * and flakiness of 246 in-app navigations. Primary nav click-through already exists
 * in tests/e2e/homepage.spec.js and isn't duplicated here.
 * Third-party hosts (anything not on thekanaa.com) that fail are logged as notes,
 * not failures — those often reflect anti-bot/geoblocking on someone else's site,
 * not a defect in this homepage (same first-party/third-party split used for the
 * console/network health check).
 *
 * A first-party request that only fails once is retried once after a short pause
 * before being counted as a real failure — this suite runs ~250+ HTTP checks in
 * sequence against a shared dev box, and a lone timeout late in that run is more
 * often self-inflicted load than a broken link (see README "Known site quirks" on
 * this environment's sensitivity to back-to-back automated requests).
 * A href that fails to parse as a URL at all (e.g. "https:/host/path" — a single
 * slash) is recorded separately as `malformedHrefs`: Node's URL parser rejects it,
 * but real browsers are lenient about this for http(s) and may still navigate
 * correctly, so it's flagged for a manual look rather than asserted as a dead link.
 */
const { test, expect } = require('@playwright/test');
const { loadHomepageMap, findTestCase, recordExecution, evidenceDir, isFirstPartyUrl } = require('../../utils/qaState');

const BASE_URL = process.env.BASE_URL || 'https://dev-nx.thekanaa.com';
const map = loadHomepageMap();
const sectionsWithLinks = map.sections.filter((s) => s.elementCounts && s.elementCounts.links > 0);

for (const section of sectionsWithLinks) {
  const tc = findTestCase(section.id, 'links');

  test(`${tc.id}: ${section.name || section.id} — every link resolves`, async ({ page, context }, testInfo) => {
    const uniqueHrefs = [...new Set(section.elements.links.map((l) => l.href).filter(Boolean))];

    const placeholders = [];
    const malformedHrefs = [];
    const firstPartyFailures = [];
    const thirdPartyNotes = [];
    const skipped = [];

    async function checkOnce(absoluteUrl) {
      const res = await context.request.get(absoluteUrl, { maxRedirects: 5, timeout: 20_000 });
      return res.status();
    }

    for (const href of uniqueHrefs) {
      if (href === '#' || href.startsWith('javascript:')) {
        placeholders.push(href);
        continue;
      }
      if (href.startsWith('mailto:') || href.startsWith('tel:')) {
        skipped.push(href);
        continue;
      }

      let absoluteUrl;
      try {
        absoluteUrl = href.startsWith('http') ? new URL(href).toString() : new URL(href, BASE_URL).toString();
      } catch {
        malformedHrefs.push(href);
        continue;
      }

      try {
        const status = await checkOnce(absoluteUrl);
        if (status >= 400) {
          if (isFirstPartyUrl(absoluteUrl)) firstPartyFailures.push(`${absoluteUrl} -> ${status}`);
          else thirdPartyNotes.push(`${absoluteUrl} -> ${status}`);
        }
      } catch (firstError) {
        // One retry after a short pause before treating a timeout as a real failure.
        await new Promise((r) => setTimeout(r, 1500));
        try {
          const status = await checkOnce(absoluteUrl);
          if (status >= 400) {
            if (isFirstPartyUrl(absoluteUrl)) firstPartyFailures.push(`${absoluteUrl} -> ${status}`);
            else thirdPartyNotes.push(`${absoluteUrl} -> ${status}`);
          }
        } catch (secondError) {
          const msg = `${absoluteUrl} -> request error after retry: ${secondError.message.slice(0, 150)}`;
          if (isFirstPartyUrl(absoluteUrl)) firstPartyFailures.push(msg);
          else thirdPartyNotes.push(msg);
        }
      }
    }

    const notesParts = [
      `Checked ${uniqueHrefs.length} unique hrefs.`,
      placeholders.length ? `${placeholders.length} placeholder ("#") link(s) found — not navigable, flagged not failed.` : null,
      malformedHrefs.length ? `${malformedHrefs.length} href(s) don't parse as a URL at all (needs a manual browser check): ${malformedHrefs.join(', ')}` : null,
      thirdPartyNotes.length ? `${thirdPartyNotes.length} third-party link(s) returned non-2xx/3xx (informational): ${thirdPartyNotes.slice(0, 5).join('; ')}` : null,
    ].filter(Boolean);

    const status = firstPartyFailures.length === 0 ? 'PASS' : 'FAIL';
    let evidencePath = null;
    if (status === 'FAIL' || placeholders.length || malformedHrefs.length) {
      const dir = evidenceDir(tc.id);
      require('fs').writeFileSync(require('path').join(dir, 'link-check.json'), JSON.stringify({ uniqueHrefs, placeholders, malformedHrefs, firstPartyFailures, thirdPartyNotes }, null, 2), 'utf-8');
      evidencePath = `evidence/homepage/${tc.id}/`;
    }

    recordExecution({
      testCaseId: tc.id,
      status,
      browser: testInfo.project.name,
      viewport: page.viewportSize(),
      evidencePath,
      notes: notesParts.join(' '),
      actualResult: status === 'PASS'
        ? `All first-party links resolved. ${notesParts.join(' ')}`
        : `First-party link failures: ${firstPartyFailures.join('; ')}`,
    });

    expect(firstPartyFailures, `First-party link failures in ${section.id}: ${firstPartyFailures.join('; ')}`).toEqual([]);
  });
}
