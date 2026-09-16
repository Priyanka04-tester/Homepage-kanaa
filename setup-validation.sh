#!/bin/bash
# QA Bot Setup Validation Script
# This script validates that the project is properly configured

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     AUTONOMOUS QA BOT - SETUP VALIDATION                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "→ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js 18+"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✓ Node.js $NODE_VERSION found"

# Check npm
echo "→ Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "✗ npm not found."
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "✓ npm $NPM_VERSION found"

# Check required files
echo ""
echo "→ Checking required configuration files..."
files=(
    "package.json"
    "tsconfig.json"
    "playwright.config.ts"
    ".env.example"
    ".gitignore"
    "CLAUDE.md"
    "README.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
        exit 1
    fi
done

# Check directories
echo ""
echo "→ Checking required directories..."
dirs=(
    "state"
    "evidence"
    "evidence/homepage"
    "tests"
    "tests/homepage"
    "pages"
    "agents"
    "requirements"
    "specs"
    "reports"
)

for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✓ $dir/ exists"
    else
        echo "✗ $dir/ missing"
        exit 1
    fi
done

# Check state files
echo ""
echo "→ Checking state files..."
state_files=(
    "state/requirements.json"
    "state/scenarios.json"
    "state/test-cases.json"
    "state/executions.json"
    "state/bugs.json"
    "state/traceability.json"
    "state/homepage-map.json"
)

for file in "${state_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
        exit 1
    fi
done

# Check .env file
echo ""
echo "→ Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠ .env file not found"
    echo "  Creating .env from .env.example..."
    cp .env.example .env
    echo "✓ .env created (please configure BASE_URL if needed)"
else
    if grep -q "BASE_URL" .env; then
        BASE_URL=$(grep "^BASE_URL=" .env | cut -d'=' -f2)
        echo "✓ .env configured with BASE_URL=$BASE_URL"
    else
        echo "⚠ .env exists but missing BASE_URL"
        echo "  Please add: BASE_URL=https://thekanaa.com/en-sa/"
    fi
fi

# Check node_modules
echo ""
echo "→ Checking dependencies..."
if [ -d "node_modules/@playwright" ]; then
    echo "✓ Playwright installed"
else
    echo "⚠ Playwright not installed"
    echo "  Run: npm install"
fi

# Test URL connectivity
echo ""
echo "→ Testing URL connectivity..."
BASE_URL=$(grep "^BASE_URL=" .env | cut -d'=' -f2 || echo "https://thekanaa.com/en-sa/")
if command -v curl &> /dev/null; then
    if curl -s -I "$BASE_URL" | grep -q "HTTP"; then
        echo "✓ $BASE_URL is accessible"
    else
        echo "⚠ Could not connect to $BASE_URL"
        echo "  Verify URL is correct in .env"
    fi
else
    echo "⚠ curl not available, skipping connectivity check"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              SETUP VALIDATION COMPLETE                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Verify BASE_URL in .env is correct"
echo "2. Run: npm install"
echo "3. Run: npx playwright install"
echo "4. Run: npm run test:smoke"
echo ""
