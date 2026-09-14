# kanaa-test-bot

Two things live in this repo:
1. **The original hand-written E2E/API/load/monitoring suite** (`tests/e2e`, `tests/api`,
   `load/`, `monitoring/`) — see `README.md`.
2. **The autonomous homepage QA bot** (`agents/`, `state/<locale>/`, `evidence/homepage/<locale>/`,
   `requirements/`, `specs/`, `tests/homepage/`) — built specifically to test the public
   homepage, in English and Arabic, as its own scoped project — not a general site-wide suite.

## Two different targets, on purpose
- `tests/e2e` and `tests/api` target **dev-nx.thekanaa.com** (a shared dev/staging environment)
  via `BASE_URL`/`LOCALE_PATH` in `.env`. Never point these at production without explicit
  sign-off — they do things like add-to-cart/checkout-adjacent flows that shouldn't run against
  a live storefront by default. Keep `workers: 1` in `playwright.config.js`.
- `tests/homepage` (the QA bot) targets **production, https://thekanaa.com**, via
  `HOMEPAGE_BASE_URL`/`HOMEPAGE_LOCALE` in `.env` — a deliberately separate env var pair, so
  changing one target never silently changes the other. This was an explicit choice (the bot
  exists specifically to test the real public homepage), not an oversight — see
  `playwright.homepage.config.js` for the full reasoning.
- Both still follow the same safety rules: never place a real order, never enter real payment
  details, and the login flow (used only by `tests/e2e`) always sends a real OTP so the homepage
  bot stays a guest-session suite and never invokes it.

## Homepage QA bot — locale-parametrized, run once per locale
Every discovery/plan/execution/bug/report script is scoped by the `HOMEPAGE_LOCALE` env var
(`en` or `ar`, default `en` — see `utils/qaState.js`). This selects: which URL path is tested
(`/en-sa/` vs `/ar-sa/`), which state directory is read/written (`state/en/` vs `state/ar/`),
which evidence directory (`evidence/homepage/en/` vs `evidence/homepage/ar/`), and the ID prefix
on every generated ID (`TC-HOME-EN-001` vs `TC-HOME-AR-001` — they never collide, so results from
both locales can be compared side by side). Every `npm run *:homepage` script has `:en`/`:ar`
variants, plus a bare variant that runs both in sequence where that makes sense:

```bash
npm run discover:homepage        # Phase 1-3, both locales (or :en / :ar for just one)
npm run plan:homepage            # Phase 4, both locales
npm run test:homepage            # Phase 5-6, both locales (chromium; excludes cross-browser smoke)
npm run test:homepage:browsers   # Phase 5-6 cross-browser smoke, both locales (needs firefox/webkit installed)
npm run bugs:homepage            # Phase 8 — re-derives bugs.json per locale from test-cases.json;
                                  #   review scripts/file-bugs.js first, it's a curated pass, not fully automatic
npm run retest:homepage:en -- <BUG-ID> [--browser=x | --manual FIXED|NOT_FIXED "note"]  # Phase 9 — per-locale only, a bug belongs to one locale
npm run regress:homepage:en      # Phase 10 — per-locale only, same reason
npm run report:homepage          # Phase 11 — writes reports/homepage-qa-report.{en,ar}.md, then a combined
                                  #   reports/homepage-qa-report.md executive summary via generate-combined-report.js
```

Read `agents/homepage-executor.md` and `agents/homepage-bug-analyzer.md` before re-running —
both record hard-won fixes to test-harness bugs (stale product-card indices, accessible-name
mismatches, a racy double-click, ungreppable global test titles, a first-party/third-party URL
classifier that false-matched analytics beacon query params, and — specific to going bilingual —
several controls whose accessible name/text is genuinely different per locale, verified live
before writing `utils/qaState.js`'s `PATTERNS` rather than assumed) that will resurface if undone.

Phase sequence and what owns each phase: `agents/homepage-explorer.md` (discover/map) →
`agents/homepage-test-planner.md` (plan) → `agents/homepage-executor.md` (execute) →
`agents/homepage-bug-analyzer.md` (bugs/retest/regression) → `agents/homepage-report.md` (report).

## Locale text differences — verified live, don't assume symmetry
Confirmed directly against production before writing any pattern-matching code (see
`utils/qaState.js` `PATTERNS`): "Add to Cart"'s aria-label, the post-add "View Cart" link text,
and the search placeholder ARE translated per locale. The "Add to wishlist" control and the hero
carousel's "Previous"/"Next" controls are NOT translated — both locales render literal English
text for those, which is itself a real localization-completeness finding, not a bug in the test
code. If the site's markup changes, re-verify live (e.g. via a quick browser check) rather than
guessing a translated string — an earlier pass building `homepage-discovery.spec.js`'s carousel
detection got tripped up exactly this way once already (dev-nx used "Previous slide"/"Next slide";
production uses bare "Previous"/"Next").

## State is the source of truth, not conversation memory
`state/<locale>/*.json` is generated, not hand-written (`homepage-map.json` by
`tests/homepage/homepage-discovery.spec.js`; the rest by `scripts/generate-test-plan.js`).
Regenerate rather than hand-edit, and don't summarize QA findings from a past conversation when
the state files disagree — they're authoritative. `requirements/*.<locale>.md` and
`specs/*.<locale>.md` are the human-readable mirrors of that same state — also generated, also
don't hand-edit.

## Safety
- Never point `tests/e2e`/`tests/api` at production, or `tests/homepage` at dev-nx, without a
  deliberate reason — see "Two different targets, on purpose" above.
- Never place a real order; never enter real payment details.
- The existing suite's login flow always sends a real OTP — the homepage bot's specs must stay a
  guest-session suite and not invoke it.
- `tests/homepage` runs against production. A finding there describes the *live* site at the time
  of that run — don't treat a stale report as still accurate without re-running.
