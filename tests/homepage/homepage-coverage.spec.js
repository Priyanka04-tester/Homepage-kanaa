/**
 * Coverage checks for homepage areas that no section-driven or FEAT test reaches:
 * footer, newsletter form, header search results, mobile menu, keyboard focus
 * visibility, unknown-URL handling, slow asset loading, document language and
 * direction, head metadata, desktop cart control and the language switcher round trip.
 *
 * Non-destructive: the newsletter form is only given an invalid address and never
 * submitted with a real one, and no order or account action is taken. A check whose
 * control is absent is skipped with a reason (reported as NOT RUN), never passed.
 */
const { test, expect } = require('@playwright/test');
const { LOCALE, LOCALE_PATH, BASE_URL, PATTERNS } = require('../../utils/qaState');

const SOCIAL = /facebook|instagram|twitter|x\.com|tiktok|snapchat|youtube|linkedin/i;
const OTHER_LOCALE_PATH = LOCALE === 'ar' ? '/en-sa' : '/ar-sa';
const OWN_LOCALE_PATH = LOCALE === 'ar' ? '/ar-sa' : '/en-sa';

test.describe(`Homepage coverage (${LOCALE})`, () => {
  test('COV-001: Footer renders with navigation links and social links', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    // The footer mounts only once the page is scrolled down, so walk the real scroll container first.
    for (let i = 1; i <= 15; i++) {
      await page.evaluate((step) => {
        const scroller = document.getElementById('main-container') || document.scrollingElement;
        scroller.scrollTop = (scroller.scrollHeight / 15) * step;
      }, i);
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(1000);
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.href));
    expect(hrefs.some((h) => /privacy-policy/.test(h)), 'footer link to privacy policy').toBe(true);
    expect(hrefs.some((h) => /terms-condition/.test(h)), 'footer link to terms and conditions').toBe(true);
    expect(hrefs.some((h) => SOCIAL.test(h)), 'footer social link (facebook/instagram/x/tiktok/snapchat/youtube/linkedin)').toBe(true);
  });

  test('COV-002: Newsletter form flags an invalid address and does not navigate', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    for (let i = 1; i <= 15; i++) {
      await page.evaluate((step) => {
        const scroller = document.getElementById('main-container') || document.scrollingElement;
        scroller.scrollTop = (scroller.scrollHeight / 15) * step;
      }, i);
      await page.waitForTimeout(300);
    }
    const email = page.locator('input[type="email"], input[placeholder*="email" i]').filter({ visible: true }).first();
    if ((await email.count()) === 0) {
      test.skip(true, 'No visible email input on the homepage, so no newsletter form was found.');
      return;
    }
    await email.scrollIntoViewIfNeeded();
    const before = page.url();
    // Deliberately invalid (no "@" and no domain): nothing can be subscribed by this check.
    await email.fill('qa-invalid-address');
    await email.press('Enter');
    await page.waitForTimeout(1500);
    expect(page.url(), 'page must not navigate on an invalid submit').toBe(before);
    const success = page.getByText(/thank you|subscribed|successfully/i).filter({ visible: true });
    expect(await success.count(), 'no success message for an invalid address').toBe(0);
  });

  test('COV-003: Header search with a query leads to results for that query', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    const search = page.getByPlaceholder(PATTERNS.searchPlaceholder).filter({ visible: true }).first();
    await expect(search, 'header search input').toBeVisible({ timeout: 30000 });
    const before = page.url();
    await search.fill('lego');
    await search.press('Enter');
    await page.waitForURL((u) => u.toString() !== before, { timeout: 20000 }).catch(() => {});
    expect(page.url(), 'search with Enter should navigate').not.toBe(before);
    expect(decodeURIComponent(page.url()).toLowerCase(), 'results URL carries the query').toContain('lego');
  });

  test('COV-004: Mobile menu button opens the navigation links', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    const menu = page.getByRole('button', { name: /menu|navigation|القائمة/i }).filter({ visible: true }).first();
    if ((await menu.count()) === 0) {
      test.skip(true, 'No labelled mobile menu button found. The top-left control is unlabelled; see the pending list.');
      return;
    }
    const linksBefore = await page.locator('a[href]').filter({ visible: true }).count();
    await menu.click();
    await page.waitForTimeout(800);
    const linksAfter = await page.locator('a[href]').filter({ visible: true }).count();
    expect(linksAfter, 'visible links after opening the mobile menu').toBeGreaterThan(linksBefore);
  });

  test('COV-005: Every focused element in the first 25 Tab stops shows a focus indicator', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    const unindicated = [];
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 60),
          outline: cs.outlineStyle !== 'none' && cs.outlineWidth !== '0px',
          shadow: cs.boxShadow !== 'none',
          visible: r.width > 0 && r.height > 0,
        };
      });
      if (!info || !info.visible) continue;
      if (!info.outline && !info.shadow) unindicated.push(`${info.tag} "${info.label}"`);
    }
    expect(unindicated, `focused without a visible indicator:\n${unindicated.join('\n')}`).toEqual([]);
  });

  test('COV-006: Unknown page returns 404 rather than a soft 200', async ({ request }) => {
    const res = await request.get(`${BASE_URL}${OWN_LOCALE_PATH}/qa-no-such-page-7f3k/`);
    expect(res.status(), 'status for an unknown page').toBe(404);
  });

  test('COV-007: Header search and product cards stay usable while images load slowly', async ({ page }) => {
    await page.route(/media\.thekanaa\.com|\/assets\/images\//, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.continue();
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    await expect(page.getByPlaceholder(PATTERNS.searchPlaceholder).filter({ visible: true }).first(), 'header search while images load').toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: PATTERNS.addToCart }).first(), 'Add to Cart while images load').toBeAttached({ timeout: 60000 });
  });

  test('COV-008: Document language and direction match the locale', async ({ page }) => {
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    const doc = await page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));
    expect(doc.lang.toLowerCase().startsWith(LOCALE), `html lang="${doc.lang}"`).toBe(true);
    expect(doc.dir, 'html dir').toBe(LOCALE === 'ar' ? 'rtl' : 'ltr');
  });

  test('COV-009: Page has a title, meta description and canonical URL', async ({ page }) => {
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    const head = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
    }));
    expect(head.title.trim(), 'document title').not.toBe('');
    expect(head.description.trim(), 'meta description').not.toBe('');
    expect(head.canonical, 'canonical link').not.toBe('');
  });

  test('COV-010: Desktop header cart control is visible and opens the cart', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    const cart = page.locator('a[href*="cart"], button[aria-label*="cart" i]').filter({ visible: true }).first();
    if ((await cart.count()) === 0) {
      test.skip(true, 'No visible cart control at 1440px. The desktop cart icon has not been located; see the pending list.');
      return;
    }
    await cart.click();
    // The cart opens as a side drawer (no dialog role); an empty cart shows its empty message.
    const drawer = page.getByText(/cart is empty|سلتك فارغة|السلة فارغة|فارغة/i).filter({ visible: true }).first();
    await expect(drawer, 'cart drawer shows its empty-cart message').toBeVisible({ timeout: 5000 });
  });

  test('COV-011: Language switcher round trip returns to the same locale', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    // The switcher is a button labelled with the other language, not a link.
    const toOther = page.getByText(PATTERNS.switchToOtherLocale).filter({ visible: true }).first();
    if ((await toOther.count()) === 0) {
      test.skip(true, 'No visible language switcher control found.');
      return;
    }
    await toOther.click();
    await page.waitForURL((u) => u.toString().includes(OTHER_LOCALE_PATH), { timeout: 20000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle').catch(() => {});
    // Back to this locale: the other page's switcher is labelled with this locale's language.
    const back = page.getByText(LOCALE === 'ar' ? /عربي/ : /\bEN\b|English/).filter({ visible: true }).first();
    await expect(back, 'link back to this locale').toBeVisible({ timeout: 20000 });
    await back.click();
    await page.waitForURL((u) => u.toString().includes(OWN_LOCALE_PATH), { timeout: 20000 });
    expect(page.url(), 'back on this locale').toContain(OWN_LOCALE_PATH);
  });
});
