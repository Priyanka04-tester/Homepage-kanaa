/**
 * Common PLP test scenarios and patterns
 */

export const PLPTestScenarios = {
  NAVIGATION: {
    BREADCRUMB: 'Navigate using breadcrumb',
    BACK_BUTTON: 'Navigate back using browser back button',
    FORWARD_BUTTON: 'Navigate forward using browser forward button',
    HEADER_LINK: 'Navigate using header category link',
    MENU_LINK: 'Navigate using menu',
  },

  FILTERING: {
    SINGLE_FILTER: 'Apply single filter value',
    MULTIPLE_FILTERS_SAME_GROUP: 'Apply multiple values from same filter group',
    MULTIPLE_FILTERS_DIFFERENT_GROUPS: 'Apply filters from different groups',
    FILTER_PERSISTENCE: 'Verify filters persist on page refresh',
    FILTER_URL_STATE: 'Verify filters in URL parameters',
    CLEAR_SINGLE_FILTER: 'Clear single filter',
    CLEAR_ALL_FILTERS: 'Clear all filters',
    NO_RESULTS_COMBINATION: 'Apply filter combination with no results',
    INVALID_FILTER_COMBINATION: 'Apply invalid filter combination',
  },

  SORTING: {
    DEFAULT: 'Sort by default option',
    PRICE_LOW_TO_HIGH: 'Sort by price low to high',
    PRICE_HIGH_TO_LOW: 'Sort by price high to low',
    NEWEST: 'Sort by newest',
    BESTSELLER: 'Sort by bestseller',
    RELEVANCE: 'Sort by relevance',
    CUSTOM_SORT: 'Apply custom sort option',
    SORT_PERSISTENCE: 'Verify sort persists on page refresh',
  },

  PAGINATION: {
    NEXT_PAGE: 'Navigate to next page',
    PREVIOUS_PAGE: 'Navigate to previous page',
    PAGE_NUMBER: 'Jump to specific page number',
    LAST_PAGE: 'Navigate to last page',
    ITEMS_PER_PAGE: 'Change items per page',
  },

  LOAD_MORE: {
    LOAD_MORE_CLICK: 'Click load more button',
    INFINITE_SCROLL: 'Scroll to bottom for infinite scroll',
    LOAD_MORE_WITH_FILTER: 'Load more with active filters',
  },

  PRODUCT_CARDS: {
    CLICK_PRODUCT: 'Click on product card',
    ADD_TO_CART: 'Add product to cart',
    REMOVE_FROM_CART: 'Remove product from cart',
    TOGGLE_WISHLIST: 'Toggle wishlist',
    QUICK_VIEW: 'Use quick view',
    HOVER_INTERACTIONS: 'Test hover interactions on desktop',
    TOUCH_INTERACTIONS: 'Test touch interactions on mobile',
  },

  RESPONSIVE: {
    DESKTOP_LAYOUT: 'Verify desktop layout (1440x900)',
    TABLET_LAYOUT: 'Verify tablet layout (768x1024)',
    MOBILE_LAYOUT: 'Verify mobile layout (390x844)',
    HORIZONTAL_SCROLL: 'Verify no horizontal scroll on any viewport',
    MOBILE_MENU: 'Verify mobile menu functionality',
    TOUCH_TARGETS: 'Verify touch target sizes on mobile',
  },

  LOCALIZATION: {
    LANGUAGE_SWITCH_EN: 'Switch to English',
    LANGUAGE_SWITCH_AR: 'Switch to Arabic',
    ARABIC_RTL: 'Verify Arabic RTL layout',
    ENGLISH_LTR: 'Verify English LTR layout',
    CURRENCY: 'Verify currency display',
    DATE_FORMAT: 'Verify date format by locale',
  },

  ACCESSIBILITY: {
    KEYBOARD_NAVIGATION: 'Navigate using keyboard',
    FOCUS_VISIBILITY: 'Verify focus indicators',
    SCREEN_READER: 'Verify screen reader compatibility',
    BUTTON_SEMANTICS: 'Verify button semantic markup',
    LINK_SEMANTICS: 'Verify link semantic markup',
    FORM_LABELS: 'Verify form field labels',
    ALT_TEXT: 'Verify image alt text',
  },

  PERFORMANCE: {
    PAGE_LOAD_TIME: 'Measure page load time',
    DOM_READY_TIME: 'Measure DOM content loaded time',
    IMAGE_LOAD_TIME: 'Measure image load time',
    API_RESPONSE_TIME: 'Measure API response time',
  },

  EDGE_CASES: {
    EMPTY_RESULTS: 'PLP with no products',
    SINGLE_PRODUCT: 'PLP with single product',
    LARGE_PRODUCT_LIST: 'PLP with large number of products',
    ALL_OUT_OF_STOCK: 'All products out of stock',
    MIXED_STOCK_STATUS: 'Mix of in-stock and out-of-stock products',
    SLOW_NETWORK: 'Test on slow network connection',
    NO_NETWORK: 'Test offline behavior',
    NETWORK_ERROR: 'Test network error recovery',
  },

  UI_VISUAL: {
    ALIGNMENT: 'Verify element alignment',
    SPACING: 'Verify spacing and padding',
    TYPOGRAPHY: 'Verify font sizes and styles',
    COLORS: 'Verify color scheme',
    BORDERS: 'Verify borders and outlines',
    SHADOWS: 'Verify shadows and depth',
    HOVER_STATES: 'Verify hover state styling',
    ACTIVE_STATES: 'Verify active state styling',
    DISABLED_STATES: 'Verify disabled state styling',
    LOADING_STATE: 'Verify loading skeleton/spinner',
    ERROR_MESSAGE: 'Verify error message display',
    EMPTY_STATE: 'Verify empty state message',
  },

  BUSINESS_RULES: {
    PRODUCT_VISIBILITY: 'Verify correct products are visible',
    PRODUCT_AVAILABILITY: 'Verify product availability status',
    PRODUCT_ORDERING: 'Verify correct product ordering',
    PRICE_CONSISTENCY: 'Verify price consistency across views',
    DISCOUNT_ACCURACY: 'Verify discount calculations',
    PRODUCT_LABELS: 'Verify product label display',
    CATEGORY_RELEVANCE: 'Verify category/product relationship',
    FILTER_ACCURACY: 'Verify filter result accuracy',
    BRAND_ACCURACY: 'Verify brand filtering accuracy',
  },
};

