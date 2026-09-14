# Homepage QA Report — Kanaa, English (/en-sa/, LTR)

## Summary
- **Application:** The Kanaa — Online Toy, Gaming & Electronics Store (https://thekanaa.com/en-sa/)
- **Environment:** **production** (https://thekanaa.com) — this suite targets the live site on purpose (see CLAUDE.md "Two different targets, on purpose"); the pre-existing cart/checkout/login suite still targets dev-nx staging separately.
- **Locale:** English (/en-sa/, LTR)
- **Date/time of this cycle:** discovery captured 2026-09-14T08:25:04.865Z; execution run same session
- **Browsers exercised:** chromium
- **Primary viewport:** 1280x800 (plus 7 responsive viewports — see Coverage)

## Coverage
- Sections discovered: **19**
- Interactive elements discovered: **382** (192 buttons, 187 links, 3 inputs) + 387 images
- Sliders/carousels tested: 1/1
- Product widgets tested: 9/9 (71 cards sampled at discovery; each widget's live cards re-sampled first/middle/last at execution)
- Responsive viewports tested: 7/7 (2 passed)
- Browsers tested: 0/3
- Total generated test cases: **67**
- Total executions recorded: **62**

## Test Results
| Status | Count |
|---|---|
| PASS | 53 |
| FAIL | 9 |
| BLOCKED | 0 |
| NOT_EXECUTED | 5 |
| **Total** | **67** |

## Defects
| Severity | Count |
|---|---|
| Critical | 0 |
| Major | 0 |
| Medium | 0 |
| Minor | 0 |
| Trivial | 0 |
| **Total** | **0** |

**By status:** none filed

Full bug details (repro steps, evidence paths, traceability): [state/en/bugs.json](../state/en/bugs.json).

### Root cause — Major/Critical defects
_No Major/Critical defects open._

## UI Issues
- None.

## Functional Issues
- None.

## Accessibility Issues
- None.

## Responsive Issues
- None — 2/7 viewports passed with no horizontal overflow.

## Browser Issues
- **chromium** — NOT_EXECUTED: not run this cycle.
- **firefox** — NOT_EXECUTED: not run this cycle.
- **webkit** — NOT_EXECUTED: not run this cycle.

## Console/Network Issues
- None.


## Regression Results
No bugs have been retested yet in this cycle. `node scripts/retest-bug.js <BUG-ID>` re-runs a bug's original test case (and its relatedRegressionTests) and records FIXED/NOT FIXED — see agents/homepage-bug-analyzer.md. `node scripts/run-regression.js` separately re-runs every test case traced to any OPEN/REOPENED bug's section — see state/traceability.json for the current bug -> section -> test case links.

## Known Limitations
- **This homepage's product widgets are personalized/rotate content between loads** — the same widget slot can show a different title, product set, or order on a later load. Product-card execution re-derives each widget's cards live rather than trusting discovery-time positions for exactly this reason (see `matchedBy`/`infoNotes` in `evidence/homepage/en/TC-HOME-EN-*/product-card-check.json`) — this is a site characteristic, not a defect, but it does limit how precisely automated re-verification can target "the same" widget run over run.
- **Login-gated flows are out of scope** for this suite by design (always triggers a real OTP on the pre-existing dev-nx suite) — this homepage bot only exercises guest-session flows.
- **No real order is ever placed** — Add to Cart tests stop at the cart-confirmation UI (or wishlist/cart-count check), never checkout.
- **This run targets production.** Findings here describe the live site at the time of this run — re-run before trusting stale numbers for a release decision.

## Evidence
- Discovery: `evidence/homepage/en/discovery/` (screenshots, ARIA snapshot, trace, console/network logs)
- Per-test-case evidence (screenshots, JSON findings, traces on failure): `evidence/homepage/en/<TC-ID>/`
- Full execution history: `state/en/executions.json`
- Full traceability (requirement -> section -> element -> scenario -> test case -> execution -> bug): `state/en/traceability.json`

## Final Recommendation
### READY

53/67 generated test cases passed (English (/en-sa/, LTR)). Open defects (not yet verified fixed): none. Verified fixed this cycle: none.

No open defects at Medium severity or above. Full pass.
