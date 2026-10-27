# Homepage QA report: 2026-10-27

Target: live production, `https://thekanaa.com/en-sa/` (English, KSA) and `https://thekanaa.com/ar-sa/` (Arabic, KSA).
Browser: Chromium (desktop 1440x900) for the regression suites. Discovery and feature probes ran on desktop 1440 and mobile 390 emulation.
Evidence: `state/en/run-report-2026-10-27.csv|.xlsx`, `state/ar/run-report-2026-10-27.csv|.xlsx`, `state/<locale>/homepage-map.json`, `state/<locale>/discovery-diff.json`.

Environment status:
- KSA English and Arabic: live, tested.
- UAE storefront: **BLOCKED**. Not live yet; no UAE URL is configured, so nothing was tested.
- Real mobile devices: **NOT TESTED**. Mobile results are browser emulation only.
- Firefox and WebKit: this run used Chromium only. The Linux WebKit check from 2026-10-26 is in the commit history.

## 1. Feature inventory

Discovery found 20 sections in each language (19 in the 2026-10-12 baseline). Section names come from the homepage map.

Confirmed on the page (checked live):
- Announcement bar (non-interactive promotional text, for example "VAT-Registered KSA Business / 14 Days Easy Returns").
- Header search input with a "Search products" label (desktop only; hidden behind an icon on mobile).
- Language switch (EN: "عربي"; AR: "EN"). Switching works (EN to `/ar-sa/`, `dir=rtl`).
- Cart link on mobile (`/en-sa/new-cart/`). On desktop, the cart is an SVG icon with no link or button role.
- Hero carousel (slick slider, 22 slides, autoplay about every 20 seconds).
- Shop-by-brand carousel, product widgets with Add to Cart (16 buttons, all enabled and visible on the live page), footer social links (4) and policy links (4 on desktop, 2 on mobile).
- Account links appear only on trust-badge cards (for example "Free Delivery across KSA" links to `/create-account/?redirect=/account/my-orders`). No header account link was found by text.

Not found on the page (checked, not assumed): Smart App Banner, cookie or consent banner, recently viewed, recommended, best-sellers, mega menu, header wishlist icon.

