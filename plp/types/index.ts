// PLP QA Bot Types and Interfaces

export interface PLPCategory {
  id: string;
  name: string;
  url: string;
  type: 'parent' | 'subcategory' | 'nested';
  parentId?: string;
  level: number;
  visible: boolean;
  productCount?: number;
  breadcrumb?: string[];
  locale: 'en' | 'ar';
  discoveredAt: string;
}

export interface PLPFilter {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'dropdown' | 'custom';
  values: FilterValue[];
  applied: string[];
  persistent: boolean;
  urlParameter?: string;
  visible: boolean;
  locale: 'en' | 'ar';
}

export interface FilterValue {
  id: string;
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
}

export interface PLPSortOption {
  id: string;
  label: string;
  value: string;
  urlParameter?: string;
  active?: boolean;
}

export interface ProductCard {
  id: string;
  name: string;
  url: string;
  imageUrl?: string;
  price: number;
  oldPrice?: number;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  labels: string[];
  inStock: boolean;
  hasWishlist: boolean;
  hasAddToCart: boolean;
  hasQuickView: boolean;
  locale: 'en' | 'ar';
}

export interface PLPPage {
  id: string;
  categoryId: string;
  url: string;
  locale: 'en' | 'ar';
  viewport: string;
  title?: string;
  description?: string;
  breadcrumb?: string[];
  filters: PLPFilter[];
  sortOptions: PLPSortOption[];
  pagination?: PaginationInfo;
  productCards: ProductCard[];
  hasLoadMore?: boolean;
  isInfiniteScroll?: boolean;
  empty: boolean;
  errorState: boolean;
  loadingState: boolean;
  discoveredAt: string;
  screenshotPath?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages?: number;
  totalProducts?: number;
  productsPerPage?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PLPTestResult {
  testId: string;
  categoryId: string;
  testName: string;
  url: string;
  locale: 'en' | 'ar';
  viewport: string;
  browser: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'BLOCK';
  message?: string;
  evidencePath?: string;
  duration: number;
  timestamp: string;
}

export interface BugReport {
  bugId: string;
  title: string;
  severity: 'Critical' | 'Major' | 'Medium' | 'Minor';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  url: string;
  categoryId: string;
  locale: 'en' | 'ar';
  viewport: string;
  browser: string;
  testCaseId?: string;
  reproducibility: 'Always' | 'Usually' | 'Sometimes' | 'Rare';
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  screenshotPath?: string;
  videoPath?: string;
  consoleErrors?: string[];
  networkErrors?: string[];
  businessImpact: string;
  status: 'Open' | 'Fixed' | 'Not-Fixable' | 'Duplicate';
  createdAt: string;
  updatedAt: string;
}

export interface TestCoverageReport {
  timestamp: string;
  total_categories: number;
  tested_categories: number;
  total_filters: number;
  tested_filters: number;
  total_sort_options: number;
  tested_sort_options: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  pass_rate: number;
  languages_tested: string[];
  viewports_tested: string[];
  browsers_tested: string[];
  bugs_found: number;
  critical_bugs: number;
  major_bugs: number;
  coverage_gaps: string[];
}
