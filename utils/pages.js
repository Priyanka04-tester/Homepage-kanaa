const { expect } = require('@playwright/test');
const config = require('./config');

/**
 * These selectors target the desktop header, which only renders at/above
 * the site's 1280px breakpoint (see playwright.config.js viewport). Below
 * that it swaps to a hamburger-menu mobile layout with different markup.
 * "Sign In" / "Cart" are plain text on <div>/<span> elements (no href,
 * no button role), so they're matched by exact text, not role.
 */
async function clickAccountIcon(page) {
  await page.getByText('Sign In', { exact: true }).first().click();
}

async function openCartDrawer(page) {
  await page.getByText('Cart', { exact: true }).first().click();
}

async function login(page, email = config.user.email, password = config.user.password) {
  await page.goto('/en-sa/');
  await clickAccountIcon(page);

  await expect(page.getByText('Sign In or Register')).toBeVisible();
  await page.getByPlaceholder('Enter mobile or email address').fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();

  // Default flow sends an OTP; drop into the password flow instead so login is scriptable.
  await page.getByText('Log in with Password').click();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Logged-in state: the account icon area no longer shows the login modal.
  await expect(page.getByText('Sign In or Register')).toBeHidden();
}

/**
 * Category grids mix in promo/recommendation tiles that also carry an
 * "Add to wishlist" button, so that button alone doesn't reliably pick a
 * real, purchasable product. The "Add to Cart" button is a better anchor:
 * it only appears on genuine product cards (in the grid) and on the PDP.
 */
function firstProductCard(page) {
  const addToCartBtn = page.getByRole('button', { name: 'Add to Cart' }).first();
  return addToCartBtn.locator('xpath=ancestor::a[1]');
}

/**
 * The first couple of cards in this grid are consistently unreliable for
 * an automated Add to Cart: slot 0 is tagged "Testing product promotion"
 * (a QA placeholder, not a real product) and slot 1 is a flash-sale item
 * whose PDP button stays disabled/aria-busy pending a finance-eligibility
 * check. Both were confirmed by hand before writing this. Ordinary catalog
 * items (from slot 2 on) add cleanly, so start there; the small loop below
 * is just resilience against the grid's order shifting over time, not a
 * substitute for that.
 */
async function addFirstProductToCart(page, { startIndex = 2, maxAttempts = 3 } = {}) {
  // A hard navigation (not a client-side nav-link click) so the grid is
  // fully hydrated before we look for cards in it.
  await page.goto('/en-sa/books-stationery.html');
  const candidateCount = await page.getByRole('button', { name: 'Add to Cart' }).count();
  const lastIndex = Math.min(startIndex + maxAttempts, candidateCount);

  for (let i = startIndex; i < lastIndex; i++) {
    const card = page.getByRole('button', { name: 'Add to Cart' }).nth(i).locator('xpath=ancestor::a[1]');
    await card.click();

    // Wait for the page to load after navigation. The key fix is to ensure we wait
    // for the PDP URL/DOM to be fully ready before trying to interact with elements.
    // This prevents the issue where we get multiple "Add to Cart" buttons from both
    // PLP and PDP being partially visible at the same time.
    await page.waitForLoadState('domcontentloaded');

    // Minimal wait to ensure PDP SPA has rendered.
    await page.waitForTimeout(300);

    const pdpAddToCartBtn = page.getByRole('button', { name: 'Add to Cart' });
    try {
      await expect(pdpAddToCartBtn).toBeEnabled({ timeout: 10_000 });
      await pdpAddToCartBtn.click();
      await expect(page.getByText('View Cart')).toBeVisible({ timeout: 8_000 });
      return;
    } catch {
      // Brief wait before retrying with next candidate.
      if (i < lastIndex - 1) {
        await page.waitForTimeout(300);
        await page.goto('/en-sa/books-stationery.html');
      }
    }
  }

  throw new Error(`Could not add any product between index ${startIndex} and ${lastIndex - 1} to cart`);
}

module.exports = {
  clickAccountIcon,
  openCartDrawer,
  login,
  firstProductCard,
  addFirstProductToCart,
};
