/**
 * Shared read/write helpers for the homepage QA bot's state files.
 * Playwright runs with workers: 1 (see playwright.homepage.config.js) so these
 * read-modify-write calls are never concurrent — no locking needed.
 *
 * Locale-parametrized: the homepage bot tests the homepage in English AND Arabic
 * as two first-class, fully separate pipelines (own state/evidence/reports/IDs),
 * selected via the HOMEPAGE_LOCALE env var ("en" default, or "ar"). This also
 * targets a different site than the rest of the repo — HOMEPAGE_BASE_URL
 * (production, thekanaa.com) instead of BASE_URL (dev-nx, used by tests/e2e and
 * tests/api) — see CLAUDE.md "Two different targets, on purpose".
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const LOCALE = (process.env.HOMEPAGE_LOCALE || 'en').toLowerCase();
if (!['en', 'ar'].includes(LOCALE)) {
  throw new Error(`HOMEPAGE_LOCALE must be "en" or "ar", got "${LOCALE}"`);
}
const LOCALE_PATH = LOCALE === 'ar' ? '/ar-sa/' : '/en-sa/';
const ID_PREFIX = LOCALE.toUpperCase(); // "EN" | "AR" — used in generated IDs, e.g. TC-HOME-EN-001
const BASE_URL = process.env.HOMEPAGE_BASE_URL || 'https://thekanaa.com';

const STATE_DIR = path.join(ROOT, 'state', LOCALE);
const EVIDENCE_ROOT = path.join(ROOT, 'evidence', 'homepage', LOCALE);
fs.mkdirSync(STATE_DIR, { recursive: true });

/**
 * Locale-specific accessible-name/text patterns, verified live against production
 * on both /en-sa/ and /ar-sa/ before writing this — do not assume symmetry without
 * checking again if the site's markup changes:
 *  - "Add to Cart"'s aria-label IS translated (EN "Add to Cart" / AR "إضافة إلى
 *    السلة") and so is the post-add "View Cart" link text (AR "عرض السلة") and the
 *    search placeholder (AR "ما الذي تبحث عنه؟...").
 *  - "Add to wishlist" and the "Previous"/"Next" carousel controls are NOT
 *    translated — both locales use the literal English text/aria-label. That's
 *    itself a real localization-completeness finding (see bug filing), not a
 *    mistake in this pattern list — don't "fix" it into a fake Arabic pattern.
 */
const PATTERNS = {
  en: {
    addToCart: /add to cart/i,
    viewCartConfirmation: /view cart/i,
    searchPlaceholder: /what are you looking for/i,
    switchToOtherLocale: /عربي/,
    otherLocaleUrlHint: /\/ar-sa\//,
  },
  ar: {
    addToCart: /إضافة إلى السلة/,
    viewCartConfirmation: /عرض السلة/,
    searchPlaceholder: /ما الذي تبحث عنه/,
    switchToOtherLocale: /^EN$/,
    otherLocaleUrlHint: /\/en-sa\//,
  },
};
const P = PATTERNS[LOCALE];
// Constant across both locales (untranslated on the site itself) — not part of PATTERNS.
const WISHLIST_PATTERN = /wishlist/i;
const PREV_CONTROL_PATTERN = /previous/i;
const NEXT_CONTROL_PATTERN = /next/i;

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(STATE_DIR, name), 'utf-8'));
}
function saveJson(name, data) {
  fs.writeFileSync(path.join(STATE_DIR, name), JSON.stringify(data, null, 2), 'utf-8');
}

function loadHomepageMap() {
  return loadJson('homepage-map.json');
}

/** Find the generated test case for a section + feature category (e.g. "links", "carousel"). */
function findTestCase(sectionId, featureSuffix) {
  const testCases = loadJson('test-cases.json');
  const tc = testCases.find((t) => t.sectionId === sectionId && t.feature.endsWith(featureSuffix));
  if (!tc) throw new Error(`No test case found for sectionId=${sectionId} feature ending in "${featureSuffix}" (locale=${LOCALE}) — did state/${LOCALE}/test-cases.json change? Re-run node scripts/generate-test-plan.js.`);
  return tc;
}

/** Find a cross-cutting global test case (sectionId === "HOME-GLOBAL"). */
function findGlobalTestCase(featureSuffix) {
  const testCases = loadJson('test-cases.json');
  const tc = testCases.find((t) => t.sectionId === 'HOME-GLOBAL' && t.feature.endsWith(featureSuffix));
  if (!tc) throw new Error(`No global test case found for feature ending in "${featureSuffix}" (locale=${LOCALE}).`);
  return tc;
}

function nextExecId() {
  const executions = loadJson('executions.json');
  const max = executions.reduce((m, e) => Math.max(m, parseInt(e.id.split('-')[1], 10) || 0), 0);
  return `EXEC-${ID_PREFIX}-${String(max + 1).padStart(4, '0')}`;
}

/**
 * Record one execution against one generated test case, and mirror the result
 * onto that test case's row in test-cases.json. One execution per playwright
 * test() block, even when that block loops over many concrete elements
 * internally (see agents/homepage-executor.md on why).
 */
function recordExecution({ testCaseId, status, browser, viewport, notes, evidencePath, actualResult }) {
  const executions = loadJson('executions.json');
  const execId = nextExecId();
  const now = new Date().toISOString();
  executions.push({ id: execId, testCaseId, status, browser, viewport, startedAt: now, finishedAt: now, evidencePath: evidencePath || null, notes: notes || null });
  saveJson('executions.json', executions);

  const testCases = loadJson('test-cases.json');
  const idx = testCases.findIndex((t) => t.id === testCaseId);
  if (idx !== -1) {
    testCases[idx].status = status;
    testCases[idx].actualResult = actualResult || notes || null;
    testCases[idx].browser = browser;
    testCases[idx].viewport = viewport;
    testCases[idx].executionId = execId;
    testCases[idx].evidencePath = evidencePath || testCases[idx].evidencePath;
    saveJson('test-cases.json', testCases);
  }
  return execId;
}

/**
 * True host-based first-party check. A naive `/thekanaa\.com/.test(url)` substring
 * match is unsafe: third-party analytics beacons (Google/doubleclick/etc.) carry the
 * page's own URL as a url-encoded *query parameter value* (e.g. `dl=https%3A%2F%2F
 * thekanaa.com%2Fen-sa%2F` for document-location tracking), which contains the
 * substring "thekanaa.com" despite the request host being google.com. Parse and check
 * the actual hostname instead.
 */
function isFirstPartyUrl(url) {
  try {
    return new URL(url).hostname.endsWith('thekanaa.com');
  } catch {
    return false;
  }
}

function evidenceDir(testCaseId) {
  const dir = path.join(EVIDENCE_ROOT, testCaseId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

module.exports = {
  LOCALE, LOCALE_PATH, ID_PREFIX, BASE_URL, STATE_DIR, EVIDENCE_ROOT,
  PATTERNS: P, WISHLIST_PATTERN, PREV_CONTROL_PATTERN, NEXT_CONTROL_PATTERN,
  loadHomepageMap, findTestCase, findGlobalTestCase, recordExecution, evidenceDir, isFirstPartyUrl, loadJson, saveJson,
};
