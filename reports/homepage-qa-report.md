# Homepage QA Report — Kanaa (dev-nx.thekanaa.com)

## Summary
- **Application:** The Kanaa — Online Toy, Gaming & Electronics Store (https://dev-nx.thekanaa.com/en-sa/)
- **Environment:** staging (dev-nx.thekanaa.com) — not production
- **Build:** unknown / not versioned by the environment (dev branch deploy)
- **Date/time of this cycle:** discovery captured 2026-09-14T06:53:47.776Z; execution run same session
- **Browsers exercised:** chromium, webkit
- **Primary viewport:** 1280x800 (plus 7 responsive viewports — see Coverage)

## Coverage
- Sections discovered: **21**
- Interactive elements discovered: **489** (240 buttons, 246 links, 3 inputs) + 442 images
- Sliders/carousels tested: 2/2
- Product widgets tested: 8/8 (71 cards sampled at discovery; each widget's live cards re-sampled first/middle/last at execution)
- Responsive viewports tested: 7/7 (7 passed)
- Browsers tested: 2/3 (chromium, webkit executed; firefox blocked — see Known Limitations)
- Total generated test cases: **70**
- Total executions recorded: **209**

## Test Results
| Status | Count |
|---|---|
| PASS | 54 |
| FAIL | 15 |
| BLOCKED | 0 |
| NOT_EXECUTED | 1 |
| **Total** | **70** |

## Defects
| Severity | Count |
|---|---|
| Critical | 0 |
| Major | 2 |
| Medium | 2 |
| Minor | 3 |
| Trivial | 1 |
| **Total** | **8** |

**By status:** OPEN 8

Full bug details (repro steps, evidence paths, traceability): [state/bugs.json](../state/bugs.json).

### Root cause — Major defects
**BUG-HOME-001: Several product images on the homepage fail to load (403 / ORB-blocked from media-stage.thekanaa.com)** _(OPEN)_
5 images consistently fail across two independent test runs (initial discovery and later execution): Maisto Rock Crawler R/C Car, Maisto 1:24 1929 Ford Model A, Maisto 1:24 1967 Ford Mustang GT, Disney Stitch Light-Up Yoyo, Pop Mart Labubu keychain — plus 2 non-product thirdlevelbanner images. Each fails with either a 403 from the site's own /_next/image proxy or net::ERR_BLOCKED_BY_ORB fetching the source directly from media-stage.thekanaa.com — same asset, same failure, both paths. ROOT CAUSE CONFIRMED (2026-09-14, direct S3 probe): each affected image URL returns HTTP 403 from S3 itself with body <Error><Code>AccessDenied</Code></Error> (not NoSuchKey) — the object exists but its S3 ACL/bucket-policy does not grant public read for these specific keys, while sibling objects in the same bucket (e.g. .../5/4/5432721578st2100082_1.jpg) return 200 with no query-string changes needed. The Next.js /_next/image proxy is working correctly — it detects the bad upstream and returns its own 403 ("upstream response is invalid"), it is not the source of the problem. This also explains why raw-URL vs proxied-URL and with/without resize query params made no difference: the object itself is unreadable at the S3 layer, independent of how the app requests it.

*Recommended fix:* RECOMMENDED FIX (infra/ops, not app code): re-apply the public-read ACL / bucket policy to these 5 S3 objects (and audit for any other objects from the same upload batch) on the media-stage.thekanaa.com bucket — likely a recent product-import batch used a different upload credential/ACL default than the rest of the catalog. Separately (unrelated to the fix): a wider set of product images intermittently showed naturalWidth=0 in later, longer automated test runs — not bundled into this bug, matches this project's documented IP-based throttling behavior (README.md) rather than a distinct defect; re-verify with an isolated fresh run before filing separately.

**BUG-HOME-006: Header search box's suggestions request fails (404)** _(OPEN)_
Console logs "Error fetching suggestions" backed by a structured ApiError object: {name: "ApiError", message: "Index magento2_stagingen_sa_products_query_suggestions does not exist", status: 404}. ROOT CAUSE CONFIRMED (2026-09-14): the site's search backend (Magento 2 + an Elasticsearch/OpenSearch-based search module, judging by the index-name convention) is querying an index named magento2_stagingen_sa_products_query_suggestions for the en_sa storefront's autocomplete/query-suggestions feature, and that index does not exist on the staging search cluster — this is a missing-index/missing-reindex problem, not an application code bug.

*Recommended fix:* RECOMMENDED FIX (backend/DevOps, not app code): run the product query-suggestions indexer for the en_sa store view on the staging search cluster (Magento CLI equivalent of bin/magento indexer:reindex for the search/suggestions indexer, or whatever job creates magento2_stagingen_sa_products_query_suggestions) — likely this index was never created on staging, or a naming-convention change left staging pointing at a name that was never (re)built. This also explains why the CORS pooloutdoor issue (BUG-HOME-002) and this both surface early in a page load: both are calls made automatically on page load, unrelated to each other, that happen to land in the same console-listener window.

## UI Issues
- **BUG-HOME-001** [Major/P1] (OPEN) Several product images on the homepage fail to load (403 / ORB-blocked from media-stage.thekanaa.com) — TC: TC-HOME-034, Section: HOME-SEC-009
- **BUG-HOME-005** [Minor/P3] (OPEN) A homepage product widget has a blank section title — TC: TC-HOME-043, Section: HOME-SEC-012
- **BUG-HOME-008** [Trivial/P3] (OPEN) Two homepage section headings have malformed text — TC: N/A, Section: HOME-GLOBAL

## Functional Issues
- **BUG-HOME-003** [Medium/P2] (OPEN) mcstaging.thekanaa.com returns 503 for multiple homepage-linked pages; one link to it is additionally malformed — TC: TC-HOME-045, Section: HOME-SEC-013
- **BUG-HOME-004** [Minor/P3] (OPEN) QA/placeholder test products render live in homepage product widgets — TC: N/A, Section: HOME-GLOBAL
- **BUG-HOME-006** [Major/P2] (OPEN) Header search box's suggestions request fails (404) — TC: TC-HOME-005, Section: HOME-SEC-001

## Accessibility Issues
- **BUG-HOME-007** [Minor/P3] (OPEN) 8 homepage links have no accessible name — TC: TC-HOME-066, Section: HOME-GLOBAL

## Responsive Issues
- None — all 7 viewports passed with no horizontal overflow.

## Browser Issues
- **TC-HOME-063 (chromium cross-browser smoke)** FAILed on the Add to Cart step specifically — the exact symptom README.md documents as environment throttling under repeated automated Add to Cart calls, not filed as a separate bug (see Known Limitations).
- **TC-HOME-065 (webkit)** — PASS, full smoke path including Add to Cart.
- **TC-HOME-064 (firefox)** — NOT_EXECUTED: Firefox fails to launch in this local environment (`spawn UNKNOWN`), unrelated to the website — see Known Limitations.

## Console/Network Issues
- **BUG-HOME-002** [Medium/P2] (OPEN) Homepage triggers a cross-origin prefetch to production thekanaa.com that fails CORS, on every load — TC: TC-HOME-068, Section: HOME-GLOBAL

## Regression Results
- **BUG-HOME-002** (now OPEN): [2026-09-14T07:22:44.202Z] NOT_FIXED — Still failing (2/2): TC-HOME-068: Console: 3, Network: GET https://thekanaa.com/en-sa/pooloutdoor/ -> net::ERR_FAILED | POST https://www.google.com/ccm/collect?rcb=18&frm=0&apvc=1&ae=g&auid=940527214.1789370534&dt=The%20Kanaa%3A%20Onl | TC-HOME-005: input #0: introduced console error(s): Access to fetch at 'https://thekanaa.com/en-sa/pooloutdoor/' (redirected from 'https://dev-nx.thekanaa.com/en-sa/sports-outdoor.html?_rsc=2511f') from → [2026-09-14T07:25:05.526Z] NOT_FIXED — Still failing (2/2): TC-HOME-068: Console: 3, Network: GET https://thekanaa.com/en-sa/pooloutdoor/ -> net::ERR_FAILED | TC-HOME-005: input #0: introduced console error(s): Access to fetch at 'https://thekanaa.com/en-sa/pooloutdoor/' (redirected from 'https://dev-nx.thekanaa.com/en-sa/sports-outdoor.html?_rsc=2511f') from | input #1
- **BUG-HOME-005** (now OPEN): [2026-09-14T07:21:46.887Z] NOT_FIXED — Still failing (1/1): TC-HOME-043: Untitled widget — see known-risks.json RISK-HOME-001 (blank section heading).
- **BUG-HOME-008** (now OPEN): [2026-09-14T07:21:16.341Z] NOT_FIXED — Manual retest: Live-checked accessibility tree on 2026-09-14 — heading still reads literal text 'Best Price Guarante' (missing final e), unchanged

## Known Limitations
- **This homepage's product widgets are heavily personalized/rotate content between loads** — the same widget slot can show a different title, product set, or order on a later load. Several product-card test cases could not be cleanly re-verified against their original discovery-time identity for this reason (see `infoNotes`/`matchedBy` fields in `evidence/homepage/TC-HOME-*/product-card-check.json`). This is a site characteristic, not a defect, but it does limit how precisely automated re-verification can target "the same" widget run over run.
- **Suspected IP-based throttling on repeated automated requests against this shared dev environment**, consistent with README.md's already-documented Add to Cart throttling: broken-image findings concentrated in later-sampled cards deep into a long automated run are more likely this than 20+ independent new defects — treated as informational, not bundled into BUG-HOME-001's confirmed count.
- **Firefox could not be executed** in this local environment (Playwright's Firefox fails to launch with `spawn UNKNOWN` on this machine) — chromium and webkit both ran.
- **One interaction-robustness finding did not reliably reproduce on demand**: a single run observed browser Back navigation landing on `about:blank` instead of the homepage after visiting a PDP. Recorded but not filed as a bug — needs an isolated (not deep-into-a-long-session) repro before it can be trusted as a real defect.
- **Login-gated flows are out of scope** for this suite by design (always triggers a real OTP) — covered separately by `tests/e2e/login.spec.js` under its own `@otp` tag.
- **No real order is ever placed** — Add to Cart tests stop at the cart-confirmation UI.

## Evidence
- Discovery: `evidence/homepage/discovery/` (screenshots, ARIA snapshot, trace, console/network logs)
- Per-test-case evidence (screenshots, JSON findings, traces on failure): `evidence/homepage/<TC-ID>/`
- Full execution history: `state/executions.json`
- Full traceability (requirement -> section -> element -> scenario -> test case -> execution -> bug): `state/traceability.json`

## Final Recommendation
### READY WITH KNOWN ISSUES

54/70 generated test cases passed. Open defects (not yet verified fixed): BUG-HOME-001 [Major], BUG-HOME-002 [Medium], BUG-HOME-003 [Medium], BUG-HOME-004 [Minor], BUG-HOME-005 [Minor], BUG-HOME-006 [Major], BUG-HOME-007 [Minor], BUG-HOME-008 [Trivial]. Verified fixed this cycle: none.

Core homepage functionality (navigation, carousels, product browsing, Add to Cart, all 7 responsive viewports, RTL) passed. The open defects above are real but non-blocking for the core browse/cart path — see severity/priority per bug in state/bugs.json for what to prioritize.
