# Homepage Test Plan — Kanaa, English (/en-sa/) (https://thekanaa.com)

Generated from `state/en/homepage-map.json` (captured 2026-09-14T08:13:14.577Z) by `scripts/generate-test-plan.js` (HOMEPAGE_LOCALE=en).

## Source discovery
- URL: https://thekanaa.com/en-sa/
- Title: The Kanaa: Online Toy, Gaming & Electronics Store in KSA
- Viewport at capture: 1280x800
- Sections discovered: 19
- Buttons: 192 · Links: 189 · Inputs: 3 · Images: 389 (broken: 0) · Sliders: 1 · Product widgets: 9 (cards sampled: 71)

## Sections
- **HOME-SEC-EN-001** — Shop By Brand _(carousel)_
- **HOME-SEC-EN-002** — SMART TABLET. SMARTER BUNDLE _(product-widget)_
- **HOME-SEC-EN-003** — BUY 1 GET 1 FREE _(product-widget)_
- **HOME-SEC-EN-004** — SHOP PS5 BUNDLES _(product-widget)_
- **HOME-SEC-EN-005** — A FRAGRANCE WORTH GIFTING _(product-widget)_
- **HOME-SEC-EN-006** — Deal Of The Week _(product-widget)_
- **HOME-SEC-EN-007** — Most Popular Products _(product-widget)_
- **HOME-SEC-EN-008** — Explore our hidden gems _(content-block)_
- **HOME-SEC-EN-009** — New to our Collection _(product-widget)_
- **HOME-SEC-EN-010** — Spotlight Deals💖 _(content-block)_
- **HOME-SEC-EN-011** — Tailored For You _(product-widget)_
- **HOME-SEC-EN-012** — Shop by Age _(product-widget)_
- **HOME-SEC-EN-013** — Delivering Happiness, Creating Memories _(content-block)_
- **HOME-SEC-EN-014** — ⭐ Rated 4.7 on Google _(content-block)_
- **HOME-SEC-EN-015** — Kanaa: Online Toy Store in Saudi Arabia _(content-block)_
- **HOME-SEC-EN-016** — Explore Our Wide Range of Toys in KSA _(content-block)_
- **HOME-SEC-EN-017** — Why Shop From Kanaa in Saudi Arabia _(content-block)_
- **HOME-SEC-EN-018** — Frequently Asked Questions _(content-block)_
- **HOME-SEC-EN-019** — Search By Category _(content-block)_

## Coverage
- Requirements: 67
- Scenarios: 67
- Test cases: 67
- Viewports covered: Desktop 1440x900, Desktop 1920x1080, Tablet 1024x768, Tablet 768x1024, Mobile 390x844, Mobile 393x852, Mobile 412x915
- Browsers covered: chromium, firefox, webkit

## Known risks / assumptions from discovery (not yet confirmed as bugs)
- None flagged.

## Console errors observed during discovery load (deduplicated)
- None.

## Network failures observed during discovery load
- First-party (thekanaa.com and subdomains, e.g. media-stage) — **actionable, likely correlates with the 0 broken images above**: 2
  - POST https://sg.thekanaa.com/events/b4ec1a274e36ea5c434300f62d7f5e9d3995b4145fb49599693ca3ab8b467cf0 — net::ERR_ABORTED
  - POST https://sg.thekanaa.com/events/b4ec1a274e36ea5c434300f62d7f5e9d3995b4145fb49599693ca3ab8b467cf0 — net::ERR_ABORTED
- Third-party (analytics/ads beacons — informational, not blocking): 9

## Assumptions
- "Every button/link" requirements are executed data-driven against `state/en/homepage-map.json`, not enumerated one row per element in this plan.
- Product-card test cases sample representative cards (first/middle/last of the widget) per spec section 12, not every card in every widget.
- No real order is ever placed; Add to Cart tests stop at cart confirmation, consistent with README safety notes for this project.
- Login-gated flows are out of scope for the homepage suite (kanaa-test-bot's existing `tests/e2e/login.spec.js`/`checkout.spec.js` cover those separately and are tagged `@otp` since they trigger a real OTP).

## Not yet executed
This plan has been generated but **no test cases have been executed yet**. Execution, evidence capture, bug filing, retesting, regression and the final QA report are later phases — see `agents/homepage-executor.md` and `agents/homepage-bug-analyzer.md`.
