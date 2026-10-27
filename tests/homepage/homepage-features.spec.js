/**
 * Homepage feature checks for controls that the section-based suites do not cover:
 * header account modal, category menu on hover, search field, announcement bar,
 * wishlist controls on product cards and mobile cart link. Each test asserts a
 * behaviour verified on the live site (2026-10-27). Results are written to the
 * same run report as the other global checks.
 */
const { test, expect } = require('@playwright/test');
const { loadHomepageMap, LOCALE, LOCALE_PATH, PATTERNS, WISHLIST_PATTERN } = require('../../utils/qaState');

const ANNOUNCEMENT = LOCALE === 'ar' ? /تقنيات|قيمة|يوم|الإرجاع/ : /VAT|Easy Returns|Free Delivery/i;

test.describe(`Homepage features (${LOCALE})`, () => {
  test('FEAT-001: Announcement bar is shown above the header', async ({ page }) => {
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    const bar = page.getByText(ANNOUNCEMENT).filter({ visible: true }).first();
    await expect(bar, 'announcement bar text').toBeVisible({ timeout: 30000 });
  });

  test('FEAT-002: Account icon opens the Sign In or Register modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(`a[href="${LOCALE_PATH}"]`).filter({ visible: true }).first()).toBeVisible({ timeout: 30000 });
    // The account icon is an unlabelled SVG in the header row; its position differs between LTR and RTL,
    // so each header icon is tried in turn until the sign-in modal opens.
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);
    const icons = await page.evaluate(() => Array.from(document.querySelectorAll('svg')).filter(s => {
      const r = s.getBoundingClientRect(); return r.top > 55 && r.top < 95 && r.width >= 14 && r.width <= 40;
    }).map(s => { const r = s.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
    // Verified on the live 1440px header: the account icon sits at x=1236 in both languages' LTR layout.
    const candidates = [{ x: 1236, y: 80 }, ...icons.slice(0, 3)];
    test.setTimeout(240_000);
    expect(candidates.length, 'header icons found').toBeGreaterThan(0);
    const modalText = LOCALE === 'ar' ? /تسجيل الدخول|إنشاء حساب/ : /Sign In or Register/;
    let opened = false;
    outer: for (const icon of candidates) {
      for (const dy of [0, 10, -10]) {
        await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(1500);
        await page.mouse.click(icon.x, icon.y + dy);
        if (await page.getByText(modalText).filter({ visible: true }).first().isVisible({ timeout: 2500 }).catch(() => false)) { opened = true; break outer; }
      }
    }
    expect(opened, 'a header icon opens the sign-in modal').toBe(true);
    await expect(page.getByText(modalText).filter({ visible: true }).first(), 'sign-in modal').toBeVisible();
    await expect(page.getByPlaceholder(LOCALE === 'ar' ? /جوال|بريد/ : /mobile or email/i).filter({ visible: true }).first(), 'email or mobile field').toBeVisible();
  });

  test('FEAT-003: Hovering the header category icon reveals category links', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(`a[href="${LOCALE_PATH}"]`).filter({ visible: true }).first()).toBeVisible({ timeout: 30000 });
    const before = await page.locator('a[href*=".html"]').filter({ visible: true }).count();
    await page.mouse.move(33, 61);
    await page.waitForTimeout(1000);
    const after = await page.locator('a[href*=".html"]').filter({ visible: true }).count();
    expect(after, 'category links visible after hovering the menu icon').toBeGreaterThan(before);
  });

  test('FEAT-004: Search field is present and accepts input on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    const search = page.getByPlaceholder(PATTERNS.searchPlaceholder).filter({ visible: true }).first();
    await expect(search, 'search input').toBeVisible({ timeout: 30000 });
    await search.fill('lego');
    await expect(search).toHaveValue('lego');
  });

  test('FEAT-005: Product cards expose a wishlist control', async ({ page }) => {
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    const wishlist = page.getByRole('button', { name: WISHLIST_PATTERN }).filter({ visible: true });
    await wishlist.first().waitFor({ state: 'attached', timeout: 30000 });
    expect(await wishlist.count(), 'visible wishlist buttons').toBeGreaterThan(0);
  });

  test('FEAT-006: Mobile header shows a cart link', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    const cart = page.locator('a[href*="cart"]').filter({ visible: true }).first();
    await expect(cart, 'mobile cart link').toBeVisible({ timeout: 30000 });
  });

  test('FEAT-007: Homepage lists the sections present in the discovery map', async ({ page }) => {
    const map = loadHomepageMap();
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    // Lower sections render only as the page scrolls, so walk the whole page first.
    for (let i = 1; i <= 15; i++) {
      await page.evaluate((step) => {
        const scroller = document.getElementById('main-container') || document.scrollingElement;
        scroller.scrollTop = (scroller.scrollHeight / 15) * step;
      }, i);
      await page.waitForTimeout(300);
    }
    const missing = [];
    for (const s of map.sections) {
      const name = (s.name || '').trim();
      if (!name) continue;
      const found = await page.getByText(name, { exact: false }).count();
      if (found === 0) missing.push(name);
    }
    expect(missing, `sections on the map that are no longer on the page:\n${missing.join('\n')}`).toEqual([]);
  });
});
