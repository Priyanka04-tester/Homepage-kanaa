const { test, expect } = require('@playwright/test');
const config = require('../../utils/config');
const { clickAccountIcon, login } = require('../../utils/pages');

// Every test in this file triggers a real OTP send (see utils/pages.js).
// Excluded from the default `npm run test:e2e` via --grep-invert @otp;
// run `npm run test:e2e:full` to include them.
test.describe('Login', () => {
  test('shows the sign-in modal with email and password path @otp', async ({ page }) => {
    await page.goto('/en-sa/');
    await clickAccountIcon(page);
    await expect(page.getByText('Sign In or Register')).toBeVisible();

    await page.getByPlaceholder('Enter mobile or email address').fill(config.user.email);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText(/Verify with OTP/i)).toBeVisible();

    await page.getByText('Log in with Password').click();
    await expect(page.getByLabel('Email')).toHaveValue(config.user.email);
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('logs in successfully with valid test credentials @otp', async ({ page }) => {
    test.skip(!config.user.email || !config.user.password, 'TEST_USER_EMAIL/PASSWORD not set in .env');
    await login(page);
    await page.goto('/en-sa/account/');
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });

  test('rejects an invalid password @otp', async ({ page }) => {
    await page.goto('/en-sa/');
    await clickAccountIcon(page);
    await page.getByPlaceholder('Enter mobile or email address').fill(config.user.email);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('Log in with Password').click();

    await page.getByLabel('Email').fill(config.user.email);
    await page.getByLabel('Password').fill('not-the-real-password');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Sign In or Register').or(page.getByLabel('Password'))).toBeVisible();
    await expect(page).not.toHaveURL(/account/);
  });
});
