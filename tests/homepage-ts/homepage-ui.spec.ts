/**
 * UI/Visual Tests - Layout, Styling, and Visual Elements
 * Tests visual consistency, spacing, alignment, and design
 */

import { test, expect } from '@playwright/test';
import { headerLanguageSwitch, homeLogo, openHomepage, productCards } from './helpers';

test.describe('UI & Visual Design', () => {
  test('TC-HOME-030: Header logo and language switch sit on one top line', async ({ page }) => {
    await openHomepage(page);
    const logo = await homeLogo(page).boundingBox();
    const lang = await headerLanguageSwitch(page).boundingBox();
    expect(logo, 'logo has no bounding box').not.toBeNull();
    expect(lang, 'language switch has no bounding box').not.toBeNull();
    expect(logo!.y).toBeLessThan(150);
    expect(lang!.y).toBeLessThan(150);
    expect(Math.abs(logo!.y + logo!.height / 2 - (lang!.y + lang!.height / 2))).toBeLessThan(40);
  });

  test('TC-HOME-031: Section headings do not overlap', async ({ page }) => {
    await openHomepage(page);
    const overlaps = await page.locator('h2').evaluateAll((els) => {
      const boxes = els
        .filter((e) => (e as HTMLElement).offsetParent !== null)
        .map((e) => ({ text: (e.textContent || '').trim().slice(0, 30), r: e.getBoundingClientRect() }));
      const out: string[] = [];
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i].r, b = boxes[j].r;
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 2 && oy > 2) out.push(`"${boxes[i].text}" overlaps "${boxes[j].text}"`);
        }
      }
      return out;
    });
    expect(overlaps, `overlapping headings:\n${overlaps.join('\n')}`).toEqual([]);
  });

  test('TC-HOME-032: Visible images have a rendered size', async ({ page }) => {
    await openHomepage(page);
    const collapsed = await page.locator('img').evaluateAll((els) =>
      els
        .filter((img) => (img as HTMLElement).offsetParent !== null)
        .filter((img) => {
          const r = img.getBoundingClientRect();
          return r.width < 2 || r.height < 2;
        })
        .map((img) => (img as HTMLImageElement).src)
    );
    expect(collapsed, `images with no rendered size:\n${collapsed.join('\n')}`).toEqual([]);
  });

  test('TC-HOME-033: Body text is at least 12px', async ({ page }) => {
    await openHomepage(page);
    const small = await page.locator('p, span, a, li').evaluateAll((els) =>
      els
        .filter((e) => (e as HTMLElement).offsetParent !== null && (e.textContent || '').trim().length > 20)
        .map((e) => ({ size: parseFloat(getComputedStyle(e).fontSize), text: (e.textContent || '').trim().slice(0, 40) }))
        .filter((x) => x.size < 12)
    );
    expect(small, `text below 12px:\n${small.map((s) => `${s.size}px ${s.text}`).join('\n')}`).toEqual([]);
  });

  test('TC-HOME-034: Product card buttons are at least 24px', async ({ page }) => {
    await openHomepage(page);
    const cards = productCards(page);
    await cards.first().waitFor({ state: 'attached', timeout: 30000 });
    const buttons = cards.locator('button').filter({ visible: true });
    const n = Math.min(10, await buttons.count());
    for (let i = 0; i < n; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box, `button ${i + 1} has no box`).not.toBeNull();
      expect(Math.min(box!.width, box!.height), `button ${i + 1} is too small`).toBeGreaterThanOrEqual(24);
    }
  });

  test('TC-HOME-035: Page does not scroll horizontally', async ({ page }) => {
    await openHomepage(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
  });

  test('TC-HOME-036: Body text meets WCAG AA contrast (4.5:1)', async ({ page }) => {
    await openHomepage(page);
    const failing = await page.locator('p, span, a, h1, h2, h3, li').evaluateAll((els) => {
      const parse = (s: string): { c: number[]; a: number } | null => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(',').map((x) => parseFloat(x));
        return { c: p.slice(0, 3), a: p[3] === undefined ? 1 : p[3] };
      };
      const lum = (c: number[]) => {
        const [r, g, b] = c.map((v) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const background = (el: Element): number[] => {
        let e: Element | null = el;
        while (e) {
          const c = parse(getComputedStyle(e).backgroundColor);
          if (c && c.a > 0.9) return c.c;
          e = e.parentElement;
        }
        return [255, 255, 255];
      };
      const out: string[] = [];
      for (const el of els) {
        const h = el as HTMLElement;
        const hasOwnText = Array.from(h.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim());
        if (!hasOwnText || h.offsetParent === null) continue;
        const fg = parse(getComputedStyle(h).color);
        if (!fg || fg.a < 0.9) continue;
        let imageBehind = false;
        for (let e: Element | null = h; e; e = e.parentElement) {
          if (getComputedStyle(e).backgroundImage !== 'none') imageBehind = true;
        }
        if (imageBehind) continue;
        const bg = background(h);
        const l1 = lum(fg.c), l2 = lum(bg);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        if (ratio < 4.5) out.push(`${ratio.toFixed(2)}:1 "${(h.textContent || '').trim().slice(0, 40)}"`);
      }
      return out;
    });
    expect(failing, `text below 4.5:1 contrast:\n${failing.slice(0, 20).join('\n')}`).toEqual([]);
  });
});
