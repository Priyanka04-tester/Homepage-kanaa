/**
 * PHASE 2/3 — Homepage discovery + mapping.
 *
 * This is not a pass/fail assertion suite. It drives a real browser over the
 * homepage, walks the live DOM/accessibility tree, and writes everything it
 * finds to state/homepage-map.json so later phases (test-plan generation,
 * execution) have a persisted, structured source of truth instead of relying
 * on conversation memory.
 *
 * Section segmentation heuristic (tuned to this site — see README "Known
 * site quirks"): the homepage has no <header>/<main>/<footer> landmarks,
 * everything lives under div#main-container. So sections are inferred from
 * heading-like elements (h1-h4, [role=heading]) in DOM order, plus a few
 * known non-heading regions (sticky topbar, #site-footer and its siblings)
 * detected directly. If the markup changes, this is the one place to revisit.
 */
const fs = require('fs');
const path = require('path');
const { test } = require('@playwright/test');

const LOCALE_PATH = process.env.LOCALE_PATH || '/en-sa/';
const STATE_DIR = path.join(__dirname, '..', '..', 'state');
const EVIDENCE_DIR = path.join(__dirname, '..', '..', 'evidence', 'homepage', 'discovery');

for (const dir of [STATE_DIR, EVIDENCE_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

test.describe('Homepage discovery', () => {
  test('discover and map the homepage', async ({ page, context }, testInfo) => {
    test.setTimeout(120_000);

    const consoleErrors = [];
    const networkFailures = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push({ text: msg.text(), location: msg.location() });
      }
    });
    page.on('requestfailed', (req) => {
      networkFailures.push({
        url: req.url(),
        method: req.method(),
        failure: req.failure()?.errorText || 'unknown',
        resourceType: req.resourceType(),
      });
    });
    page.on('response', (res) => {
      if (res.status() >= 400) {
        networkFailures.push({
          url: res.url(),
          method: res.request().method(),
          status: res.status(),
          resourceType: res.request().resourceType(),
        });
      }
    });

    const startedAt = new Date().toISOString();
    await page.goto(LOCALE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});

    const url = page.url();
    const title = await page.title();
    const viewport = page.viewportSize();

    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'initial-screenshot.png') });

    // Scroll top -> bottom in steps to trigger lazy-loaded sections, then back to top.
    // This site scrolls inside div#main-container, not the window — scroll that element.
    const scrollSteps = 12;
    for (let i = 0; i < scrollSteps; i++) {
      await page.evaluate((step) => {
        const scroller = document.getElementById('main-container') || document.scrollingElement;
        scroller.scrollTop = (scroller.scrollHeight / step.total) * step.i;
      }, { i: i + 1, total: scrollSteps });
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'full-page-final.png'), fullPage: true });
    await page.evaluate(() => {
      const scroller = document.getElementById('main-container') || document.scrollingElement;
      scroller.scrollTop = 0;
      window.scrollTo(0, 0);
    });

    let ariaSnapshot = null;
    try {
      ariaSnapshot = await page.locator('body').ariaSnapshot();
    } catch (e) {
      ariaSnapshot = `<ariaSnapshot unavailable: ${e.message}>`;
    }
    fs.writeFileSync(path.join(EVIDENCE_DIR, 'aria-snapshot.txt'), ariaSnapshot, 'utf-8');

    // --- In-page structural extraction ---
    const raw = await page.evaluate(() => {
      function isVisible(el) {
        if (!(el instanceof Element)) return false;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none'
        );
      }

      function accessibleName(el) {
        return (
          el.getAttribute('aria-label') ||
          el.getAttribute('alt') ||
          el.getAttribute('title') ||
          el.innerText?.trim().slice(0, 120) ||
          el.textContent?.trim().slice(0, 120) ||
          ''
        );
      }

      function absTop(el) {
        return Math.round(el.getBoundingClientRect().top + window.scrollY);
      }

      // 1. Heading-based section anchors.
      // Product names inside cards are also marked up as headings (h3/h4), which would
      // otherwise create one pseudo-"section" per product. Every product-card heading on
      // this site is wrapped in the card's own <a href> link and a real section title never
      // is, so that's the signal used to tell "section title" apart from "product name".
      const headingEls = Array.from(document.querySelectorAll('h1, h2, h3, h4, [role="heading"]'));
      const headings = headingEls
        .map((el) => ({
          text: el.textContent.trim(),
          tag: el.tagName,
          top: absTop(el),
          visible: isVisible(el),
          insideProductLink: !!el.closest('a[href]'),
        }))
        .filter((h) => !h.insideProductLink);

      const productNameHeadings = headingEls
        .filter((el) => !!el.closest('a[href]'))
        .map((el) => el.textContent.trim());

      // 2. All interactive elements, globally, with position (assigned to sections in Node)
      const interactiveSelector = 'button, a[href], input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="checkbox"], [role="radio"]';
      const interactiveEls = Array.from(document.querySelectorAll(interactiveSelector));
      const interactive = interactiveEls.map((el) => ({
        tag: el.tagName,
        role: el.getAttribute('role') || null,
        name: accessibleName(el),
        href: el.tagName === 'A' ? el.getAttribute('href') : null,
        type: el.getAttribute('type') || null,
        disabled: !!el.disabled || el.getAttribute('aria-disabled') === 'true',
        top: absTop(el),
        visible: isVisible(el),
      }));

      // 3. Images (incl. broken-image detection)
      const imageEls = Array.from(document.querySelectorAll('img'));
      const images = imageEls.map((el) => ({
        src: el.getAttribute('src') || el.currentSrc || null,
        alt: el.getAttribute('alt'),
        top: absTop(el),
        visible: isVisible(el),
        broken: el.complete && el.naturalWidth === 0,
      }));

      // 4. Sliders/carousels: pair "Previous slide" / "Next slide" controls by common ancestor
      const prevBtns = interactiveEls.filter((el) => /previous slide/i.test(accessibleName(el)));
      const nextBtns = interactiveEls.filter((el) => /next slide/i.test(accessibleName(el)));
      function closestCommonAncestor(a, b) {
        const ancestorsOfA = new Set();
        let cur = a;
        while (cur) { ancestorsOfA.add(cur); cur = cur.parentElement; }
        cur = b;
        while (cur) { if (ancestorsOfA.has(cur)) return cur; cur = cur.parentElement; }
        return document.body;
      }
      const sliders = prevBtns.map((prevBtn, i) => {
        const nextBtn = nextBtns[i] || nextBtns[0] || null;
        const ancestor = nextBtn ? closestCommonAncestor(prevBtn, nextBtn) : prevBtn.parentElement;
        const dotLike = ancestor
          ? Array.from(ancestor.querySelectorAll('button, span, li')).filter((el) => {
              const cls = (el.className && typeof el.className === 'string') ? el.className : '';
              return /dot|indicator|bullet|pagination/i.test(cls) || el.getAttribute('role') === 'tab';
            })
          : [];
        const slideLinks = ancestor
          ? Array.from(ancestor.querySelectorAll('a[href]'))
          : [];
        return {
          top: absTop(ancestor),
          visible: isVisible(ancestor),
          prevControlName: accessibleName(prevBtn),
          nextControlName: nextBtn ? accessibleName(nextBtn) : null,
          paginationIndicatorCount: dotLike.length,
          slideLinkCount: slideLinks.length,
          slideLinkHrefs: slideLinks.slice(0, 20).map((a) => a.getAttribute('href')),
        };
      });

      // 5. Product cards: anchor on "Add to Cart"-style buttons (validated pattern for this site)
      const addToCartBtns = interactiveEls.filter((el) => /add to cart/i.test(accessibleName(el)));
      const productCards = addToCartBtns.map((btn) => {
        let card = btn.closest('a') || btn.parentElement;
        const text = card ? card.textContent.replace(/\s+/g, ' ').trim().slice(0, 200) : '';
        // No literal currency symbol on this site's cards (a riyal glyph icon, not text) —
        // fall back to a bare-decimal/integer price-shaped number as a heuristic signal.
        const priceMatch = text.match(/(SAR|ر\.س|\$)\s?[\d,]+(\.\d+)?/) || text.match(/\b\d{1,5}(\.\d{1,2})?\b/);
        const wishlistBtn = card ? card.querySelector('[aria-label*="wishlist" i]') : null;
        const cardImg = card ? card.querySelector('img') : null;
        return {
          top: absTop(card || btn),
          visible: isVisible(card || btn),
          hasPriceText: !!priceMatch,
          priceSample: priceMatch ? priceMatch[0] : null,
          hasWishlistButton: !!wishlistBtn,
          hasImage: !!cardImg,
          imageBroken: cardImg ? (cardImg.complete && cardImg.naturalWidth === 0) : null,
          textSample: text,
        };
      });

      // 6. Known non-heading regions
      const siteFooter = document.getElementById('site-footer');
      const stickyTopbar = document.querySelector('.sticky');

      return {
        headings,
        productNameHeadings,
        interactive,
        images,
        sliders,
        productCards,
        siteFooterPresent: !!siteFooter,
        siteFooterTop: siteFooter ? absTop(siteFooter) : null,
        stickyTopbarTop: stickyTopbar ? absTop(stickyTopbar) : null,
        // This site scrolls inside div#main-container (h-[100vh] overflow-y-auto), not the
        // window/body, so document.documentElement.scrollHeight is just the viewport height.
        documentHeight: (document.getElementById('main-container') || document.documentElement).scrollHeight,
      };
    });

    await page.evaluate(() => window.scrollTo(0, 0));

    // --- Node-side: assign interactive elements/images/sliders/cards to nearest preceding heading section ---
    const sortedHeadings = [...raw.headings].sort((a, b) => a.top - b.top);

    function sectionIndexForTop(top) {
      let idx = -1;
      for (let i = 0; i < sortedHeadings.length; i++) {
        if (sortedHeadings[i].top <= top + 5) idx = i;
        else break;
      }
      return idx;
    }

    const sectionBuckets = sortedHeadings.map((h) => ({
      heading: h,
      buttons: [], links: [], inputs: [], images: [], sliders: [], productCards: [],
    }));
    const preHeadingBucket = { heading: null, buttons: [], links: [], inputs: [], images: [], sliders: [], productCards: [] };

    function bucketFor(top) {
      const idx = sectionIndexForTop(top);
      return idx === -1 ? preHeadingBucket : sectionBuckets[idx];
    }

    for (const el of raw.interactive) {
      const bucket = bucketFor(el.top);
      if (el.tag === 'A') bucket.links.push(el);
      else if (el.tag === 'INPUT' || el.tag === 'SELECT' || el.tag === 'TEXTAREA') bucket.inputs.push(el);
      else bucket.buttons.push(el);
    }
    for (const img of raw.images) bucketFor(img.top).images.push(img);
    for (const s of raw.sliders) bucketFor(s.top).sliders.push(s);
    for (const c of raw.productCards) bucketFor(c.top).productCards.push(c);

    const allBuckets = [preHeadingBucket, ...sectionBuckets].filter(
      (b) => b.heading || b.buttons.length || b.links.length || b.inputs.length || b.images.length || b.sliders.length || b.productCards.length
    );

    let secNum = 0;
    const sections = allBuckets.map((b) => {
      secNum += 1;
      const id = `HOME-SEC-${String(secNum).padStart(3, '0')}`;
      const elementCount = b.buttons.length + b.links.length + b.inputs.length + b.images.length;
      let type = 'content-block';
      if (!b.heading) type = 'topbar-or-preamble';
      if (b.sliders.length) type = 'carousel';
      if (b.productCards.length >= 2) type = 'product-widget';
      return {
        id,
        name: b.heading ? b.heading.text : 'Header / Topbar (above first heading)',
        type,
        locationTop: b.heading ? b.heading.top : 0,
        visible: b.heading ? b.heading.visible : true,
        interactive: elementCount > 0,
        elementCounts: {
          buttons: b.buttons.length,
          links: b.links.length,
          inputs: b.inputs.length,
          images: b.images.length,
          sliders: b.sliders.length,
          productCards: b.productCards.length,
        },
        elements: {
          buttons: b.buttons,
          links: b.links,
          inputs: b.inputs,
          images: b.images,
          sliders: b.sliders,
          productCards: b.productCards,
        },
      };
    });

    // Footer as trailing section(s), described directly (no heading anchor for it here)
    if (raw.siteFooterPresent) {
      secNum += 1;
      sections.push({
        id: `HOME-SEC-${String(secNum).padStart(3, '0')}`,
        name: 'Site Footer',
        type: 'footer',
        locationTop: raw.siteFooterTop,
        visible: true,
        interactive: true,
        elementCounts: null,
        elements: null,
        note: 'Footer contents are included in whichever heading bucket falls after #site-footer\'s position; see raw.siteFooterTop vs section locationTop ordering.',
      });
    }

    const totalButtons = raw.interactive.filter((e) => e.tag !== 'A' && e.tag !== 'INPUT' && e.tag !== 'SELECT' && e.tag !== 'TEXTAREA').length;
    const totalLinks = raw.interactive.filter((e) => e.tag === 'A').length;
    const totalInputs = raw.interactive.filter((e) => e.tag === 'INPUT' || e.tag === 'SELECT' || e.tag === 'TEXTAREA').length;

    const discoveredIssues = [];
    for (const h of raw.headings) {
      if (/(.)\1{2,}/.test(h.text.replace(/[^a-zA-Z]/g, ''))) {
        discoveredIssues.push({
          type: 'content-anomaly',
          description: `Heading text looks malformed (repeated trailing characters): "${h.text}"`,
        });
      }
      if (h.text.trim() === '') {
        discoveredIssues.push({
          type: 'content-anomaly',
          description: `Product widget at top=${h.top} has an empty section heading (blank title above the product row)`,
        });
      }
    }
    const seenTestProducts = new Set();
    for (const name of raw.productNameHeadings) {
      if (/\btest\b|\btesting\b|\brental test\b|\bdummy\b|\bplaceholder\b/i.test(name) && !seenTestProducts.has(name)) {
        seenTestProducts.add(name);
        discoveredIssues.push({
          type: 'test-data-leak',
          description: `A homepage product widget displays what looks like QA/placeholder test data as a real product: "${name}"`,
        });
      }
    }
    for (const img of raw.images) {
      if (img.broken) {
        discoveredIssues.push({ type: 'broken-image', description: `Broken image (naturalWidth=0): src="${img.src}" alt="${img.alt}"` });
      }
    }
    for (const s of raw.sliders) {
      if (s.slideLinkHrefs.some((h) => h === '#')) {
        discoveredIssues.push({ type: 'placeholder-link', description: `Slider has one or more slide links pointing to "#" (non-functional placeholder) near top=${s.top}` });
      }
    }

    const homepageMap = {
      meta: {
        url,
        title,
        viewport,
        localePath: LOCALE_PATH,
        capturedAt: startedAt,
        documentHeight: raw.documentHeight,
        browser: testInfo.project.name,
      },
      sections,
      totals: {
        sections: sections.length,
        buttons: totalButtons,
        links: totalLinks,
        inputs: totalInputs,
        images: raw.images.length,
        brokenImages: raw.images.filter((i) => i.broken).length,
        sliders: raw.sliders.length,
        productWidgetsDetected: sections.filter((s) => s.type === 'product-widget').length,
        productCardsSampled: raw.productCards.length,
      },
      consoleErrors,
      networkFailures,
      discoveredIssues,
    };

    writeJson(path.join(STATE_DIR, 'homepage-map.json'), homepageMap);
    fs.writeFileSync(path.join(EVIDENCE_DIR, 'console.log'), JSON.stringify(consoleErrors, null, 2), 'utf-8');
    fs.writeFileSync(path.join(EVIDENCE_DIR, 'network-failures.json'), JSON.stringify(networkFailures, null, 2), 'utf-8');

    await context.tracing.stop({ path: path.join(EVIDENCE_DIR, 'trace.zip') });

    console.log(`[discovery] sections=${sections.length} buttons=${totalButtons} links=${totalLinks} images=${raw.images.length} sliders=${raw.sliders.length} consoleErrors=${consoleErrors.length} networkFailures=${networkFailures.length}`);
  });
});
