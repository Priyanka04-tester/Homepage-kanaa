import { TestCase } from '../types';

/**
 * Common Test Cases for PDP
 * These tests are executed for all product types
 */

export const commonTestCases: TestCase[] = [
  {
    id: 'TC-PDP-001',
    name: 'Page Load and Navigation',
    description: 'Verify that the PDP loads correctly',
    mode: 'DISCOVERY',
    priority: 'P0',
    severity: 'Critical',
    preconditions: ['Valid PDP URL provided', 'Browser connected'],
    steps: [
      { number: 1, action: 'Navigate to PDP URL', expectedBehavior: 'Page loads successfully' },
      { number: 2, action: 'Wait for page to fully load', expectedBehavior: 'All elements visible and interactive' },
      { number: 3, action: 'Verify product name visible', expectedBehavior: 'Product name displays correctly' },
      { number: 4, action: 'Check for console errors', expectedBehavior: 'No critical errors' },
    ],
    expectedResult: 'PDP loads successfully with all main elements visible',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-002',
    name: 'Product Information Display',
    description: 'Verify all product information is displayed correctly',
    mode: 'SMOKE',
    priority: 'P0',
    severity: 'Critical',
    preconditions: ['PDP fully loaded'],
    steps: [
      { number: 1, action: 'Check product name visibility', expectedBehavior: 'Product name clearly visible' },
      { number: 2, action: 'Check price display', expectedBehavior: 'Price shown in correct format' },
      { number: 3, action: 'Check stock status', expectedBehavior: 'Stock status displayed' },
      { number: 4, action: 'Verify product images', expectedBehavior: 'Product images load and display correctly' },
    ],
    expectedResult: 'All product information displays correctly',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-003',
    name: 'Add to Cart - Basic',
    description: 'Verify basic add to cart functionality',
    mode: 'SMOKE',
    priority: 'P0',
    severity: 'Critical',
    preconditions: ['PDP fully loaded', 'Product in stock'],
    steps: [
      { number: 1, action: 'Click Add to Cart button', expectedBehavior: 'Cart updates' },
      { number: 2, action: 'Verify cart count increases', expectedBehavior: 'Cart badge shows updated quantity' },
      { number: 3, action: 'Verify product added to cart', expectedBehavior: 'Product appears in cart' },
    ],
    expectedResult: 'Product successfully added to cart',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-004',
    name: 'Price Accuracy',
    description: 'Verify that prices are accurate and calculations are correct',
    mode: 'FULL',
    priority: 'P0',
    severity: 'High',
    preconditions: ['PDP fully loaded', 'Price information visible'],
    steps: [
      { number: 1, action: 'Record original price', expectedBehavior: 'Original price captured' },
      { number: 2, action: 'Record selling price', expectedBehavior: 'Selling price captured' },
      { number: 3, action: 'Verify discount calculation', expectedBehavior: 'Discount % matches actual values' },
      { number: 4, action: 'Verify subtotal calculation', expectedBehavior: 'Subtotal = price × quantity' },
    ],
    expectedResult: 'All price calculations are accurate',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-005',
    name: 'Quantity Controls',
    description: 'Verify quantity increase/decrease functionality',
    mode: 'FULL',
    priority: 'P1',
    severity: 'High',
    preconditions: ['PDP fully loaded', 'Product allows quantity selection'],
    steps: [
      { number: 1, action: 'Increase quantity to 2', expectedBehavior: 'Quantity input shows 2' },
      { number: 2, action: 'Verify price updates', expectedBehavior: 'Price multiplied by quantity' },
      { number: 3, action: 'Decrease quantity to 1', expectedBehavior: 'Quantity input shows 1' },
      { number: 4, action: 'Verify price recalculates', expectedBehavior: 'Price returns to original' },
    ],
    expectedResult: 'Quantity controls work correctly and prices update accordingly',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-006',
    name: 'Header Navigation',
    description: 'Verify header elements are functional',
    mode: 'FULL',
    priority: 'P1',
    severity: 'High',
    preconditions: ['PDP fully loaded'],
    steps: [
      { number: 1, action: 'Click logo', expectedBehavior: 'Navigates to homepage' },
      { number: 2, action: 'Verify search input visible', expectedBehavior: 'Search input accessible' },
      { number: 3, action: 'Verify cart button visible', expectedBehavior: 'Cart button accessible' },
      { number: 4, action: 'Verify language selector visible', expectedBehavior: 'Language options available' },
    ],
    expectedResult: 'All header elements are visible and clickable',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-007',
    name: 'Wishlist Functionality',
    description: 'Verify add to wishlist functionality',
    mode: 'FULL',
    priority: 'P2',
    severity: 'Medium',
    preconditions: ['PDP fully loaded', 'Wishlist button visible'],
    steps: [
      { number: 1, action: 'Click Add to Wishlist button', expectedBehavior: 'Button state changes' },
      { number: 2, action: 'Verify visual feedback', expectedBehavior: 'Button indicates item added' },
      { number: 3, action: 'Click again to remove', expectedBehavior: 'Button state changes back' },
    ],
    expectedResult: 'Wishlist add/remove works correctly',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-008',
    name: 'Product Images Gallery',
    description: 'Verify product image gallery functionality',
    mode: 'FULL',
    priority: 'P1',
    severity: 'High',
    preconditions: ['PDP fully loaded', 'Multiple product images exist'],
    steps: [
      { number: 1, action: 'Verify main image displays', expectedBehavior: 'Main product image visible' },
      { number: 2, action: 'Click on thumbnail', expectedBehavior: 'Main image updates' },
      { number: 3, action: 'Verify thumbnail navigation', expectedBehavior: 'Can navigate between images' },
    ],
    expectedResult: 'Product image gallery works correctly',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-009',
    name: 'Mobile Responsiveness',
    description: 'Verify PDP is responsive on mobile viewport',
    mode: 'FULL',
    priority: 'P1',
    severity: 'High',
    preconditions: ['PDP fully loaded', 'Mobile viewport set'],
    steps: [
      { number: 1, action: 'Check product name readable', expectedBehavior: 'Text size appropriate' },
      { number: 2, action: 'Verify Add to Cart button accessible', expectedBehavior: 'Button clickable' },
      { number: 3, action: 'Scroll through all content', expectedBehavior: 'No overlapping elements' },
    ],
    expectedResult: 'PDP displays correctly on mobile',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-010',
    name: 'Keyboard Navigation',
    description: 'Verify keyboard navigation through PDP',
    mode: 'FULL',
    priority: 'P2',
    severity: 'Medium',
    preconditions: ['PDP fully loaded'],
    steps: [
      { number: 1, action: 'Tab through interactive elements', expectedBehavior: 'Focus visible on each element' },
      { number: 2, action: 'Press Enter on buttons', expectedBehavior: 'Buttons activate via keyboard' },
      { number: 3, action: 'Verify tab order logical', expectedBehavior: 'Tab order makes sense' },
    ],
    expectedResult: 'Keyboard navigation works correctly',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-011',
    name: 'Share Functionality',
    description: 'Verify product share functionality',
    mode: 'FULL',
    priority: 'P2',
    severity: 'Medium',
    preconditions: ['PDP fully loaded', 'Share button visible'],
    steps: [
      { number: 1, action: 'Click Share button', expectedBehavior: 'Share menu or dialog appears' },
      { number: 2, action: 'Verify share options available', expectedBehavior: 'Social media options shown' },
    ],
    expectedResult: 'Share functionality works',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-012',
    name: 'Breadcrumb Navigation',
    description: 'Verify breadcrumb navigation works',
    mode: 'FULL',
    priority: 'P2',
    severity: 'Medium',
    preconditions: ['PDP fully loaded', 'Breadcrumb visible'],
    steps: [
      { number: 1, action: 'Click breadcrumb link', expectedBehavior: 'Navigates to parent page' },
      { number: 2, action: 'Verify URL changes', expectedBehavior: 'Correct URL loaded' },
    ],
    expectedResult: 'Breadcrumb navigation works correctly',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-013',
    name: 'Related Products Display',
    description: 'Verify related products section displays',
    mode: 'FULL',
    priority: 'P2',
    severity: 'Medium',
    preconditions: ['PDP fully loaded', 'Related products section exists'],
    steps: [
      { number: 1, action: 'Scroll to related products section', expectedBehavior: 'Section visible' },
      { number: 2, action: 'Verify product cards display', expectedBehavior: 'Product info visible' },
      { number: 3, action: 'Click on related product', expectedBehavior: 'Navigates to product PDP' },
    ],
    expectedResult: 'Related products display and are clickable',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-014',
    name: 'Reviews Display',
    description: 'Verify customer reviews display correctly',
    mode: 'FULL',
    priority: 'P2',
    severity: 'Medium',
    preconditions: ['PDP fully loaded', 'Reviews section exists'],
    steps: [
      { number: 1, action: 'Locate reviews section', expectedBehavior: 'Section visible' },
      { number: 2, action: 'Verify rating display', expectedBehavior: 'Rating shown correctly' },
      { number: 3, action: 'Verify review count', expectedBehavior: 'Review count accurate' },
    ],
    expectedResult: 'Reviews display correctly',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-015',
    name: 'Browser Compatibility',
    description: 'Verify PDP works across browsers',
    mode: 'FULL',
    priority: 'P1',
    severity: 'High',
    preconditions: ['PDP accessible', 'Multiple browsers available'],
    steps: [
      { number: 1, action: 'Test in Chromium', expectedBehavior: 'All features work' },
      { number: 2, action: 'Test in Firefox', expectedBehavior: 'All features work' },
      { number: 3, action: 'Test in WebKit', expectedBehavior: 'All features work' },
    ],
    expectedResult: 'PDP works across all tested browsers',
    status: 'PASS',
  },
];

