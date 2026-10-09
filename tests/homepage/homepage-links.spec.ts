/**
 * Link Tests - All Links & Navigation Anchors
 * Tests internal and external links, link validation
 */

import { test, expect } from '@playwright/test';
import { internalLinks, openHomepage } from './helpers';

test.describe('Links & Navigation Anchors', () => {
  test('TC-HOME-011: Every visible link has an href', async ({ page }) => {
    await openHomepage(page);
    const withoutHref = await page.locator('a:not([href])').filter({ visible: true }).count();
    expect(withoutHref, `${withoutHref} visible links have no href`).toBe(0);
  });

  test('TC-HOME-012: Internal links return a working page', async ({ page }) => {
    await openHomepage(page);
    const hrefs = await internalLinks(page, 10);
    expect(hrefs.length, 'no internal links found on the homepage').toBeGreaterThan(0);

    const broken: string[] = [];
    for (const href of hrefs) {
      const res = await page.request.get(new URL(href, page.url()).toString(), { failOnStatusCode: false });
      if (res.status() >= 400) broken.push(`${res.status()} ${href}`);
    }
    expect(broken, `broken internal links:\n${broken.join('\n')}`).toEqual([]);
  });

  test('TC-HOME-013: target="_blank" links include rel="noopener"', async ({ page }) => {
    await openHomepage(page);
    const offenders = await page.locator('a[target="_blank"]').evaluateAll((els) =>
      els
        .filter((a) => !/noopener|noreferrer/.test(a.getAttribute('rel') || ''))
        .map((a) => a.getAttribute('href') || '')
    );
    expect(offenders, `target=_blank links without rel=noopener:\n${offenders.join('\n')}`).toEqual([]);
  });

  test('TC-HOME-014: Every in-page anchor link resolves to a target', async ({ page }) => {
    await openHomepage(page);
    const broken = await page.locator('a[href^="#"]').evaluateAll((els) =>
      els
        .map((a) => a.getAttribute('href') || '')
        .filter((h) => h.length > 1 && !document.getElementById(h.slice(1)))
    );
    expect(broken, `anchors with no target:\n${broken.join('\n')}`).toEqual([]);
  });

  test('TC-HOME-015: Social media profile links are present', async ({ page }) => {
    await openHomepage(page);
    for (const host of ['facebook.com', 'instagram.com', 'linkedin.com']) {
      await expect(page.locator(`a[href*="${host}"]`).first(), `${host} link`).toBeAttached();
    }
  });

  test('TC-HOME-016: Footer legal links return a working page', async ({ page }) => {
    await openHomepage(page);
    const hrefs = await page.locator('a[href]').evaluateAll((els) => {
      const legal = /^(Terms & Conditions|Privacy Policy|Shipping Policy|Warranty Policy|Returns & Refunds)$/;
      return Array.from(new Set(els.filter((a) => legal.test((a.textContent || '').trim())).map((a) => a.getAttribute('href') || '')));
    });
    expect(hrefs.length, 'no footer legal links found').toBeGreaterThanOrEqual(5);

    const broken: string[] = [];
    for (const href of hrefs) {
      const res = await page.request.get(new URL(href, page.url()).toString(), { failOnStatusCode: false });
      if (res.status() >= 400) broken.push(`${res.status()} ${href}`);
    }
    expect(broken, `broken footer links:\n${broken.join('\n')}`).toEqual([]);
  });
});