Inconclusive: a header category menu (the top-left grid icon's behaviour was not verified), and a header wishlist icon on desktop.

## 2. Test cases

- English plan: 92 cases (66 global and per-section cases from the map, 13 appended for new sections, 14 flagged as retired).
- Arabic plan: 84 cases (17 appended for new sections, 18 flagged as retired).
- Section IDs in the plans were remapped by section name, because the position-based IDs shifted. No existing case was deleted. Remap counts: EN 8, AR 4 (`state/<locale>/plan-changes.json`).

## 3. Test execution

| Locale | Rows | PASS | FAIL | Notes |
|---|---|---|---|---|
| EN (Chromium desktop) | 52 | 42 | 10 | Run 2026-10-27, JSON in scratch |
| AR (Chromium desktop) | 52 | 43 | 9 | Run 2026-10-27 |

No test is marked FLAKY or NOT RUN in these runs.

## 4. Bug report

No confirmed new defect in this run. Every failure below is INCONCLUSIVE until the cause is confirmed; none is recorded as a site bug.

| Failure | Tests | Classification | Evidence |
|---|---|---|---|
| "every link resolves" hits the 60-second test timeout | EN-001, EN-049, AR-001, AR-049 | INCONCLUSIVE (automation: too slow for the link count) | CSV error column |
| Back navigation after clicking a product card lands on `about:blank` | EN-064, AR-064 | INCONCLUSIVE (automation) | CSV error column |
| "No product cards found live" for widgets matched by heading text | EN-028, EN-044, EN-082, EN-070, AR-040, AR-082 | INCONCLUSIVE (automation locator; discovery records 8 product cards in "More Tech. More Value") | CSV error column |
| Add to Cart sample click fails, while all 16 live Add to Cart buttons are enabled | EN-008, AR-070 | INCONCLUSIVE (automation scope) | live probe |
| Carousel "previous" locator resolves to a non-clickable button; the live Previous control is visible and enabled | EN-003, AR-003 | INCONCLUSIVE (automation locator) | live probe |
| Language switch test: URL unchanged | EN-066, AR-066 | INCONCLUSIVE (selector; manual check passed earlier) | CSV error column |
| First-party `_rsc` prefetch and analytics requests aborted by navigation | EN-065, AR-065 | Expected cancellations, not defects (per brief) | CSV error column |

Existing defect records: `state/en/bugs.json` and `state/ar/bugs.json` are empty. The six defects confirmed on 2026-10-09 are tracked in `tests/homepage-ts` as expected failures (unnamed header buttons, missing `rel="noopener"`, React error #418, 3.56:1 contrast, a top-left mobile button that opens no menu, and the Electronics tab hidden below 1440px). They are not duplicated here.

## 5. Responsive and localization

- Horizontal overflow: the check now counts only elements that extend past the viewport without a clipping ancestor. The page does not overflow on desktop, tablet, or mobile.
- RTL: Arabic sets `dir="rtl"`. English sets `dir="ltr"`.
- Mobile emulation at 390px: the language switch, logo, and search input (hidden) were checked. This is emulation only, not a real device.
- Not tested: tablet and mobile suites in this run (the Chromium project only), real devices, UAE.

## 6. Console and network summary

- Discovery console errors: 0 (EN and AR).
- Probe console errors and failed document responses: 0 (EN desktop, AR desktop, EN mobile).
- Discovery network failures: 16 (EN), 17 (AR). All are third-party analytics or ad calls (Google, DoubleClick, merchant-center), Next.js `_rsc` prefetches cancelled by navigation, or the first-party `sg.thekanaa.com/events` analytics POST. Treated as expected cancellations, not defects.
- React error #418 (hydration) was seen on load in the earlier TypeScript suite (desktop and 1024px and wider). These JavaScript suites do not capture uncaught page errors, so this run cannot confirm or deny it.

## 7. Regression comparison (2026-10-12 baseline to 2026-10-27)

Discovery, English (19 to 20 sections):
- Added: More Tech. More Value; Big Games. Better Bundles.; A Little Dress-Up. A Lot of Magic.; Kanaa: Online Shopping in KSA for Lifestyle Products; Shop by Category; Why Shop at Kanaa Store; A Trusted Saudi Online Store.
- Removed: Your New Phone, Plus More.; A Fragrance Worth Gifting; Gaming Headphones; Kanaa: Online Toy Store in Saudi Arabia; Explore Our Wide Range of Toys in KSA; Why Shop From Kanaa in Saudi Arabia.
- Changed element counts: Shop By Brand; New to our Collection; Search By Category.

Discovery, Arabic (19 to 20 sections): the same pattern, with Arabic names (`state/ar/discovery-diff.json`).

Several added names are FAQ or SEO headings. These are content changes, not confirmed defects. Each needs a product owner decision on whether the removal and the new headings are intentional.

Suite comparison: EN 41 PASS / 11 FAIL (2026-10-12) to 42 / 10 (2026-10-27). AR 47 / 5 (2026-10-12 after its fixes) to 43 / 9 (2026-10-27). The change in AR is caused by today's new widgets and by stricter name matching, not by a new site defect.

## 8. Coverage and risk

Covered by execution today: 20 homepage sections in each language, 52 test rows per language, Chromium desktop.

Gaps:
- UAE: blocked (not live).
- Real mobile devices and tablets in this run: not covered (see the earlier 8-project TypeScript suite for emulated viewports).
- Firefox and WebKit: not run today.
- Header category menu, header wishlist and cart on desktop: not verified.
- Email delivery: not configured (no credentials); report not emailed.

Risks:
- Content churn: 7 added and 6 removed sections in one week. Needs a review of intentional changes.
- Automation fragility: name-based widget matching and 60-second link timeouts. The results above are weaker than the page's real state until these are fixed.
- React hydration error #418 on desktop: unconfirmed in this run, confirmed in the earlier suite.

## Next actions

1. Confirm with the product owner whether the 6 removed and 7 added sections are intentional.
2. Fix the automation items: widget matching by ID rather than heading text, a per-link time budget, the back-navigation check, the language-switch selector, and filtering out `_rsc` prefetch aborts.
3. Add uncaught-page-error capture to the JavaScript suites, so React #418 is tracked in the same run.
4. Verify the header category menu and the desktop cart and wishlist controls manually.
5. Provide UAE URL and storefront settings when UAE goes live.
