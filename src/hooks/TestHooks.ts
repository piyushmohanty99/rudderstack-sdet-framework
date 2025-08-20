import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright';
import { TestLogger } from '../utils/Logger';
import { ConfigManager } from '../utils/ConfigManager';
import { LoginPage } from '../pages/LoginPage';
import { ConnectionsPage } from '../pages/ConnectionsPage';
import { SourcePage } from '../pages/SourcePage';
import { DestinationPage } from '../pages/DestinationPage';
import { ApiHelper } from '../utils/ApiHelper';
import { WebhookHelper } from '../utils/WebhookHelper';
import { DataStorage } from '../utils/DataStorage';

import { setDefaultTimeout } from '@cucumber/cucumber';
setDefaultTimeout(60 * 1000); // 60 seconds

let browser: Browser;
let context: BrowserContext;

BeforeAll(async function () {
  TestLogger.getInstance().info('Starting test execution');
  
  const browserType = process.env.BROWSER || 'chromium';
  const headless = process.env.HEADLESS !== 'false';
  
  TestLogger.getInstance().info('Launching browser', { browserType, headless });
  
  switch (browserType) {
    case 'firefox':
      browser = await firefox.launch({ headless });
      break;
    case 'webkit':
      browser = await webkit.launch({ headless });
      break;
    default:
      browser = await chromium.launch({ headless });
  }
  
  TestLogger.getInstance().info(`${browserType} browser launched successfully`);
  
  // Create persistent context for better session management
  context = await browser.newContext({
    viewport: { 
      width: parseInt(process.env.VIEWPORT_WIDTH || '1920'), 
      height: parseInt(process.env.VIEWPORT_HEIGHT || '1080') 
    },
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    recordVideo: process.env.CI === 'true' ? {
      dir: 'reports/videos/',
      size: { width: 1920, height: 1080 }
    } : undefined
  });
  
  TestLogger.getInstance().info('Test environment initialized successfully');
});

Before(async function (scenario) {
  const testId = `${scenario.pickle.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  this.testId = testId;
  
  TestLogger.getInstance().info(`🟢 START TEST: ${scenario.pickle.name}`);
  TestLogger.getInstance().info('Starting scenario', {
    testId,
    tags: scenario.pickle.tags.map(tag => tag.name),
    uri: scenario.pickle.uri
  });
  
  TestLogger.getInstance().info('Test context created', { testId });

  // Create a new page for this scenario
  this.page = await context.newPage();
  
  // Set up page event listeners for debugging
  this.page.on('console', (msg: import('playwright').ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      TestLogger.getInstance().error('Browser console error', { text, testId });
    } else if (type === 'warning') {
      TestLogger.getInstance().warn('Browser console warning', { text, testId });
    } else {
      TestLogger.getInstance().debug('Browser console log', { type, text, testId });
    }
  });
  
  this.page.on('requestfailed', (request: import('playwright').Request) => {
    TestLogger.getInstance().warn('Request failed', {
      url: request.url(),
      testId,
      method: request.method(),
      failure: request.failure()?.errorText
    });
  });
  
  this.page.on('response', (response: import('playwright').Response) => {
    if (response.request().resourceType() === 'xhr' || response.request().resourceType() === 'fetch') {
      const responseTime = Date.now() - (response.request() as any)._startTime;
      if (responseTime > 5000) {
        TestLogger.getInstance().warn('Slow request detected', {
          url: response.url(),
          testId,
          responseTime,
          method: response.request().method()
        });
      }
    }
  });

  // Initialize configuration
  this.config = ConfigManager.getInstance().getConfig();
  
  // Initialize page objects
  this.loginPage = new LoginPage(this.page);
  this.connectionsPage = new ConnectionsPage(this.page);
  this.sourcePage = new SourcePage(this.page);
  this.destinationPage = new DestinationPage(this.page);
  
  // Initialize utilities
  this.dataStorage = DataStorage.getInstance();
  
  // Initialize API helper with data plane URL
  const dataPlaneUrl = process.env.RUDDERSTACK_DATA_PLANE_URL || 'https://hosted.rudderlabs.com';
  this.apiHelper = new ApiHelper(dataPlaneUrl);
  
  // Initialize webhook helper if needed
  const webhookUrl = process.env.REQUEST_CATCHER_URL;
  if (webhookUrl) {
    this.webhookHelper = new WebhookHelper(webhookUrl);
  }
  
  // Initialize test data
  this.credentials = {
    email: process.env.RUDDERSTACK_USERNAME,
    password: process.env.RUDDERSTACK_PASSWORD
  };
  
  // Helper function for calling other steps
  this.step = async (stepText: string) => {
    TestLogger.getInstance().debug('Calling step', { stepText, testId });
    // This would be implemented by cucumber framework
    return Promise.resolve();
  };
  
  // Helper to generate test write keys
  this.generateTestWriteKey = () => {
    return process.env.RUDDERSTACK_WRITE_KEY || 
           'test_' + Math.random().toString(36).substr(2, 32);
  };
});

After(async function (scenario) {
  const testId = this.testId;
  const duration = scenario.result?.duration || 0;
  const status = scenario.result?.status || 'unknown';
  
  TestLogger.getInstance().info(`🔴 END TEST: ${scenario.pickle.name} - Status: ${status} - Duration: ${duration}ms`);

  // Take screenshot on failure
  if (scenario.result?.status === 'FAILED' && this.page) {
    try {
      const screenshotPath = `reports/screenshots/failure-${scenario.pickle.name
        .toLowerCase()
        .replace(/\s+/g, '-')}-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
      
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      TestLogger.getInstance().info('Test failed. Screenshot saved', { path: screenshotPath });
      
      // Attach screenshot to cucumber report
      this.attach(await this.page.screenshot({ fullPage: true }), 'image/png');
    } catch (error) {
      TestLogger.getInstance().error('Failed to take screenshot', { error });
    }
  }
  
  // Log test metrics
  const metrics = {
    testId,
    avgResponseTime: this.avgResponseTime || 0
  };
  
  TestLogger.getInstance().info('Test metrics', metrics);
  TestLogger.getInstance().info(`❌ Scenario completed: ${scenario.pickle.name}`, {
    testId,
    status,
    duration
  });
  
  // Close the page
  if (this.page) {
    await this.page.close();
  }
});

AfterAll(async function () {
  TestLogger.getInstance().info('Cleaning up test environment');
  
  // Export session data if needed
  const sessionData = DataStorage.getInstance().exportData();
  TestLogger.getInstance().info('Session data exported to', { path: sessionData.path });
  
  // Close browser context and browser
  if (context) {
    await context.close();
    TestLogger.getInstance().info('Browser context closed');
  }
  
  if (browser) {
    await browser.close();
    TestLogger.getInstance().info('Browser closed');
  }
  
  TestLogger.getInstance().info('Test environment cleanup completed');
});
