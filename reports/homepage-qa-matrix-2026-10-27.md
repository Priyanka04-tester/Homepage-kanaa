# Homepage QA matrix run: 2026-10-27

Target: https://thekanaa.com/en-sa/ (EN) and https://thekanaa.com/ar-sa/ (AR), live site.
Firefox is not in this run: it cannot launch on this Windows machine and is covered by the Linux CI job.
Each run also has a per-run test-case report (CSV and XLSX) in `state/en/` or `state/ar/`.

## Totals

| Run | Tests | PASS | FAIL | Report |
|---|---|---|---|---|
| EN, Chromium (JS suite) | 59 | 52 | 7 | `state/en/run-matrix-2026-10-27-en-chromium.xlsx` |
| EN, WebKit (JS suite) | 59 | 52 | 7 | `state/en/run-matrix-2026-10-27-en-webkit.xlsx` |
| AR, Chromium (JS suite) | 59 | 53 | 6 | `state/ar/run-matrix-2026-10-27-ar-chromium.xlsx` |
| AR, WebKit (JS suite) | 59 | 48 | 11 | `state/ar/run-matrix-2026-10-27-ar-webkit.xlsx` |
| TypeScript suite, 8 projects (EN) | 552 | 537 | 15 | `state/en/run-matrix-2026-10-27-ts-8-projects.xlsx` |

PASS includes tests marked as expected failures (`test.fail`) that failed as expected. Those rows say "known defect (expected failure)" in the report.

## Failures by run

### EN, Chromium
- FEAT-002 account modal: timed out after 240s. Click target not located. INCONCLUSIVE.
- TC-HOME-EN-064 rapid-click robustness: no Add to Cart button found. Automation gap, not a site result.
- TC-HOME-EN-082 HOME-SEC-EN-002 product cards: smoke Add to Cart click timed out (5s).
- TC-HOME-EN-070 HOME-SEC-EN-004 "Upgrade to iPhone 18": product cards not found live.
- TC-HOME-EN-024 HOME-SEC-EN-006 "Deal Of The Week": product cards not found live.
- TC-HOME-EN-003 HOME-SEC-EN-001 carousel: Next click timed out (15s).
- TC-HOME-EN-066 language switcher: URL stayed on `/en-sa/` after switching to Arabic.

### EN, WebKit
- FEAT-004 search: the typed value "lego" did not persist in the input (WebKit).
- TC-HOME-EN-064, TC-HOME-EN-082, TC-HOME-EN-003: same as Chromium.
- TC-HOME-EN-070 and TC-HOME-EN-090 (HOME-SEC-EN-004, HOME-SEC-EN-005): product-card test timed out (60s).
- HOME-IMG-SWEEP: broken images site-wide, including `/assets/images/optimized/sa-flag.png` and `media.thekanaa.com` images. Needs a rerun to confirm before filing.

### AR, Chromium
- FEAT-002 account modal: timed out after 240s. INCONCLUSIVE.
- TC-HOME-AR-064 rapid-click: no Add to Cart button found (automation gap).
- TC-HOME-AR-070 HOME-SEC-AR-002: smoke Add to Cart click timed out.
- TC-HOME-AR-078 HOME-SEC-AR-004 and TC-HOME-AR-082 HOME-SEC-AR-005: product cards not found live.
- TC-HOME-AR-003 HOME-SEC-AR-001 carousel: Next click timed out (15s).

### AR, WebKit
- FEAT-002 account modal: no sign-in modal opened from any header icon candidate. INCONCLUSIVE.
- FEAT-004 search: typed value did not persist (WebKit).
- FEAT-007: sections in the discovery map are no longer on the page. Content change, to be confirmed with the product owner. The list is in the test output.
- TC-HOME-AR-049 HOME-SEC-AR-020 "every link resolves": `/ar-sa/create-account/?redirect=/ar-sa/account/my-orders` returned 502. Needs a rerun to confirm.
- TC-HOME-AR-064, TC-HOME-AR-070: as above.
- TC-HOME-AR-078 HOME-SEC-AR-004: product image naturalWidth=0 after load (broken image).
- TC-HOME-AR-024 HOME-SEC-AR-006: product-card test timed out (60s).
- TC-HOME-AR-028 HOME-SEC-AR-007: product cards not found live.
- TC-HOME-AR-003: carousel Next click timed out.
- HOME-IMG-SWEEP: broken images, as in EN WebKit.

### TypeScript suite (8 projects)
- Discover complete homepage structure: timeouts on webkit-desktop-1440 (60s), chromium-tablet-1024, chromium-mobile-390 and chromium-mobile-412 (waitForLoadState 30s). Likely load timing on the live site; not yet confirmed as a defect.
- TC-HOME-001 header controls and logo: URL assertion failed on chromium-desktop-1440, webkit-desktop-1440 and chromium-mobile-393.
- TC-HOME-051 offline reload: page.goto timed out on chromium-mobile-393.
- TC-HOME-024 product card images: element detached from DOM during scroll (webkit-desktop-1440).
- TC-HOME-054 core load: navigation interrupted by another navigation (webkit-desktop-1440).
- TC-HOME-060 no link drops the locale: page.goto timed out on webkit-desktop-1440 and chromium-mobile-390.
- TC-HOME-061 and TC-HOME-017 hero carousel loaded image: image not loaded (webkit-desktop-1440).
- TC-HOME-031 section headings do not overlap: overlapping headings on chromium-tablet-768. Visual defect candidate; needs evidence review.

## Status of key items

- Confirmed passing across all four JS runs: header, announcement bar, category hover, mobile cart link, wishlist controls, language switch markup (see per-run reports).
- Still failing: FEAT-002 account modal (INCONCLUSIVE, automation cannot reliably click the account icon), rapid-click check (no Add to Cart button found, automation gap), and the product-card and carousel timeouts listed above.
- Not yet confirmed as defects, need a rerun before filing bugs: HOME-IMG-SWEEP broken images, the 502 on the AR create-account link, TC-HOME-031 overlapping headings, the TS discovery timeouts, and FEAT-007 section mismatch (AR WebKit).
- UAE storefront: BLOCKED (not live).
- Email delivery: not done (no SMTP or email-API credentials).
