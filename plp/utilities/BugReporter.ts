import fs from 'fs';
import path from 'path';
import { BugReport } from '../types/index';

export class BugReporter {
  private bugsFile: string;
  private bugs: BugReport[] = [];

  constructor(bugsFilePath: string = './state/plp-bugs.json') {
    this.bugsFile = bugsFilePath;
    this.loadBugs();
  }

  /**
   * Create a new bug report
   */
  createBugReport(
    title: string,
    options: {
      severity: 'Critical' | 'Major' | 'Medium' | 'Minor';
      priority?: 'P0' | 'P1' | 'P2' | 'P3';
      url: string;
      categoryId: string;
      locale: 'en' | 'ar';
      viewport: string;
      browser: string;
      reproducibility?: 'Always' | 'Usually' | 'Sometimes' | 'Rare';
      stepsToReproduce: string[];
      expectedResult: string;
      actualResult: string;
      screenshotPath?: string;
      videoPath?: string;
      consoleErrors?: string[];
      networkErrors?: string[];
      businessImpact: string;
    }
  ): BugReport {
    // Determine priority from severity if not provided
    const priorityMap = {
      'Critical': 'P0',
      'Major': 'P1',
      'Medium': 'P2',
      'Minor': 'P3',
    };

    const bugReport: BugReport = {
      bugId: this.generateBugId(),
      title,
      severity: options.severity,
      priority: options.priority || priorityMap[options.severity] as any,
      url: options.url,
      categoryId: options.categoryId,
      locale: options.locale,
      viewport: options.viewport,
      browser: options.browser,
      reproducibility: options.reproducibility || 'Sometimes',
      stepsToReproduce: options.stepsToReproduce,
      expectedResult: options.expectedResult,
      actualResult: options.actualResult,
      screenshotPath: options.screenshotPath,
      videoPath: options.videoPath,
      consoleErrors: options.consoleErrors || [],
      networkErrors: options.networkErrors || [],
      businessImpact: options.businessImpact,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bugs.push(bugReport);
    this.saveBugs();

    return bugReport;
  }

  /**
   * Report a visual bug
   */
  reportVisualBug(
    title: string,
    description: string,
    options: {
      url: string;
      categoryId: string;
      locale: 'en' | 'ar';
      viewport: string;
      browser: string;
      screenshotPath: string;
      expectedVisual?: string;
      businessImpact: string;
    }
  ): BugReport {
    return this.createBugReport(
      title,
      {
        severity: 'Minor',
        url: options.url,
        categoryId: options.categoryId,
        locale: options.locale,
        viewport: options.viewport,
        browser: options.browser,
        stepsToReproduce: [`Navigate to ${options.url}`],
        expectedResult: options.expectedVisual || 'Correct layout and alignment',
        actualResult: description,
        screenshotPath: options.screenshotPath,
        businessImpact: options.businessImpact,
      }
    );
  }

  /**
   * Report a functional bug
   */
  reportFunctionalBug(
    title: string,
    options: {
      url: string;
      categoryId: string;
      locale: 'en' | 'ar';
      viewport: string;
      browser: string;
      testCaseId?: string;
      stepsToReproduce: string[];
      expectedResult: string;
      actualResult: string;
      severity?: 'Critical' | 'Major' | 'Medium' | 'Minor';
      screenshotPath?: string;
      videoPath?: string;
      consoleErrors?: string[];
      businessImpact: string;
    }
  ): BugReport {
    return this.createBugReport(
      title,
      {
        severity: options.severity || 'Major',
        url: options.url,
        categoryId: options.categoryId,
        locale: options.locale,
        viewport: options.viewport,
        browser: options.browser,
        stepsToReproduce: options.stepsToReproduce,
        expectedResult: options.expectedResult,
        actualResult: options.actualResult,
        screenshotPath: options.screenshotPath,
        videoPath: options.videoPath,
        consoleErrors: options.consoleErrors,
        businessImpact: options.businessImpact,
      }
    );
  }

  /**
   * Report a performance bug
   */
  reportPerformanceBug(
    title: string,
    options: {
      url: string;
      categoryId: string;
      locale: 'en' | 'ar';
      viewport: string;
      browser: string;
      metric: string;
      actualValue: number;
      expectedValue: number;
      unit: string;
      businessImpact: string;
    }
  ): BugReport {
    return this.createBugReport(
      title,
      {
        severity: 'Medium',
        url: options.url,
        categoryId: options.categoryId,
        locale: options.locale,
        viewport: options.viewport,
        browser: options.browser,
        stepsToReproduce: [`Navigate to ${options.url}`, 'Measure performance'],
        expectedResult: `${options.metric} should be <= ${options.expectedValue}${options.unit}`,
        actualResult: `${options.metric} is ${options.actualValue}${options.unit}`,
        businessImpact: options.businessImpact,
      }
    );
  }

  /**
   * Report a potential issue (not confirmed as bug yet)
   */
  reportPotentialIssue(
    title: string,
    observation: string,
    options: {
      url: string;
      categoryId: string;
      locale: 'en' | 'ar';
      viewport: string;
      browser: string;
      screenshotPath?: string;
    }
  ): BugReport {
    return this.createBugReport(
      `[POTENTIAL ISSUE] ${title}`,
      {
        severity: 'Minor',
        url: options.url,
        categoryId: options.categoryId,
        locale: options.locale,
        viewport: options.viewport,
        browser: options.browser,
        reproducibility: 'Sometimes',
        stepsToReproduce: [`Navigate to ${options.url}`],
        expectedResult: 'Issue should not occur',
        actualResult: observation,
        screenshotPath: options.screenshotPath,
        businessImpact: 'Needs investigation',
      }
    );
  }

  /**
   * Report a business rule confirmation requirement
   */
  reportBusinessRuleQuestion(
    question: string,
    context: string,
    options: {
      url: string;
      categoryId: string;
      locale: 'en' | 'ar';
      viewport: string;
      browser: string;
      screenshotPath?: string;
    }
  ): void {
    // Store as a special type of issue for review
    const businessQuestion = {
      type: 'business-rule-question',
      question,
      context,
      url: options.url,
      categoryId: options.categoryId,
      locale: options.locale,
      viewport: options.viewport,
      browser: options.browser,
      screenshotPath: options.screenshotPath,
      createdAt: new Date().toISOString(),
    };

    const questionsFile = './state/plp-business-questions.json';
    let questions = [];

    if (fs.existsSync(questionsFile)) {
      const content = fs.readFileSync(questionsFile, 'utf-8');
      questions = JSON.parse(content);
    }

    questions.push(businessQuestion);
    fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2));
  }

  /**
   * Mark bug as fixed and create regression test pointer
   */
  markBugAsFixed(bugId: string, fixedInVersion: string): void {
    const bug = this.bugs.find(b => b.bugId === bugId);
    if (bug) {
      bug.status = 'Fixed';
      bug.updatedAt = new Date().toISOString();
      this.saveBugs();
    }
  }

  /**
   * Update bug status
   */
  updateBugStatus(bugId: string, status: 'Open' | 'Fixed' | 'Not-Fixable' | 'Duplicate'): void {
    const bug = this.bugs.find(b => b.bugId === bugId);
    if (bug) {
      bug.status = status;
      bug.updatedAt = new Date().toISOString();
      this.saveBugs();
    }
  }

  /**
   * Add regression test reference to bug
   */
  linkRegressionTest(bugId: string, testCaseId: string): void {
    const bug = this.bugs.find(b => b.bugId === bugId);
    if (bug) {
      if (!bug.testCaseId) {
        bug.testCaseId = testCaseId;
        this.saveBugs();
      }
    }
  }

  /**
   * Get bugs by severity
   */
  getBugsBySeverity(severity: string): BugReport[] {
    return this.bugs.filter(b => b.severity === severity);
  }

  /**
   * Get bugs by category
   */
  getBugsByCategory(categoryId: string): BugReport[] {
    return this.bugs.filter(b => b.categoryId === categoryId);
  }

  /**
   * Get open bugs
   */
  getOpenBugs(): BugReport[] {
    return this.bugs.filter(b => b.status === 'Open');
  }

  /**
   * Get all bugs
   */
  getAllBugs(): BugReport[] {
    return this.bugs;
  }

  /**
   * Generate bug summary report
   */
  generateBugSummary(): {
    total: number;
    critical: number;
    major: number;
    medium: number;
    minor: number;
    open: number;
    fixed: number;
  } {
    return {
      total: this.bugs.length,
      critical: this.bugs.filter(b => b.severity === 'Critical').length,
      major: this.bugs.filter(b => b.severity === 'Major').length,
      medium: this.bugs.filter(b => b.severity === 'Medium').length,
      minor: this.bugs.filter(b => b.severity === 'Minor').length,
      open: this.bugs.filter(b => b.status === 'Open').length,
      fixed: this.bugs.filter(b => b.status === 'Fixed').length,
    };
  }

  /**
   * Export bugs in markdown format
   */
  exportBugsMarkdown(): string {
    let md = '# PLP QA Bug Report\n\n';
    md += `Generated: ${new Date().toISOString()}\n`;
    md += `Total Bugs: ${this.bugs.length}\n\n`;

    const summary = this.generateBugSummary();
    md += '## Summary\n';
    md += `- Critical: ${summary.critical}\n`;
    md += `- Major: ${summary.major}\n`;
    md += `- Medium: ${summary.medium}\n`;
    md += `- Minor: ${summary.minor}\n`;
    md += `- Open: ${summary.open}\n`;
    md += `- Fixed: ${summary.fixed}\n\n`;

    // Group by severity
    const severities = ['Critical', 'Major', 'Medium', 'Minor'];
    for (const severity of severities) {
      const severityBugs = this.bugs.filter(b => b.severity === severity);
      if (severityBugs.length === 0) continue;

      md += `## ${severity} (${severityBugs.length})\n\n`;
      for (const bug of severityBugs) {
        md += this.formatBugMarkdown(bug);
      }
    }

    return md;
  }

  private formatBugMarkdown(bug: BugReport): string {
    let md = `### ${bug.bugId}: ${bug.title}\n\n`;
    md += `**Priority**: ${bug.priority} | **Severity**: ${bug.severity} | **Status**: ${bug.status}\n\n`;
    md += `**URL**: ${bug.url}\n`;
    md += `**Category**: ${bug.categoryId}\n`;
    md += `**Locale**: ${bug.locale} | **Viewport**: ${bug.viewport} | **Browser**: ${bug.browser}\n`;
    md += `**Reproducibility**: ${bug.reproducibility}\n\n`;

    md += `**Steps to Reproduce**:\n`;
    for (let i = 0; i < bug.stepsToReproduce.length; i++) {
      md += `${i + 1}. ${bug.stepsToReproduce[i]}\n`;
    }

    md += `\n**Expected Result**:\n${bug.expectedResult}\n\n`;
    md += `**Actual Result**:\n${bug.actualResult}\n\n`;
    md += `**Business Impact**:\n${bug.businessImpact}\n\n`;

    if (bug.screenshotPath) {
      md += `**Screenshot**: ${bug.screenshotPath}\n\n`;
    }

    if (bug.consoleErrors && bug.consoleErrors.length > 0) {
      md += `**Console Errors**:\n\`\`\`\n${bug.consoleErrors.join('\n')}\n\`\`\`\n\n`;
    }

    md += '---\n\n';
    return md;
  }

  /**
   * Private helpers
   */

  private generateBugId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `BUG-PLP-${timestamp}-${random}`.toUpperCase();
  }

  private loadBugs(): void {
    if (fs.existsSync(this.bugsFile)) {
      const content = fs.readFileSync(this.bugsFile, 'utf-8');
      this.bugs = JSON.parse(content);
    }
  }

  private saveBugs(): void {
    const dir = path.dirname(this.bugsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.bugsFile, JSON.stringify(this.bugs, null, 2));
  }
}