export const configurableProductTests: TestCase[] = [
  {
    id: 'TC-PDP-CONFIG-001',
    name: 'Select Product Variant',
    description: 'Verify ability to select product variant',
    mode: 'FULL',
    priority: 'P0',
    severity: 'Critical',
    preconditions: ['Configurable product loaded', 'Variant options visible'],
    steps: [
      { number: 1, action: 'Click on first option', expectedBehavior: 'Option selects' },
      { number: 2, action: 'Verify image updates if applicable', expectedBehavior: 'Images change for variant' },
      { number: 3, action: 'Verify price updates if applicable', expectedBehavior: 'Price reflects selection' },
      { number: 4, action: 'Verify SKU updates if applicable', expectedBehavior: 'SKU reflects selection' },
    ],
    expectedResult: 'Variant selection works correctly',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-CONFIG-002',
    name: 'Test All Available Variants',
    description: 'Verify all available variants can be selected',
    mode: 'FULL',
    priority: 'P1',
    severity: 'High',
    preconditions: ['Configurable product loaded'],
    steps: [
      { number: 1, action: 'Identify all variant options', expectedBehavior: 'Options listed' },
      { number: 2, action: 'Select each variant individually', expectedBehavior: 'Each variant selects' },
      { number: 3, action: 'Verify variant-specific data updates', expectedBehavior: 'Price, image, SKU update' },
    ],
    expectedResult: 'All variants selectable and data updates correctly',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-CONFIG-003',
    name: 'Add Variant to Cart',
    description: 'Verify variant product can be added to cart',
    mode: 'SMOKE',
    priority: 'P0',
    severity: 'Critical',
    preconditions: ['Configurable product loaded', 'Variant selected'],
    steps: [
      { number: 1, action: 'Select a variant', expectedBehavior: 'Variant highlighted' },
      { number: 2, action: 'Click Add to Cart', expectedBehavior: 'Product added' },
      { number: 3, action: 'Verify cart contains correct variant', expectedBehavior: 'Variant data preserved' },
    ],
    expectedResult: 'Selected variant added to cart with correct configuration',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-CONFIG-004',
    name: 'Unavailable Variant Display',
    description: 'Verify unavailable variants are properly indicated',
    mode: 'FULL',
    priority: 'P2',
    severity: 'Medium',
    preconditions: ['Configurable product with unavailable variants'],
    steps: [
      { number: 1, action: 'Identify unavailable variants', expectedBehavior: 'Unavailable variants marked' },
      { number: 2, action: 'Attempt to select unavailable', expectedBehavior: 'Selection prevented' },
    ],
    expectedResult: 'Unavailable variants cannot be selected',
    status: 'PASS',
  },
];

