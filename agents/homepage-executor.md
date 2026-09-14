# Homepage Executor

Owns **Phase 5-6 (EXECUTE → COLLECT EVIDENCE)**. Built: `tests/homepage/homepage-{buttons,links,
sliders,products,ui,responsive,negative,browsers}.spec.js`, run via `npm run test:homepage` /
`npm run test:homepage:browsers`.

## Hard-won fixes — don't reintroduce these
The first full run produced 26 failures; three were real site bugs and the rest were harness
bugs from assumptions that don't hold on this specific (heavily personalized) homepage:
- **Don't index product cards by a remembered global position.** This site's widgets rotate
  title, product set, *and slot order* between loads. `homepage-products.spec.js` re-derives
  each widget's card indices live at the start of every test (`liveCardIndicesForSection`):
  exact heading-text match first, falling back to matching the Nth product widget by document
  position if the text itself changed. If a section still comes back with zero cards after both,
  that's now a real, informative finding — not a false positive.
- **Don't fail a generic button/link re-lookup just because it "wasn't found."** Same rotation
  issue. `homepage-buttons.spec.js` logs a not-found button as a `notFound` note, not a `FAIL` —
  only a console error from a button that *was* found and clicked counts as a real failure.
- **Never click the same locator concurrently** (e.g. `Promise.all([btn.click(), btn.click()])`)
  to simulate a rapid double-click — it's a race, not a realistic user action, and it corrupted
  page navigation state once. Two quick *sequential* clicks are the right way to test this.
- **`page.waitForLoadState()` after clicking a same-page SPA link is a no-op** — Next.js
  client-side routing changes the URL via the History API, not a new navigation, so that call
  resolves immediately against the *already-loaded* page. Use `page.waitForURL(pattern)` instead.
- **A lazy-loaded image needs more than a fixed short wait before checking `naturalWidth`** —
  poll `img.complete` for a few seconds first, or a slow-but-fine image gets misreported broken.
- **Product widgets lazy-mount as they scroll into view — not just their images.** A fresh
  `page.goto()` with no scroll can have *zero* "Add to Cart" buttons in the DOM yet.

## What it does
For each `TC-HOME-*` in `state/test-cases.json`, in a new `tests/homepage/homepage-*.spec.js`
file grouped by feature (`homepage-buttons.spec.js`, `homepage-links.spec.js`,
`homepage-sliders.spec.js`, `homepage-products.spec.js`, `homepage-ui.spec.js`,
`homepage-responsive.spec.js`, `homepage-negative.spec.js`):

1. Load the concrete elements for that test case's `sectionId`/category out of
   `state/homepage-map.json` (data-driven — see `homepage-test-planner.md` on why the plan
   itself doesn't enumerate every element).
2. Run the steps described in the test case.
3. On failure: capture screenshot, video, trace, console log, network log into
   `evidence/homepage/<TC-ID>/` (per spec section 23 — never fabricate evidence).
4. Write an entry to `state/executions.json`:
   `{ id: EXEC-NNNN, testCaseId, status: PASS|FAIL|BLOCKED, browser, viewport, startedAt,
   finishedAt, evidencePath, notes }`. Update the corresponding `test-cases.json` row's
   `actualResult`/`status`/`browser`/`viewport`/`executionId`/`evidencePath`.
5. Keep going after a failure — one bug must never stop the run (spec section 25/31).

## Constraints inherited from the existing kanaa-test-bot project
These are hard-won, already documented in the root `README.md` — re-read it before writing
execution specs, don't rediscover them the expensive way:
- `workers: 1` in `playwright.config.js` — this is a shared dev/staging environment; running
  homepage specs concurrently with the existing `tests/e2e/*` cart/checkout specs will contend
  and produce flaky failures.
- Never click "Pay Now" / complete checkout; never place a real order.
- Logging in always sends a real OTP — homepage execution should stay a guest-session suite and
  not pull in `tests/e2e/login.spec.js`'s `@otp`-tagged flow.
- Repeated back-to-back Add to Cart against this dev environment increasingly fails the longer a
  session runs (looks like throttling on the stock/price/finance check, not a real bug in every
  case) — space out product-widget test cases, and treat a late-run Add to Cart failure as
  "investigate before filing," not an automatic bug.
