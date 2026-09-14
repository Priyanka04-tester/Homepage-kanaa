# Homepage Test Plan — Kanaa, Arabic (/ar-sa/) (https://thekanaa.com)

Generated from `state/ar/homepage-map.json` (captured 2026-09-14T08:14:22.609Z) by `scripts/generate-test-plan.js` (HOMEPAGE_LOCALE=ar).

## Source discovery
- URL: https://thekanaa.com/ar-sa/
- Title: كانا: متجر الألعاب والإلكترونيات أونلاين في السعودية
- Viewport at capture: 1280x800
- Sections discovered: 19
- Buttons: 192 · Links: 188 · Inputs: 3 · Images: 388 (broken: 0) · Sliders: 1 · Product widgets: 9 (cards sampled: 71)

## Sections
- **HOME-SEC-AR-001** — تسوّّق حسب الماركة _(carousel)_
- **HOME-SEC-AR-002** — تابلتك الجديد مع كل اللي تحتاجه. _(product-widget)_
- **HOME-SEC-AR-003** — اشتر 1 واحصل على 1 مجانا _(product-widget)_
- **HOME-SEC-AR-004** — PS5 تسوق باقات _(product-widget)_
- **HOME-SEC-AR-005** — اختاروا عطراً يستحق أن يكون هدية. _(product-widget)_
- **HOME-SEC-AR-006** — عروض الأسبوع _(product-widget)_
- **HOME-SEC-AR-007** — المنتجات الأكثر شعبية _(product-widget)_
- **HOME-SEC-AR-008** — استكشف جواهرنا الخفية _(content-block)_
- **HOME-SEC-AR-009** — جديد في مجموعتنا _(product-widget)_
- **HOME-SEC-AR-010** — عروض اس تثنائية💖 _(content-block)_
- **HOME-SEC-AR-011** — منتجات على ذوقك _(product-widget)_
- **HOME-SEC-AR-012** — منتجات مناسبة لكل عمر _(product-widget)_
- **HOME-SEC-AR-013** — نصنع السعادة , نخلق الذكريات _(content-block)_
- **HOME-SEC-AR-014** — ⭐ بتقييم 4.7 على قوقل _(content-block)_
- **HOME-SEC-AR-015** — كانا: متجرك الإلكتروني الأول للألعاب في السعودية _(content-block)_
- **HOME-SEC-AR-016** — استكشف عالمنا الواسع من الألعاب في المملكة _(content-block)_
- **HOME-SEC-AR-017** — لماذا تختار التسوق من كانا في السعودية؟ _(content-block)_
- **HOME-SEC-AR-018** — الأسئلة الشائعة _(content-block)_
- **HOME-SEC-AR-019** — تسوق حسب الفئة _(content-block)_

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
- First-party (thekanaa.com and subdomains, e.g. media-stage) — **actionable, likely correlates with the 0 broken images above**: 5
  - POST https://thekanaa.com/ar-sa/ — net::ERR_ABORTED
  - GET https://thekanaa.com/ar-sa/most-popular-products.html?_rsc=pm4ao — net::ERR_ABORTED
  - GET https://thekanaa.com/ar-sa/all-tablets.html?_rsc=pm4ao — net::ERR_ABORTED
  - POST https://sg.thekanaa.com/events/b4ec1a274e36ea5c434300f62d7f5e9d3995b4145fb49599693ca3ab8b467cf0 — net::ERR_ABORTED
  - POST https://sg.thekanaa.com/events/b4ec1a274e36ea5c434300f62d7f5e9d3995b4145fb49599693ca3ab8b467cf0 — net::ERR_ABORTED
- Third-party (analytics/ads beacons — informational, not blocking): 8

## Assumptions
- "Every button/link" requirements are executed data-driven against `state/ar/homepage-map.json`, not enumerated one row per element in this plan.
- Product-card test cases sample representative cards (first/middle/last of the widget) per spec section 12, not every card in every widget.
- No real order is ever placed; Add to Cart tests stop at cart confirmation, consistent with README safety notes for this project.
- Login-gated flows are out of scope for the homepage suite (kanaa-test-bot's existing `tests/e2e/login.spec.js`/`checkout.spec.js` cover those separately and are tagged `@otp` since they trigger a real OTP).

## Not yet executed
This plan has been generated but **no test cases have been executed yet**. Execution, evidence capture, bug filing, retesting, regression and the final QA report are later phases — see `agents/homepage-executor.md` and `agents/homepage-bug-analyzer.md`.