export const CommonTestData = {
  VIEWPORTS: {
    DESKTOP: { name: 'desktop', width: 1440, height: 900 },
    TABLET: { name: 'tablet', width: 768, height: 1024 },
    MOBILE: { name: 'mobile', width: 390, height: 844 },
  },

  BROWSERS: {
    CHROMIUM: 'chromium',
    FIREFOX: 'firefox',
    WEBKIT: 'webkit',
  },

  LANGUAGES: {
    ENGLISH: 'en',
    ARABIC: 'ar',
  },

  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    NAVIGATION: 30000,
    API_RESPONSE: 10000,
  },

  HTTP_STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  SEVERITY_LEVELS: {
    CRITICAL: 'Critical',
    MAJOR: 'Major',
    MEDIUM: 'Medium',
    MINOR: 'Minor',
  },

  PRIORITY_LEVELS: {
    P0: 'P0',
    P1: 'P1',
    P2: 'P2',
    P3: 'P3',
  },
};

export const PLPTestCoverageMaps = {
  DISCOVERY_PHASE: [
    'Discover all accessible PLPs',
    'Discover all filters on each PLP',
    'Discover all sort options',
    'Discover product card elements',
    'Detect pagination/load more type',
    'Identify empty/error states',
  ],

  NAVIGATION_PHASE: [
    'Test breadcrumb navigation',
    'Test header category links',
    'Test menu navigation',
    'Test back/forward buttons',
    'Test category links within category',
  ],

  FILTER_PHASE: [
    'Test single filter application',
    'Test multiple filters same group',
    'Test multiple filters different groups',
    'Test filter persistence',
    'Test filter URL state',
    'Test clear single filter',
    'Test clear all filters',
    'Test no results scenarios',
    'Test invalid combinations',
  ],

  SORT_PHASE: [
    'Test each sort option',
    'Verify product order changes',
    'Test sort with filters',
    'Test sort persistence',
    'Verify sort state display',
  ],

  PAGINATION_PHASE: [
    'Test next page navigation',
    'Test previous page navigation',
    'Test jump to specific page',
    'Test items per page change',
    'Test load more button',
    'Test infinite scroll if applicable',
  ],

  PRODUCT_CARD_PHASE: [
    'Verify product name display',
    'Verify price display',
    'Verify discount display',
    'Verify product images',
    'Verify product rating',
    'Test add to cart functionality',
    'Test wishlist functionality',
    'Test quick view if available',
    'Test product link navigation',
    'Verify out-of-stock indication',
  ],

  RESPONSIVE_PHASE: [
    'Test desktop layout',
    'Test tablet layout',
    'Test mobile layout',
    'Verify no horizontal overflow',
    'Test touch interactions',
    'Test mobile menu',
    'Verify text wrapping',
    'Verify image sizing',
  ],

  LOCALIZATION_PHASE: [
    'Test English version',
    'Test Arabic version',
    'Test language switching',
    'Verify RTL layout for Arabic',
    'Verify LTR layout for English',
    'Check for untranslated strings',
    'Verify text alignment by language',
  ],

  PERFORMANCE_PHASE: [
    'Measure initial page load',
    'Measure filter application time',
    'Measure sort application time',
    'Measure pagination time',
    'Check image load times',
    'Monitor API response times',
  ],

  REGRESSION_PHASE: [
    'Re-test fixed bugs',
    'Verify fix does not break other functionality',
    'Test related features for regressions',
    'Verify performance not degraded',
  ],
};
