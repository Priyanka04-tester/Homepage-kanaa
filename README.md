# Kanaa Test Bot

Automated testing bot for the Kanaa e-commerce storefront at
`https://dev-nx.thekanaa.com/en-sa/`. Built with Node.js + Playwright
(E2E + API tests) and Artillery (load testing).

## Setup

```bash
npm install
npm run install:browsers
cp .env.example .env   # already pre-filled for this project; edit if needed
```

`.env` holds the test account (`priyanka@iamtechie.com`) and base URL.
It is git-ignored — never commit it.

## Running tests

```bash
npm run test:e2e       # UI flows: homepage, browse, cart, checkout (no login)
npm run test:e2e:full  # same, plus every test that logs in (sends a real OTP each time)
npm run test:api       # REST API checks (plp-products, session, health)
npm test               # test:e2e + test:api
npm run test:headed    # watch the browser while E2E tests run
npm run report         # open the last HTML report
```

Tests tagged `@otp` (in `login.spec.js` and `checkout.spec.js`) call the
real login flow, which always triggers a real OTP email/SMS first (see
"Known site quirks" below). They're excluded by default and only run
via `test:e2e:full` — don't put that variant on a tight schedule.

## Load testing

```bash
npm run load:light   # ramps to ~6 req/s against pages
npm run load:api     # ramps to ~8 req/s against the products API
```

Rates in `load/*.yml` are deliberately conservative because this is a
shared dev/staging environment. Raise `arrivalRate`/`rampTo` only after
checking with whoever owns `dev-nx.thekanaa.com` that it can take the
extra traffic.

## Scheduled monitoring

`monitoring/healthcheck.js` is a standalone script (not part of the
Playwright test runner) meant for a scheduler:

```bash
npm run monitor           # guest checks only: homepage + browse + add-to-cart
node monitoring/healthcheck.js --full   # also logs in
```

It exits `0` on success and `1` on failure, and appends to
`monitoring/logs/healthcheck.log`.

**Important:** logging in goes through the site's modal flow, which
always triggers a real OTP send (email/SMS) before falling back to the
password field — there is no way to log in without causing that side
effect. Run the `--full` variant sparingly (e.g. once a day), and run
the guest-only checks as often as you like (e.g. every 15–30 minutes).

To schedule on Windows, either:
- Use Task Scheduler (`schtasks /create ...`) to run
  `node monitoring/healthcheck.js` on your desired interval, or
- Use Claude's `scheduled-tasks` tool to run the same command from a
  Claude Code session on a cron schedule.

## Safety notes

- **No real orders are ever placed automatically.** `tests/e2e/checkout.spec.js`
  verifies the cart/order-summary reaches a payable state and confirms the
  "Pay Now" button is reachable, but it never clicks it or enters payment
  details. That step needs a real sandbox payment method and should stay
  a manual, human action.
- `RUN_FULL_CHECKOUT=true` in `.env` only unlocks the "Pay Now is
  reachable" assertion — it still stops short of submitting payment.
- Load tests target the `dev-nx` staging host only. Don't repoint
  `load/*.yml` at production without explicit sign-off.

## Known site quirks these tests work around

- The site has **no `data-testid`/`aria-label` attributes** on header
  icons (account, search). Selectors for those fall back to structural
  XPath in `utils/pages.js`. If the header markup changes, that's the
  one place to fix. Recommend asking the frontend team to add
  `data-testid` attributes to the account/search icons for more
  resilient automation.
- Product cards are located via their "Add to wishlist" button's
  accessible name (the one reliable accessible-name in the product grid),
  not via a dedicated product-card attribute.
- `/en-sa/signin/` (the NextAuth default sign-in page) always redirects
  home — it's not a usable direct login page. Login must go through the
  header's modal (account icon → email → "Log in with Password").
- The site A/B-tests two different cart routes via GrowthBook
  (`/en-sa/cart/` vs `/en-sa/new-cart/`) — assertions match either with
  `/\/(new-)?cart\//` rather than a fixed path.
- The first couple of cards in the `books-stationery.html` grid are not
  reliable for automated Add to Cart: slot 0 is tagged "Testing product
  promotion" (a QA placeholder), and slot 1 is a flash-sale item whose PDP
  button stays `disabled`/`aria-busy` pending a finance-eligibility check
  that can take a long time (or never resolve). `addFirstProductToCart` in
  `utils/pages.js` starts from slot 2 and retries a couple more slots.
- During development, repeated back-to-back Add to Cart flows against
  this dev environment became increasingly likely to fail the longer a
  test session ran (the PDP button would sit disabled indefinitely on
  every candidate product, not just the flaky ones above) — consistent
  with IP-based throttling on whatever stock/price/finance check backs
  that button. Plain page loads and the REST API endpoints were unaffected
  even at the same time. If cart tests that previously passed start
  failing partway through a run, suspect this before assuming the
  selectors broke — wait a few minutes and retry, and avoid running the
  full E2E suite back-to-back many times in a short window.

## Project layout

```
tests/e2e/       Playwright UI flows (homepage, login, cart, checkout)
tests/api/       Playwright API request tests
load/            Artillery load-test scenarios
monitoring/      Standalone scheduled health-check script
utils/           Shared config + page-object helpers
```
