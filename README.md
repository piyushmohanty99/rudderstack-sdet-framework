# RudderStack SDET Automation Framework

A production-grade test automation framework for RudderStack using Playwright, CucumberJS, and TypeScript.

## 🏗️ Architecture Overview

This framework implements a hybrid testing approach combining:
- **UI Automation**: Playwright with Page Object Model
- **API Testing**: Direct RudderStack HTTP API integration
- **BDD Testing**: CucumberJS with Gherkin scenarios
- **TypeScript**: Strict type checking and modern JavaScript features

## 📋 Features

✅ **Multi-Browser Support**: Chrome, Firefox, Safari, Mobile  
✅ **Multi-Environment**: DEV, QA, PROD configurations  
✅ **Page Object Model**: Maintainable and reusable UI components  
✅ **API Integration**: Direct RudderStack API testing  
✅ **Webhook Testing**: RequestCatcher and Webhook.site integration  
✅ **Advanced Reporting**: Allure reports with screenshots and videos  
✅ **CI/CD Ready**: GitHub Actions with matrix builds  
✅ **Comprehensive Logging**: Winston-based structured logging  

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **RudderStack Account**: With valid business email credentials

### 1. Clone/Download Project

```bash
# Create project directory
mkdir rudderstack-sdet-framework
cd rudderstack-sdet-framework

# Initialize git repository
git init
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your RudderStack credentials
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
```env
# RudderStack Configuration
RUDDERSTACK_DATA_PLANE_URL=https://your-data-plane-url.com
RUDDERSTACK_WRITE_KEY=your-write-key-here
RUDDERSTACK_USERNAME=your-email@company.com
RUDDERSTACK_PASSWORD=your-password

# Environment Configuration
NODE_ENV=dev
ENVIRONMENT=dev
BASE_URL=https://app.rudderstack.com

# Browser Configuration
HEADLESS=true
BROWSER=chromium
TIMEOUT=30000
```

### 4. First Test Run

```bash
# Run smoke tests
npm run test:smoke

# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed
```

## 🧪 Test Execution

### Test Categories

```bash
# Smoke tests (critical functionality)
npm run test:smoke

# Regression tests (comprehensive coverage)
npm run test:regression

# API tests only
npm run test:api

# UI tests only  
npm run test:ui
```

### Browser Testing

```bash
# Test in Chrome
npm run test:chrome

# Test in Firefox
npm run test:firefox

# Test in Safari
npm run test:safari

# Parallel execution
npm run test:parallel
```

### Environment Testing

```bash
# Test in DEV environment
ENVIRONMENT=dev npm test

# Test in QA environment  
ENVIRONMENT=qa npm test

# Test in PROD environment
ENVIRONMENT=prod npm test
```

## 📊 Reports and Debugging

### Generate Reports

```bash
# Generate Allure report
npm run report

# Open Allure report
npm run report:open

# Clean previous reports
npm run clean
```

### Debug Mode

```bash
# Run with debug output
DEBUG=pw:api npm test

# Run in headed mode with slow motion
HEADLESS=false npm test

# Take screenshots on each step
SCREENSHOTS=true npm test
```

## 🔧 Development Guide

### Project Structure

```
rudderstack-sdet-framework/
├── src/
│   ├── pages/           # Page Object Model classes
│   ├── utils/           # Utility functions and helpers
│   ├── hooks/           # Test lifecycle hooks
│   └── types/           # TypeScript type definitions
├── features/            # BDD feature files and step definitions
├── config/              # Configuration files
├── reports/             # Generated test reports
├── .github/workflows/   # CI/CD pipeline
└── tests/               # Additional test files
```

### Adding New Tests

1. **Create Feature File**:
```gherkin
# features/new-feature.feature
@smoke
Feature: New Feature
  Scenario: Test new functionality
    Given I have the required setup
    When I perform an action
    Then I should see expected result
```

2. **Implement Step Definitions**:
```typescript
// features/step-definitions/new-feature.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';

Given('I have the required setup', async function () {
  // Implementation
});
```

3. **Create Page Objects** (if needed):
```typescript
// src/pages/NewPage.ts
import { BasePage } from './BasePage';

