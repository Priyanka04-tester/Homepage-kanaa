# kanaa-test-bot

Two things live in this repo:
1. **The original hand-written E2E/API/load/monitoring suite** (`tests/e2e`, `tests/api`,
   `load/`, `monitoring/`) — see `README.md`.
2. **The autonomous homepage QA bot** (`agents/`, `state/`, `evidence/homepage/`,
   `requirements/`, `specs/`, `tests/homepage/`) — an addition on top of (1), reusing its
   `playwright.config.js`, `.env`, and `utils/pages.js` selectors/quirks rather than
   duplicating them in a separate project.

## Homepage QA bot — current status
**A full cycle has run end to end**: discovery -> plan -> execution (chromium fully, webkit
smoke, firefox blocked locally) -> bug filing (with 2 Major bugs root-caused down to their actual
infra/backend cause) -> report -> retest tooling built and validated. Current numbers: 70
generated test cases, 54 PASS / 15 FAIL / 1 NOT_EXECUTED, 8 filed bugs, 0 fixed yet (both Major
bugs are infra/backend-side — see `state/bugs.json` for the confirmed root cause and recommended
fix on each). See `reports/homepage-qa-report.md` for the full breakdown.

Re-run the full cycle with:
```bash
npm run discover:homepage   # Phase 1-3
npm run plan:homepage       # Phase 4
npm run test:homepage       # Phase 5-6 (chromium)
npm run test:homepage:browsers  # Phase 5-6 cross-browser smoke (needs firefox/webkit installed)
npm run bugs:homepage       # Phase 8 — re-derives state/bugs.json from the CURRENT state/test-cases.json;
                             #   review scripts/file-bugs.js first, it's a curated pass, not fully automatic
npm run retest:homepage -- <BUG-ID> [--browser=x | --manual FIXED|NOT_FIXED "note"]  # Phase 9, one bug
npm run regress:homepage    # Phase 10 — every OPEN/REOPENED bug's traced test cases, in one pass
npm run report:homepage     # Phase 11
```
Read `agents/homepage-executor.md` and `agents/homepage-bug-analyzer.md` before re-running —
both record hard-won fixes to test-harness bugs (stale product-card indices, accessible-name
mismatches, a racy double-click, ungreppable global test titles, a first-party/third-party URL
classifier that false-matched analytics beacon query params) that will resurface if undone.

Phase sequence and what owns each phase: `agents/homepage-explorer.md` (discover/map) →
`agents/homepage-test-planner.md` (plan) → `agents/homepage-executor.md` (execute) →
`agents/homepage-bug-analyzer.md` (bugs/retest/regression) → `agents/homepage-report.md` (report).

## State is the source of truth, not conversation memory
`state/*.json` is generated, not hand-written (`state/homepage-map.json` by
`tests/homepage/homepage-discovery.spec.js`; the rest by `scripts/generate-test-plan.js`).
Regenerate rather than hand-edit, and don't summarize QA findings from a past conversation when
the state files disagree — they're authoritative.

## Regenerating discovery + plan
```bash
npx playwright test tests/homepage/homepage-discovery.spec.js --project=chromium
node scripts/generate-test-plan.js
```
Site-specific quirks that make the discovery script non-obvious (non-semantic markup, the real
scroll container, why sections aren't just "every heading") are documented at the top of
`agents/homepage-explorer.md` — read that before changing the discovery spec.

## Safety (applies to both halves of this repo)
- Target is `dev-nx.thekanaa.com`, a shared dev/staging environment — never point any of this at
  production without explicit sign-off, and keep `workers: 1` in `playwright.config.js`.
- Never place a real order; never enter real payment details.
- The existing suite's login flow always sends a real OTP — the homepage bot's specs must stay a
  guest-session suite and not invoke it.
