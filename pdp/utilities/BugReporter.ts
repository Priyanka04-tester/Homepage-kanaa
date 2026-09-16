import { BugReport, EvidenceFile, Severity } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Bug Reporter
 * Generates and manages bug reports
 */
export class BugReporter {
  private bugCounter = 0;
  private bugsDirectory: string;

  constructor(baseReportPath: string = 'reports') {
    this.bugsDirectory = path.join(baseReportPath, 'bugs');
    this.ensureDirectory();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.bugsDirectory)) {
      fs.mkdirSync(this.bugsDirectory, { recursive: true });
    }
  }

  createBugReport(
    title: string,
    severity: Severity,
    priority: string,
    environment: {
      url: string;
      browser: string;
      viewport: string;
      language: string;
    },
    stepsToReproduce: string[],
    expectedResult: string,
    actualResult: string,
    affectedElements: string[] = [],
    testCaseId?: string,
  ): BugReport {
    this.bugCounter++;
    const bugId = `BUG-PDP-${String(this.bugCounter).padStart(4, '0')}`;

    const bug: BugReport = {
      bugId,
      title,
      description: `${title} - Identified during automated testing`,
      severity,
      priority: priority as any,
      reproducibility: 'Usually',
      environment,
      stepsToReproduce,
      expectedResult,
      actualResult,
      evidence: [],
      affectedElements,
      testCaseId,
      status: 'NEW',
    };

    this.saveBugReport(bug);
    return bug;
  }

  addEvidenceToBug(bug: BugReport, evidence: EvidenceFile[]): void {
    bug.evidence.push(...evidence);
    this.saveBugReport(bug);
  }

  addConsoleErrorsToBug(bug: BugReport, errors: string[]): void {
    bug.consoleErrors = errors;
    this.saveBugReport(bug);
  }

  addNetworkErrorsToBug(bug: BugReport, errors: string[]): void {
    bug.networkErrors = errors;
    this.saveBugReport(bug);
  }

  updateBugStatus(bugId: string, status: 'NEW' | 'CONFIRMED' | 'FIXED' | 'NOT_FIXED' | 'WONT_FIX'): void {
    const bugPath = path.join(this.bugsDirectory, `${bugId}.json`);
    if (fs.existsSync(bugPath)) {
      const bug = JSON.parse(fs.readFileSync(bugPath, 'utf-8'));
      bug.status = status;
      fs.writeFileSync(bugPath, JSON.stringify(bug, null, 2));
    }
  }

  private saveBugReport(bug: BugReport): void {
    const bugPath = path.join(this.bugsDirectory, `${bug.bugId}.json`);
    fs.writeFileSync(bugPath, JSON.stringify(bug, null, 2));
  }

  getAllBugs(): BugReport[] {
    const bugs: BugReport[] = [];
    const files = fs.readdirSync(this.bugsDirectory).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(this.bugsDirectory, file), 'utf-8');
      bugs.push(JSON.parse(content));
    }

    return bugs.sort((a, b) => a.bugId.localeCompare(b.bugId));
  }

  getBugsBySeverity(severity: Severity): BugReport[] {
    return this.getAllBugs().filter(b => b.severity === severity);
  }

  getBugCount(): {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  } {
    const bugs = this.getAllBugs();
    return {
      total: bugs.length,
      critical: bugs.filter(b => b.severity === 'Critical').length,
      high: bugs.filter(b => b.severity === 'High').length,
      medium: bugs.filter(b => b.severity === 'Medium').length,
      low: bugs.filter(b => b.severity === 'Low').length,
    };
  }

  generateBugSummary(): string {
    const bugs = this.getAllBugs();
    const counts = this.getBugCount();

    let summary = `# Bug Report Summary\n\n`;
    summary += `**Total Bugs**: ${counts.total}\n`;
    summary += `- Critical: ${counts.critical}\n`;
    summary += `- High: ${counts.high}\n`;
    summary += `- Medium: ${counts.medium}\n`;
    summary += `- Low: ${counts.low}\n\n`;

    if (bugs.length === 0) {
      summary += `No bugs found.\n`;
      return summary;
    }

    // Group by severity
    summary += `## Bugs by Severity\n\n`;

    for (const severity of ['Critical', 'High', 'Medium', 'Low'] as Severity[]) {
      const bugsBySeverity = bugs.filter((b: BugReport) => b.severity === severity);
      if (bugsBySeverity.length > 0) {
        summary += `### ${severity} (${bugsBySeverity.length})\n`;
        for (const bug of bugsBySeverity) {
          summary += `\n- **${bug.bugId}**: ${bug.title}\n`;
          summary += `  - Environment: ${bug.environment.browser} @ ${bug.environment.viewport}\n`;
          summary += `  - Status: ${bug.status}\n`;
          summary += `  - Steps: ${bug.stepsToReproduce.length} steps\n`;
          if (bug.evidence.length > 0) {
            summary += `  - Evidence: ${bug.evidence.length} files\n`;
          }
        }
        summary += '\n';
      }
    }

    return summary;
  }

  generateDetailedBugReport(bugId: string): string {
    const bugPath = path.join(this.bugsDirectory, `${bugId}.json`);
    if (!fs.existsSync(bugPath)) {
      return `Bug ${bugId} not found.`;
    }

    const bug = JSON.parse(fs.readFileSync(bugPath, 'utf-8'));
    let report = `# Bug Report: ${bug.bugId}\n\n`;

    report += `## Overview\n`;
    report += `- **Title**: ${bug.title}\n`;
    report += `- **Severity**: ${bug.severity}\n`;
    report += `- **Priority**: ${bug.priority}\n`;
    report += `- **Status**: ${bug.status}\n`;
    report += `- **Reproducibility**: ${bug.reproducibility}\n\n`;

    report += `## Environment\n`;
    report += `- **URL**: ${bug.environment.url}\n`;
    report += `- **Browser**: ${bug.environment.browser}\n`;
    report += `- **Viewport**: ${bug.environment.viewport}\n`;
    report += `- **Language**: ${bug.environment.language}\n\n`;

    report += `## Steps to Reproduce\n`;
    bug.stepsToReproduce.forEach((step: string, index: number) => {
      report += `${index + 1}. ${step}\n`;
    });
    report += '\n';

    report += `## Expected Result\n`;
    report += `${bug.expectedResult}\n\n`;

    report += `## Actual Result\n`;
    report += `${bug.actualResult}\n\n`;

    if (bug.consoleErrors && bug.consoleErrors.length > 0) {
      report += `## Console Errors\n`;
      bug.consoleErrors.forEach((err: string) => {
        report += `- ${err}\n`;
      });
      report += '\n';
    }

    if (bug.networkErrors && bug.networkErrors.length > 0) {
      report += `## Network Errors\n`;
      bug.networkErrors.forEach((err: string) => {
        report += `- ${err}\n`;
      });
      report += '\n';
    }

    if (bug.affectedElements.length > 0) {
      report += `## Affected Elements\n`;
      bug.affectedElements.forEach((elem: string) => {
        report += `- ${elem}\n`;
      });
      report += '\n';
    }

    if (bug.evidence.length > 0) {
      report += `## Evidence\n`;
      bug.evidence.forEach((ev: EvidenceFile) => {
        report += `- **${ev.type}**: ${ev.path}\n`;
        if (ev.description) {
          report += `  - ${ev.description}\n`;
        }
      });
      report += '\n';
    }

    if (bug.testCaseId) {
      report += `## Related Test Case\n`;
      report += `Test Case: ${bug.testCaseId}\n\n`;
    }

    return report;
  }
}