export class NewPage extends BasePage {
  // Page-specific methods
}
```

### Adding New Page Objects

1. **Extend BasePage**:
```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  private readonly myElement = '[data-testid="my-element"]';

  constructor(page: Page) {
    super(page);
  }

  public async isLoaded(): Promise<boolean> {
    return await this.isVisible(this.myElement);
  }
}
```

2. **Use in Step Definitions**:
```typescript
import { MyPage } from '@pages/MyPage';

let myPage: MyPage;

function initializeObjects() {
  const context = getTestContext();
  myPage = new MyPage(context.page);
}
```

## 🚀 CI/CD Pipeline

### GitHub Actions Setup

1. **Add Repository Secrets**:
   - `RUDDERSTACK_USERNAME`
   - `RUDDERSTACK_PASSWORD` 
   - `RUDDERSTACK_DATA_PLANE_URL`
   - `RUDDERSTACK_WRITE_KEY`
   - `SLACK_WEBHOOK_URL` (optional)
   - `EMAIL_USERNAME` (optional)
   - `EMAIL_PASSWORD` (optional)

2. **Pipeline Features**:
   - ✅ Pull request validation
   - ✅ Daily scheduled runs (2 AM UTC)
   - ✅ Manual trigger capability
   - ✅ Matrix builds (multiple browsers/environments)
   - ✅ Artifact collection (reports, screenshots)
   - ✅ Slack/email notifications on failures
   - ✅ GitHub Pages deployment for reports

### Local CI Testing

```bash
# Run tests as CI would
CI=true HEADLESS=true npm test

# Test specific browser matrix
BROWSER=firefox npm run test:smoke
```

## 🔒 Security Best Practices

- ✅ Never commit credentials to Git
- ✅ Use environment variables for sensitive data
- ✅ Store CI/CD secrets in GitHub Secrets
- ✅ Implement credential validation
- ✅ Use secure API key management

## 📝 Configuration Guide

### Browser Configuration

```typescript
// config/playwright.config.ts
export default defineConfig({
  use: {
    headless: process.env.HEADLESS !== 'false',
    viewport: { width: 1920, height: 1080 },
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
```

### Environment Configuration

```typescript
// config/environments.ts
export const environments = {
  dev: {
    baseUrl: 'https://app-dev.rudderstack.com',
    dataPlaneUrl: 'https://dev-dataplane.rudderstack.com',
    // ... other config
  },
  // ... other environments
};
```

## 🐛 Troubleshooting

### Common Issues

**1. Browser Installation Issues**
```bash
# Reinstall browsers
npx playwright install --force

# Install system dependencies (Linux)
npx playwright install-deps
```

**2. Environment Variable Issues**
```bash
# Check if .env file exists
ls -la .env

# Validate environment variables
npm run test -- --dry-run
```

**3. Permission Issues**
```bash
# Fix permissions (Unix/Linux)
chmod +x node_modules/.bin/playwright
```

**4. Port Conflicts**
```bash
# Kill processes using port 3000
lsof -ti:3000 | xargs kill -9
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=pw:api,pw:browser npm test

# Run single test with debug
npm test -- --grep "specific test name"

# Generate trace files
TRACES=true npm test
```

### Performance Issues

```bash
# Reduce parallel workers
PARALLEL_WORKERS=1 npm test

# Disable video recording
VIDEOS=false npm test

# Run tests serially
npm test -- --workers=1
```

### Getting Help

1. **Check Logs**: `reports/logs/application.log`
2. **Review Screenshots**: `reports/screenshots/`
3. **Examine Traces**: `test-results/`
4. **Debug Output**: `DEBUG=* npm test`

### Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Write tests for new functionality
4. Ensure all tests pass: `npm test`
5. Run linting: `npm run lint`
6. Submit pull request

## 🏆 Quality Gates

This framework meets Series B startup standards:
- ✅ Production-ready code (no TODOs/placeholders)
- ✅ Comprehensive error handling
- ✅ Type-safe TypeScript implementation
- ✅ SOLID principles adherence
- ✅ Comprehensive test coverage
- ✅ CI/CD pipeline integration
- ✅ Advanced reporting and monitoring

---
