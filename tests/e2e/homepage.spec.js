const { test, expect } = require('@playwright/test');
const { openCartDrawer } = require('../../utils/pages');

test.describe('Homepage', () => {
  test('loads with title, hero banner and category shortcuts', async ({ page }) => {
    await page.goto('/en-sa/');
    await expect(page).toHaveTitle(/Kanaa/i);
    await expect(page.getByRole('button', { name: 'Next slide' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Toys & Games' })).toBeVisible();
  });

  test('top navigation exposes the main categories', async ({ page }) => {
    await page.goto('/en-sa/');
    for (const name of ['Toys & Games', 'Books & Stationery', 'Gaming & Consoles']) {
      await expect(page.getByRole('link', { name }).first()).toBeVisible();
    }
  });

  test('header exposes search, sign in and cart', async ({ page }) => {
    await page.goto('/en-sa/');
    await expect(page.getByPlaceholder(/what are you looking for/i)).toBeVisible();
    await expect(page.getByText('Sign In', { exact: true })).toBeVisible();
    await expect(page.getByText('Cart', { exact: true })).toBeVisible();
  });

  test('cart icon is clickable without error', async ({ page }) => {
    await page.goto('/en-sa/');
    await openCartDrawer(page);
    // Cart is empty in a fresh session; just confirm the click doesn't error
    // and the page stays usable.
    await expect(page.getByRole('link', { name: 'Toys & Games' })).toBeVisible();
  });
});
