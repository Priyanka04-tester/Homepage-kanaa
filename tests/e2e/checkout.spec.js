const { test, expect } = require('@playwright/test');
const config = require('../../utils/config');
const { login, addFirstProductToCart } = require('../../utils/pages');

/**
 * This suite intentionally never completes a real payment. It logs in,
 * adds a product, and verifies the cart/order-summary reaches a payable
 * state. Clicking "Pay Now" is gated behind RUN_FULL_CHECKOUT=true in
 * .env, and even then this file stops BEFORE submitting any payment
 * details — that step needs a real sandbox payment method and should
 * stay a manual/human action.
 */
// Both tests below call login(), which triggers a real OTP send (see
// utils/pages.js). Excluded from the default `npm run test:e2e` via
// --grep-invert @otp; run `npm run test:e2e:full` to include them.
test.describe('Checkout', () => {
  test.skip(!config.user.email || !config.user.password, 'TEST_USER_EMAIL/PASSWORD not set in .env');

  test('logged-in cart shows an order summary with total and VAT @otp', async ({ page }) => {
    await login(page);
    await addFirstProductToCart(page);
    await page.getByText('View Cart').click();
    await expect(page).toHaveURL(/new-cart/);

    await expect(page.getByText('Order Summary')).toBeVisible();
    await expect(page.getByText('Subtotal')).toBeVisible();
    await expect(page.getByText(/Estimated VAT/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Pay Now/i })).toBeVisible();
  });

  test('Pay Now is reachable but this bot does not submit payment @otp', async ({ page }) => {
    test.skip(!config.runFullCheckout, 'Set RUN_FULL_CHECKOUT=true to exercise this step');

    await login(page);
    await addFirstProductToCart(page);
    await page.getByText('View Cart').click();

    const payNow = page.getByRole('button', { name: /Pay Now/i });
    await expect(payNow).toBeEnabled();
    // Deliberately not clicking payNow: doing so leaves the site's checkout
    // flow and would require entering real/sandbox payment credentials,
    // which this bot must never do on its own.
  });
});
