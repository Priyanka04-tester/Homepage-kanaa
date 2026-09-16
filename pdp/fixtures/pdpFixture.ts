import { test as base } from '@playwright/test';
import { PDPPage } from '../pages/PDPPage';
import { PDPDiscovery } from '../utilities/PDPDiscovery';
import { ProductClassifier } from '../utilities/ProductClassifier';
import { BugReporter } from '../utilities/BugReporter';
import { EvidenceCollector } from '../utilities/EvidenceCollector';

type PDPTestFixtures = {
  pdpPage: PDPPage;
  pdpDiscovery: PDPDiscovery;
  productClassifier: ProductClassifier;
  bugReporter: BugReporter;
  evidenceCollector: EvidenceCollector;
};

export const test = base.extend<PDPTestFixtures>({
  pdpPage: async ({ page }, use) => {
    const pdpPage = new PDPPage(page, process.env.BASE_URL);
    await use(pdpPage);
  },

  pdpDiscovery: async ({ page }, use) => {
    const discovery = new PDPDiscovery(page);
    await use(discovery);
  },

  productClassifier: async ({ page }, use) => {
    const classifier = new ProductClassifier(page);
    await use(classifier);
  },

  bugReporter: async ({}, use) => {
    const reporter = new BugReporter('reports');
    await use(reporter);
  },

  evidenceCollector: async ({}, use) => {
    const collector = new EvidenceCollector('reports');
    await use(collector);
  },
});

export { expect } from '@playwright/test';
