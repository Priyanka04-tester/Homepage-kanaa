# Homepage Bug Analyzer

Owns **Phase 7-9 (ANALYZE FAILURES → CREATE BUGS → RETEST)** plus regression (Phase 28).
Bug filing is built as a curated script (`scripts/file-bugs.js`, run via `npm run bugs:homepage`)
rather than a fully mechanical "every FAIL becomes a bug" pass — see "Not every FAIL is a bug"
below for why that distinction mattered in practice. Regression is `scripts/run-regression.js`
(`npm run regress:homepage`).

## Not every FAIL is a bug — this was the main lesson of the first cycle
Of the first run's 26 failing test cases, only a handful became actual `BUG-HOME-*` entries.
Before filing anything, check whether a failure is actually a **test-harness artifact**
(see the "Hard-won fixes" list in `homepage-executor.md`) or **environment noise** specific to
this shared dev box — both are real categories here, not hypothetical:
- A failure that only reproduces once, deep into a long sequential run, and matches the shape of
  README.md's documented Add-to-Cart/repeated-request throttling is noise, not a bug — note it
  in the report's "Known Limitations," don't file it.
- A failure caused by this homepage's own content personalization (a widget's title or product
  set differs from what discovery recorded) is a site *characteristic*, not a defect.
- Re-run a suspicious failure in isolation (not as part of the full 50+-test sequential suite)
  before trusting it, where practical — a clean, isolated repro is much stronger evidence than
  one buried in a long run.
When in doubt, a live check in an actual browser (not just an HTTP request) settled at least one
real case in the first cycle — a malformed `href` that an HTTP client parsed leniently but a real
browser resolved to a broken path. Don't assume an HTTP-only check tells the whole story.

## When a bug is (and isn't) filed
A `BUG-HOME-*` entry in `state/bugs.json` requires, per spec section 24:
1. An actually-observed failure (a `FAIL` execution, not a discovery-time heuristic guess).
2. A known expected behavior to compare against (requirement/scenario text, or plainly-broken
   behavior like a 404 or a broken image).
3. Reproducibility, or evidence sufficient without re-running.
4. Not a one-off network/environment blip — rerun once before filing.

`state/known-risks.json` (`RISK-HOME-*`, written by discovery) is the starting worklist, not a
bug list — each risk needs its own execution + evidence before promotion to `BUG-HOME-*`. Two
are already strong candidates given the evidence discovery already captured:
- The 15 broken images correlate 1:1 with first-party `403`/`ERR_BLOCKED_BY_ORB` network
  failures on `media-stage.thekanaa.com` and the `/_next/image` proxy for the *same* asset URLs
  (see `specs/homepage-test-plan.md` → Network failures) — likely one root cause (an image-CDN
  CORS/content-type issue), not 15 independent bugs. File as one bug covering the pattern, with
  every affected product listed, not 15 near-duplicates (spec section 20: don't duplicate bugs
  for one root cause).
- Two placeholder/test products ("Testing product for label", "Rental Test Product") rendering
  in live homepage widgets — a content/catalog-hygiene bug, not a code bug; still worth filing so
  it's tracked and traceable to the widget it appeared in.

## Every bug must carry
All fields listed in spec section 24 (IDs, environment, browser, viewport, repro steps, expected
vs actual, severity, priority, reproducibility, evidence paths, `relatedRegressionTests`) and a
non-empty `traceability.json` link back to its `TC-HOME-*`. Severity/priority are a judgment call
per bug, not a default — don't mark everything Critical/P0 (spec section 24 explicitly warns
against this).

## Retest
Built: `scripts/retest-bug.js` (`npm run retest:homepage -- <BUG-ID> [flags]`). When a bug's
status moves toward "fixed" (external signal, e.g. a dev says so), this re-runs the bug's own
`testCaseId` plus every `relatedRegressionTests` entry, and records `FIXED`/`NOT_FIXED` into the
bug's `retestHistory` (appended, never overwritten — spec section 27's "preserve the original bug
and add new evidence" applies to a NOT_FIXED result too). Status transitions:
`OPEN --retest FIXED--> FIXED`, `FIXED --retest NOT_FIXED--> REOPENED`. Never trust a "should be
fixed now" claim without running this.
- `node scripts/retest-bug.js BUG-HOME-001` — automated: re-runs via `--grep`, matching against
  a test's `"TC-HOME-NNN: ..."` title. A "Cross-browser — *" bug is instead routed to
  `playwright.homepage.config.js` with the right `--project`.
- `node scripts/retest-bug.js BUG-HOME-008 --manual FIXED "how you actually checked it"` — for a
  bug with no `testCaseId` (a content/copy bug with no automated check) — the note is required,
  not optional, because "I looked at it" isn't evidence on its own.
- Global test cases (accessibility, RTL, console/network, negative/edge, performance) needed a
  fix to actually be grep-able: their `test()` titles didn't originally include the `TC-HOME-*`
  ID (only per-section tests did), so `--grep` silently matched nothing for them. Fixed by
  hoisting each `findGlobalTestCase(...)` call to module scope and interpolating `tc.id` into the
  title, same pattern the per-section specs already used. If a future global test case is added
  without its ID in the title, retest/regression will silently no-op for it — watch for that.
- Validating this tool for real (retesting BUG-HOME-002, still open) also caught a real harness
  bug: the first-party/third-party URL classifier used a naive `/thekanaa\.com/.test(url)`
  substring match, which false-matched Google Analytics beacon URLs carrying the page's own URL
  as a url-encoded query parameter (`dl=https%3A%2F%2Fdev-nx.thekanaa.com...`). Fixed as a shared
  `isFirstPartyUrl()` helper in `utils/qaState.js` that checks the actual parsed hostname —
  use it (not a fresh regex) anywhere first-party/third-party matters.

## Regression mapping
Built: `scripts/run-regression.js` (`npm run regress:homepage`) — re-runs every test case traced
(via `state/traceability.json`'s `sectionId`) to any bug currently `OPEN` or `REOPENED`, for when
a broader component change might affect more than one bug's area at once (as opposed to
`retest-bug.js`, which is scoped to one specific bug). Conceptual mapping this is built on: header
change → nav/search/login/wishlist/cart tests; hero change → carousel/CTA/responsive/image tests;
product-widget change → product-card/wishlist/add-to-cart/navigation tests.
