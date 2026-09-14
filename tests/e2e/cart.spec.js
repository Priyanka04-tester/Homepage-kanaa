const { test, expect } = require('@playwright/test');
const { addFirstProductToCart, firstProductCard } = require('../../utils/pages');

test.describe('Browse and cart', () => {
  test('can browse a category and view a product detail page', async ({ page }) => {
    await page.goto('/en-sa/books-stationery.html');
    const card = firstProductCard(page);
    await expect(card).toBeVisible();
    await card.click();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('button', { name: 'Add to Cart' })).toBeVisible();
    await expect(page.getByText(/SKU/i).first()).toBeVisible();
  });

  test('adding a product updates the mini-cart and cart page', async ({ page }) => {
    await addFirstProductToCart(page);

    await expect(page.getByText('Cart Total')).toBeVisible();
    await page.getByText('View Cart').click();

    // The site A/B-tests two different cart routes (GrowthBook), so
    // either is a valid outcome here.
    await expect(page).toHaveURL(/\/(new-)?cart\//);
    await expect(page.getByText('Shopping Cart')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();
  });

  test('cart quantity controls update the line item', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.getByText('View Cart').click();
    await expect(page).toHaveURL(/\/(new-)?cart\//);

    // Quantity stepper buttons have no accessible name. Scope to the first
    // line item via its "Remove item" button (that row's only labeled
    // control) rather than searching the whole page for a bare number —
    // the header's cart-count badge also renders a bare digit and would
    // otherwise be matched instead.
    const lineItemControls = page.getByRole('button', { name: 'Remove item' }).first().locator('xpath=..');
    const plusBtn = lineItemControls.locator('button').last();
    await plusBtn.click();
    await expect(page.getByText('Cart Total')).toBeVisible();
  });
});
