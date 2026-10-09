import { Page, expect } from '@playwright/test';

export const HOME_PATH = new URL(process.env.BASE_URL || 'https://thekanaa.com/en-sa/').pathname;

export const homeLogo = (page: Page) =>
  page.locator(`a[href="${HOME_PATH}"]`).filter({ visible: true }).first();

export const headerCart = (page: Page) =>
  page.locator('a[href*="cart"]').filter({ visible: true }).first();

export const headerLanguageSwitch = (page: Page) =>
  page.getByRole('button', { name: /عربي|English/ }).filter({ visible: true }).first();

export const productCards = (page: Page) =>
  page.locator('a[href$=".html"]').filter({ has: page.locator('button[aria-label="Add to Cart"]') });

export async function openHomepage(page: Page) {
  await page.goto('./');
  await expect(homeLogo(page)).toBeVisible({ timeout: 30000 });
}

export async function internalLinks(page: Page, limit: number): Promise<string[]> {
  const hrefs = await page
    .locator(`a[href^="${HOME_PATH}"], a[href^="/"]`)
    .evaluateAll((els) => els.map((e) => e.getAttribute('href') || ''));
  const unique = Array.from(new Set(hrefs.filter((h) => h && !h.startsWith('//') && !h.includes('#'))));
  return unique.slice(0, limit);
}
