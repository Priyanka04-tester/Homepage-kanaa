import { test as base, Browser, BrowserContext } from '@playwright/test';
import { PLPPage } from '../pages/PLPPage';
import { PLPDiscovery } from '../utilities/PLPDiscovery';
import { EvidenceCollector } from '../utilities/EvidenceCollector';
import { BugReporter } from '../utilities/BugReporter';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

type PLPTestFixtures = {
  plpPage: PLPPage;
  discovery: PLPDiscovery;
  evidence: EvidenceCollector;
  bugReporter: BugReporter;
  baseUrl: string;
  baseUrlAr: string;
  locale: 'en' | 'ar';
  viewport: 'mobile' | 'tablet' | 'desktop';
};

export const test = base.extend<PLPTestFixtures>({
  plpPage: async ({ page }, use) => {
    const plpPage = new PLPPage(page);
    await use(plpPage);
  },

  discovery: async ({ page }, use) => {
    const discovery = new PLPDiscovery(page);
    await use(discovery);
  },

  evidence: async ({ page }, use) => {
    const evidence = new EvidenceCollector(page, './evidence/plp');
    await use(evidence);
  },

  bugReporter: async ({}, use) => {
    const bugReporter = new BugReporter('./state/plp-bugs.json');
    await use(bugReporter);
  },

  baseUrl: async ({}, use) => {
    const baseUrl = process.env.BASE_URL || 'https://thekanaa.com/en-sa/';
    await use(baseUrl);
  },

  baseUrlAr: async ({}, use) => {
    const baseUrlAr = process.env.BASE_URL_AR || 'https://thekanaa.com/ar-sa/';
    await use(baseUrlAr);
  },

  locale: [
    'en' as const,
    'ar' as const,
  ],

  viewport: [
    'desktop' as const,
    'tablet' as const,
    'mobile' as const,
  ],
});

export { expect } from '@playwright/test';