export const bundleProductTests: TestCase[] = [
  {
    id: 'TC-PDP-BUNDLE-001',
    name: 'View Bundle Components',
    description: 'Verify bundle components are displayed',
    mode: 'SMOKE',
    priority: 'P0',
    severity: 'Critical',
    preconditions: ['Bundle product loaded'],
    steps: [
      { number: 1, action: 'Locate bundle section', expectedBehavior: 'Bundle items visible' },
      { number: 2, action: 'Verify component details', expectedBehavior: 'Component info displays' },
      { number: 3, action: 'Verify bundle pricing', expectedBehavior: 'Total price shows' },
    ],
    expectedResult: 'All bundle components visible and priced correctly',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-BUNDLE-002',
    name: 'Select Bundle Components',
    description: 'Verify ability to select/deselect bundle components',
    mode: 'FULL',
    priority: 'P1',
    severity: 'High',
    preconditions: ['Bundle product loaded', 'Optional components exist'],
    steps: [
      { number: 1, action: 'Check optional components', expectedBehavior: 'Can be selected' },
      { number: 2, action: 'Uncheck optional component', expectedBehavior: 'Price updates' },
      { number: 3, action: 'Re-check component', expectedBehavior: 'Price updates again' },
    ],
    expectedResult: 'Bundle components can be selected/deselected',
    status: 'PASS',
  },

  {
    id: 'TC-PDP-BUNDLE-003',
    name: 'Add Bundle to Cart',
    description: 'Verify bundle with selected components can be added to cart',
    mode: 'SMOKE',
    priority: 'P0',
    severity: 'Critical',
    preconditions: ['Bundle product loaded'],
    steps: [
      { number: 1, action: 'Configure bundle', expectedBehavior: 'Components selected' },
      { number: 2, action: 'Click Add to Cart', expectedBehavior: 'Bundle added' },
      { number: 3, action: 'Verify cart contains bundle config', expectedBehavior: 'All components in cart' },
    ],
    expectedResult: 'Bundle with correct configuration added to cart',
    status: 'PASS',
  },
];
