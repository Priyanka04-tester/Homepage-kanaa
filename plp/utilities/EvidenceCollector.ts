import { Page, Browser } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export class EvidenceCollector {
  private evidenceDir: string;

  constructor(private page: Page, evidenceBaseDir: string = './evidence/plp') {
    this.evidenceDir = evidenceBaseDir;
    this.ensureDirectoryExists(this.evidenceDir);
  }

  /**
   * Capture screenshot
   */
  async captureScreenshot(testCaseId: string, stepName: string = 'default'): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${stepName}-${timestamp}.png`;
    const filepath = path.join(testDir, filename);

    await this.page.screenshot({ path: filepath, fullPage: true });
    return filepath;
  }

  /**
   * Capture full page screenshot
   */
  async captureFullPage(testCaseId: string): Promise<string> {
    return this.captureScreenshot(testCaseId, 'fullpage');
  }

  /**
   * Capture viewport screenshot
   */
  async captureViewport(testCaseId: string): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filepath = path.join(testDir, `viewport-${timestamp}.png`);

    await this.page.screenshot({ path: filepath, fullPage: false });
    return filepath;
  }

  /**
   * Start video recording
   */
  async startVideoRecording(testCaseId: string): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);

    // Video recording is typically handled through Playwright config
    return path.join(testDir, 'recording.webm');
  }

  /**
   * Capture console output
   */
  async captureConsoleOutput(testCaseId: string): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);

    const logs: any[] = [];

    this.page.on('console', msg => {
      logs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString(),
      });
    });

    const filepath = path.join(testDir, 'console.json');
    if (logs.length > 0) {
      fs.writeFileSync(filepath, JSON.stringify(logs, null, 2));
    }

    return filepath;
  }

  /**
   * Capture network activity
   */
  async captureNetworkActivity(testCaseId: string): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);

    const requests: any[] = [];

    this.page.on('request', request => {
      requests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString(),
      });
    });

    const filepath = path.join(testDir, 'network.json');
    if (requests.length > 0) {
      fs.writeFileSync(filepath, JSON.stringify(requests, null, 2));
    }

    return filepath;
  }

  /**
   * Capture HAR file for network recording
   */
  async captureHAR(testCaseId: string): Promise<string> {
    // This would typically be done through Playwright browser context
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);
    return path.join(testDir, 'network.har');
  }

  /**
   * Capture browser trace
   */
  async captureTrace(testCaseId: string, context: any): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);
    const filepath = path.join(testDir, 'trace.zip');

    // Trace recording is handled at context level
    // This is a placeholder for integration with Playwright tracing
    return filepath;
  }

  /**
   * Capture DOM and HTML
   */
  async captureDOM(testCaseId: string): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);

    const html = await this.page.content();
    const filepath = path.join(testDir, 'page.html');

    fs.writeFileSync(filepath, html);
    return filepath;
  }

  /**
   * Capture accessibility tree
   */
  async captureAccessibilityTree(testCaseId: string): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);

    const a11yTree = await this.page.evaluate(() => {
      const getA11yTree = (element: any, level = 0) => {
        const role = element.getAttribute('role') || element.tagName.toLowerCase();
        const ariaLabel = element.getAttribute('aria-label');
        const text = element.textContent?.substring(0, 100);

        return {
          role,
          ariaLabel,
          text,
          level,
          children: Array.from(element.children)
            .slice(0, 5)
            .map((child: any) => getA11yTree(child, level + 1)),
        };
      };

      return getA11yTree(document.documentElement);
    });

    const filepath = path.join(testDir, 'accessibility-tree.json');
    fs.writeFileSync(filepath, JSON.stringify(a11yTree, null, 2));

    return filepath;
  }

  /**
   * Capture page metrics
   */
  async captureMetrics(testCaseId: string): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);

    const metrics = await this.page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as any;
      return {
        navigationStart: perf?.navigationStart,
        domContentLoadedEventEnd: perf?.domContentLoadedEventEnd,
        loadEventEnd: perf?.loadEventEnd,
        domInteractive: perf?.domInteractive,
        resourcesCount: performance.getEntriesByType('resource').length,
        timestamp: new Date().toISOString(),
      };
    });

    const filepath = path.join(testDir, 'metrics.json');
    fs.writeFileSync(filepath, JSON.stringify(metrics, null, 2));

    return filepath;
  }

  /**
   * Capture comparison screenshots for visual regression
   */
  async captureComparison(testCaseId: string, beforePath: string, afterPath: string): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);

    const comparisonData = {
      before: beforePath,
      after: afterPath,
      timestamp: new Date().toISOString(),
    };

    const filepath = path.join(testDir, 'comparison.json');
    fs.writeFileSync(filepath, JSON.stringify(comparisonData, null, 2));

    return filepath;
  }

  /**
   * Create metadata file for test run
   */
  async createMetadata(testCaseId: string, metadata: any): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);
    this.ensureDirectoryExists(testDir);

    const fullMetadata = {
      testCaseId,
      url: this.page.url(),
      userAgent: await this.page.evaluate(() => navigator.userAgent),
      timestamp: new Date().toISOString(),
      viewport: await this.page.viewportSize(),
      ...metadata,
    };

    const filepath = path.join(testDir, 'metadata.json');
    fs.writeFileSync(filepath, JSON.stringify(fullMetadata, null, 2));

    return filepath;
  }

  /**
   * Compress all evidence for a test case
   */
  async compressEvidence(testCaseId: string): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);

    if (!fs.existsSync(testDir)) {
      return '';
    }

    // In a real implementation, use archiver or similar
    // For now, just return the directory path
    return testDir;
  }

  /**
   * Generate evidence index
   */
  async generateEvidenceIndex(testCaseId: string): Promise<string> {
    const testDir = path.join(this.evidenceDir, testCaseId);

    if (!fs.existsSync(testDir)) {
      return '';
    }

    const files = fs.readdirSync(testDir);
    const index = {
      testCaseId,
      evidenceFiles: files,
      totalFiles: files.length,
      generatedAt: new Date().toISOString(),
    };

    const filepath = path.join(testDir, 'index.json');
    fs.writeFileSync(filepath, JSON.stringify(index, null, 2));

    return filepath;
  }

  /**
   * Helper method to ensure directory exists
   */
  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Clear old evidence
   */
  async clearOldEvidence(daysOld: number = 30): Promise<number> {
    if (!fs.existsSync(this.evidenceDir)) {
      return 0;
    }

    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    const directories = fs.readdirSync(this.evidenceDir);
    for (const dir of directories) {
      const fullPath = path.join(this.evidenceDir, dir);
      const stat = fs.statSync(fullPath);

      if (now - stat.mtimeMs > maxAge) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        deletedCount++;
      }
    }

    return deletedCount;
  }
}
