/**
 * Environment Verification Script
 * Checks that all prerequisites are met before running tests
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: string;
}

const results: VerificationResult[] = [];

function checkNodeVersion() {
  const version = process.version;
  const majorVersion = parseInt(version.split('.')[0].substring(1));
  if (majorVersion >= 18) {
    results.push({
      name: 'Node.js Version',
      status: 'PASS',
      message: `Node.js ${version} (required: 18+)`,
    });
  } else {
    results.push({
      name: 'Node.js Version',
      status: 'FAIL',
      message: `Node.js ${version} (required: 18+)`,
    });
  }
}

function checkFileExists(filePath: string, name: string) {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    results.push({
      name: `File: ${name}`,
      status: 'PASS',
      message: `Found at ${filePath}`,
    });
    return true;
  } else {
    results.push({
      name: `File: ${name}`,
      status: 'FAIL',
      message: `Missing: ${filePath}`,
    });
    return false;
  }
}

function checkDirectoryExists(dirPath: string, name: string) {
  const fullPath = path.resolve(dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    results.push({
      name: `Directory: ${name}`,
      status: 'PASS',
      message: `Found at ${dirPath}`,
    });
    return true;
  } else {
    results.push({
      name: `Directory: ${name}`,
      status: 'FAIL',
      message: `Missing: ${dirPath}`,
    });
    return false;
  }
}

function checkEnvFile() {
  const envExists = fs.existsSync('.env');
  if (envExists) {
    const envContent = fs.readFileSync('.env', 'utf-8');
    if (envContent.includes('BASE_URL')) {
      results.push({
        name: 'Environment Configuration',
        status: 'PASS',
        message: '.env file exists with BASE_URL',
      });
      return true;
    } else {
      results.push({
        name: 'Environment Configuration',
        status: 'FAIL',
        message: '.env file exists but missing BASE_URL',
      });
      return false;
    }
  } else {
    results.push({
      name: 'Environment Configuration',
      status: 'FAIL',
      message: '.env file not found',
      details: 'Create .env from .env.example',
    });
    return false;
  }
}

function checkNodeModules() {
  if (fs.existsSync('node_modules/@playwright')) {
    results.push({
      name: 'Dependencies',
      status: 'PASS',
      message: 'Playwright installed',
    });
    return true;
  } else {
    results.push({
      name: 'Dependencies',
      status: 'FAIL',
      message: 'Playwright not installed',
      details: 'Run: npm install',
    });
    return false;
  }
}

function checkPlaywrightBrowsers() {
  const browsersPath = path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    '.cache/ms-playwright'
  );
  if (fs.existsSync(browsersPath)) {
    results.push({
      name: 'Playwright Browsers',
      status: 'PASS',
      message: 'Browsers installed',
    });
  } else {
    results.push({
      name: 'Playwright Browsers',
      status: 'WARN',
      message: 'Browsers cache not found',
      details: 'Run: npx playwright install',
    });
  }
}

function printResults() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     AUTONOMOUS QA BOT - ENVIRONMENT VERIFICATION             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  for (const result of results) {
    const icon =
      result.status === 'PASS'
        ? '✓'
        : result.status === 'FAIL'
          ? '✗'
          : '⚠';
    const color =
      result.status === 'PASS'
        ? '\x1b[32m'
        : result.status === 'FAIL'
          ? '\x1b[31m'
          : '\x1b[33m';
    const reset = '\x1b[0m';

    console.log(`${color}${icon}${reset} ${result.name.padEnd(40)} ${result.message}`);
    if (result.details) {
      console.log(`  └─ ${result.details}`);
    }

    if (result.status === 'PASS') passCount++;
    else if (result.status === 'FAIL') failCount++;
    else warnCount++;
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`✓ Passed: ${passCount} | ✗ Failed: ${failCount} | ⚠ Warnings: ${warnCount}`);
  console.log('─'.repeat(60));

  if (failCount === 0) {
    console.log(
      '\n✓ Environment ready! Next step: npm run test:discovery\n'
    );
    process.exit(0);
  } else {
    console.log('\n✗ Please fix the above issues before running tests.\n');
    process.exit(1);
  }
}

console.log('Starting environment verification...\n');

// Run all checks
checkNodeVersion();
checkFileExists('package.json', 'package.json');
checkFileExists('tsconfig.json', 'tsconfig.json');
checkFileExists('playwright.config.ts', 'playwright.config.ts');
checkFileExists('.env.example', '.env.example');
checkDirectoryExists('tests', 'tests/');
checkDirectoryExists('evidence', 'evidence/');
checkDirectoryExists('state', 'state/');
checkDirectoryExists('reports', 'reports/');
checkEnvFile();
checkNodeModules();
checkPlaywrightBrowsers();

// Print results
printResults();
