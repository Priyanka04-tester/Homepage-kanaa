/**
 * Standalone smoke check for scheduled/cron use (Windows Task Scheduler,
 * the scheduled-tasks tool, etc). Exits 0 on success, 1 on failure, so a
 * scheduler can alert on non-zero exit codes.
 *
 * Modes:
 *   node monitoring/healthcheck.js          -> guest checks only (safe, cheap, run often)
 *   node monitoring/healthcheck.js --full   -> also runs login (triggers a real OTP
 *                                              send server-side) - run this rarely,
 *                                              e.g. once a day, not every few minutes.
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');
const config = require('../utils/config');

const LOG_DIR = path.join(__dirname, 'logs');
const runFull = process.argv.includes('--full');

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(path.join(LOG_DIR, 'healthcheck.log'), stamped + '\n');
}

async function checkHomepage(page) {
  const res = await page.goto(`${config.baseURL}${config.localePath}`);
  if (!res || res.status() >= 400) throw new Error(`Homepage returned ${res && res.status()}`);
  await page.getByRole('link', { name: 'Toys & Games' }).waitFor({ timeout: 15_000 });
  log('OK  homepage loaded and nav is present');
}

async function checkCategoryAndCart(page) {
  await page.goto(`${config.baseURL}/en-sa/books-stationery.html`);
  const wishlistBtn = page.getByRole('button', { name: 'Add to wishlist' }).first();
  await wishlistBtn.waitFor({ timeout: 15_000 });
  const card = wishlistBtn.locator('xpath=ancestor::a[1]');
  await card.click();

  const addToCartBtn = page.getByRole('button', { name: 'Add to Cart' });
  await addToCartBtn.waitFor({ timeout: 15_000 });
  await addToCartBtn.click();
  await page.getByText('View Cart').waitFor({ timeout: 15_000 });
  log('OK  category browse + add-to-cart works');
}

async function checkLogin(page) {
  const { login } = require('../utils/pages');
  await login(page);
  log('OK  login with test credentials succeeded (this sent a real OTP)');
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let failed = false;

  try {
    await checkHomepage(page);
    await checkCategoryAndCart(page);
    if (runFull) await checkLogin(page);
  } catch (err) {
    failed = true;
    log(`FAIL ${err.message}`);
  } finally {
    await browser.close();
  }

  if (failed) {
    log('RESULT: unhealthy');
    process.exit(1);
  }
  log('RESULT: healthy');
}

main();
