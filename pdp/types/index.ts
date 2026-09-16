// Product Detail Page Type Definitions

export type ProductType =
  | 'simple'
  | 'configurable'
  | 'bundle'
  | 'grouped'
  | 'out-of-stock'
  | 'low-stock'
  | 'with-reviews'
  | 'with-fbt'
  | 'unknown';

export type TestMode = 'DISCOVERY' | 'SMOKE' | 'SANITY' | 'FULL' | 'REGRESSION' | 'RETEST';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export interface PDPSection {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locator?: string;
  elements: PDPElement[];
}

export interface PDPElement {
  id: string;
  type: 'button' | 'link' | 'input' | 'image' | 'text' | 'select' | 'checkbox' | 'other';
  name: string;
  locator?: string;
  testable: boolean;
  interactive: boolean;
  visible?: boolean;
  text?: string;
}

export interface ProductAttribute {
  name: string;
  type: string;
  options: ProductAttributeOption[];
  required: boolean;
}

export interface ProductAttributeOption {
  label: string;
  value: string;
  available: boolean;
  affectsPrice: boolean;
  affectsImage: boolean;
  affectsStock: boolean;
}

export interface PriceInfo {
  originalPrice?: number;
  sellingPrice: number;
  discount?: number;
  discountPercentage?: number;
  currency: string;
  vat?: number;
  total?: number;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  mode: TestMode;
  priority: Priority;
  severity: Severity;
  preconditions: string[];
  steps: TestStep[];
  expectedResult: string;
  actualResult?: string;
  status?: 'PASS' | 'FAIL' | 'BLOCKED';
  bugIds?: string[];
  evidence?: EvidenceFile[];
}

export interface TestStep {
  number: number;
  action: string;
  expectedBehavior: string;
}

export interface BugReport {
  bugId: string;
  title: string;
  description: string;
  severity: Severity;
  priority: Priority;
  reproducibility: 'Always' | 'Usually' | 'Sometimes' | 'Rare';
  environment: {
    url: string;
    browser: string;
    viewport: string;
    language: string;
  };
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  evidence: EvidenceFile[];
  consoleErrors?: string[];
  networkErrors?: string[];
  testCaseId?: string;
  status: 'NEW' | 'CONFIRMED' | 'FIXED' | 'NOT_FIXED' | 'WONT_FIX';
  affectedElements: string[];
}

export interface EvidenceFile {
  type: 'screenshot' | 'video' | 'trace' | 'console' | 'network';
  path: string;
  timestamp: string;
  description?: string;
}

export interface PDPDiscoveryResult {
  url: string;
  productType: ProductType;
  productName: string;
  productSku?: string;
  brand?: string;
  sections: PDPSection[];
  attributes?: ProductAttribute[];
  price?: PriceInfo;
  hasReviews: boolean;
  hasFBT: boolean;
  hasBundle: boolean;
  discoveredAt: string;
  totalElements: number;
}

export interface QAReport {
  title: string;
  executionDate: string;
  mode: TestMode;
  environment: {
    url: string;
    baseUrl: string;
    browsers: string[];
    viewports: string[];
  };
  productDetails: {
    name: string;
    sku: string;
    url: string;
    type: ProductType;
  };
  discovery: PDPDiscoveryResult;
  execution: {
    totalTests: number;
    passed: number;
    failed: number;
    blocked: number;
    passRate: number;
  };
  bugs: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    list: BugReport[];
  };
  performance?: {
    pageLoadTime: number;
    domReadyTime: number;
    largeResources: string[];
    slowRequests: string[];
  };
  recommendations: 'PASS' | 'PASS_WITH_OBSERVATIONS' | 'FAIL' | 'BLOCKED';
  notes: string[];
}
