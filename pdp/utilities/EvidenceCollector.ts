import { Page } from '@playwright/test';
import { EvidenceFile } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Evidence Collector
 * Collects screenshots, videos, traces, and other evidence
 */
export class EvidenceCollector {
  private evidenceDir: string;

  constructor(baseReportPath: string = 'reports') {
    this.evidenceDir = path.join(baseReportPath, 'evidence');
    this.ensureDirectory();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.evidenceDir)) {
      fs.mkdirSync(this.evidenceDir, { recursive: true });
    }
  }

  async takeScreenshot(
    page: Page,
    testCaseId: string,
    filename: string = 'screenshot.png',
  ): Promise<EvidenceFile> {
    const testDir = this.getTestDirectory(testCaseId);
    const filepath = path.join(testDir, filename);

    try {
      await page.screenshot({ path: filepath, fullPage: false });

      return {
        type: 'screenshot',
        path: filepath,
        timestamp: new Date().toISOString(),
        description: `Screenshot from ${testCaseId}`,
      };
    } catch (error) {
      console.error(`Failed to take screenshot: ${error}`);
      throw error;
    }
  }

  async takeFullPageScreenshot(
    page: Page,
    testCaseId: string,
    filename: string = 'fullpage.png',
  ): Promise<EvidenceFile> {
    const testDir = this.getTestDirectory(testCaseId);
    const filepath = path.join(testDir, filename);

    try {
      await page.screenshot({ path: filepath, fullPage: true });

      return {
        type: 'screenshot',
        path: filepath,
        timestamp: new Date().toISOString(),
        description: `Full page screenshot from ${testCaseId}`,
      };
    } catch (error) {
      console.error(`Failed to take full page screenshot: ${error}`);
      throw error;
    }
  }

  async captureConsoleMessages(
    page: Page,
    testCaseId: string,
  ): Promise<EvidenceFile | null> {
    const messages: Array<{ type: string; message: string }> = [];

    const consoleHandler = (msg: any) => {
      messages.push({
        type: msg.type(),
        message: msg.text(),
      });
    };

    page.on('console', consoleHandler);

    // Return promise that collects messages for a set duration
    await new Promise(resolve => setTimeout(resolve, 1000));

    page.removeListener('console', consoleHandler);

    if (messages.length === 0) {
      return null;
    }

    const testDir = this.getTestDirectory(testCaseId);
    const filepath = path.join(testDir, 'console.json');

    fs.writeFileSync(filepath, JSON.stringify(messages, null, 2));

    return {
      type: 'console',
      path: filepath,
      timestamp: new Date().toISOString(),
      description: `Console messages (${messages.length} entries)`,
    };
  }

  async captureNetworkActivity(
    page: Page,
    testCaseId: string,
  ): Promise<EvidenceFile | null> {
    const requests: Array<{
      url: string;
      method: string;
      status?: number;
      resourceType: string;
      timing?: number;
    }> = [];

    const requestHandler = (request: any) => {
      const startTime = Date.now();
      request.response().then((response: any) => {
        requests.push({
          url: request.url(),
          method: request.method(),
          status: response.status(),
          resourceType: request.resourceType(),
          timing: Date.now() - startTime,
        });
      }).catch(() => {
        // Request failed
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          timing: Date.now() - startTime,
        });
      });
    };

    page.on('requestfinished', requestHandler);

    // Collect for set duration
    await new Promise(resolve => setTimeout(resolve, 2000));

    page.removeListener('requestfinished', requestHandler);

    if (requests.length === 0) {
      return null;
    }

    const testDir = this.getTestDirectory(testCaseId);
    const filepath = path.join(testDir, 'network.json');

    fs.writeFileSync(filepath, JSON.stringify(requests, null, 2));

    return {
      type: 'network',
      path: filepath,
      timestamp: new Date().toISOString(),
      description: `Network activity (${requests.length} requests)`,
    };
  }

  async capturePageState(
    page: Page,
    testCaseId: string,
  ): Promise<EvidenceFile> {
    const testDir = this.getTestDirectory(testCaseId);
    const filepath = path.join(testDir, 'page-state.json');

    const pageState = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        documentReady: document.readyState,
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY,
        },
        elementCount: document.querySelectorAll('*').length,
        formElements: document.querySelectorAll('form').length,
        buttons: document.querySelectorAll('button').length,
        links: document.querySelectorAll('a').length,
        images: document.querySelectorAll('img').length,
      };
    });

    fs.writeFileSync(filepath, JSON.stringify(pageState, null, 2));

    return {
      type: 'console', // Using console as generic type for metadata
      path: filepath,
      timestamp: new Date().toISOString(),
      description: 'Page state snapshot',
    };
  }

  async captureAccessibilityIssues(
    page: Page,
    testCaseId: string,
  ): Promise<EvidenceFile | null> {
    const testDir = this.getTestDirectory(testCaseId);
    const filepath = path.join(testDir, 'a11y-issues.json');

    const a11yIssues = await page.evaluate(() => {
      const issues: any[] = [];

      // Check for images without alt text
      document.querySelectorAll('img').forEach((img, i) => {
        if (!img.getAttribute('alt') || img.getAttribute('alt')?.trim() === '') {
          issues.push({
            type: 'missing-alt-text',
            element: `img[${i}]`,
            selector: img.id || img.className,
          });
        }
      });

      // Check for buttons without text or aria-label
      document.querySelectorAll('button').forEach((btn, i) => {
        const text = btn.textContent?.trim() || '';
        const ariaLabel = btn.getAttribute('aria-label');
        if (!text && !ariaLabel) {
          issues.push({
            type: 'button-missing-label',
            element: `button[${i}]`,
            selector: btn.id || btn.className,
          });
        }
      });

      // Check for form inputs without labels
      document.querySelectorAll('input, textarea, select').forEach((input, i) => {
        const associated = document.querySelector(`label[for="${input.id}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        if (!associated && !ariaLabel) {
          issues.push({
            type: 'form-element-missing-label',
            element: `input[${i}]`,
            selector: input.id || input.className,
          });
        }
      });

      // Check for color contrast (basic check)
      document.querySelectorAll('*').forEach((el) => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        // Very basic check - just log potential issues
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
          // Likely transparent, might have contrast issues
        }
      });

      return issues;
    });

    if (a11yIssues.length === 0) {
      return null;
    }

    fs.writeFileSync(filepath, JSON.stringify(a11yIssues, null, 2));

    return {
      type: 'console',
      path: filepath,
      timestamp: new Date().toISOString(),
      description: `Accessibility issues (${a11yIssues.length} found)`,
    };
  }

  async saveTestMetadata(
    testCaseId: string,
    metadata: {
      testName: string;
      startTime: string;
      endTime?: string;
      duration?: number;
      status: 'PASS' | 'FAIL' | 'BLOCKED';
      browser: string;
      viewport: string;
      url: string;
      errorMessage?: string;
      [key: string]: any;
    },
  ): Promise<void> {
    const testDir = this.getTestDirectory(testCaseId);
    const filepath = path.join(testDir, 'metadata.json');

    fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2));
  }

  private getTestDirectory(testCaseId: string): string {
    const testDir = path.join(this.evidenceDir, testCaseId);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    return testDir;
  }

  getEvidenceDirectory(): string {
    return this.evidenceDir;
  }

  listEvidence(testCaseId: string): string[] {
    const testDir = this.getTestDirectory(testCaseId);
    try {
      return fs.readdirSync(testDir);
    } catch {
      return [];
    }
  }

  cleanupOldEvidence(olderThanDays: number = 7): void {
    const now = Date.now();
    const maxAge = olderThanDays * 24 * 60 * 60 * 1000;

    const removeOldFiles = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (now - stat.mtime.getTime() > maxAge) {
          if (stat.isDirectory()) {
            removeOldFiles(filepath);
            fs.rmdirSync(filepath);
          } else {
            fs.unlinkSync(filepath);
          }
        }
      }
    };

    try {
      removeOldFiles(this.evidenceDir);
    } catch (error) {
      console.error(`Failed to cleanup old evidence: ${error}`);
    }
  }
}
