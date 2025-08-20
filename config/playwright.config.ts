import { PlaywrightTestConfig } from '@playwright/test';
import path from 'path';

const config: PlaywrightTestConfig = {
  testDir: '../features',
  timeout: parseInt(process.env.TEST_TIMEOUT || '120000'),
  expect: {
    timeout: 15000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : parseInt(process.env.RETRY_COUNT || '1'),
  workers: process.env.CI ? 1 : parseInt(process.env.PARALLEL_WORKERS || '1'),
  reporter: [
    ['html', { outputFolder: 'reports/html-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://app.rudderstack.com',
    headless: process.env.HEADLESS !== 'false',
    viewport: { 
      width: parseInt(process.env.VIEWPORT_WIDTH || '1920'), 
      height: parseInt(process.env.VIEWPORT_HEIGHT || '1080') 
    },
    actionTimeout: 30000,
    navigationTimeout: 60000,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...require('@playwright/test').devices['Desktop Chrome'],
        channel: 'chrome'
      },
    },
    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...require('@playwright/test').devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...require('@playwright/test').devices['Desktop Safari'] },
    // },
  ],
  outputDir: 'reports/test-results/',
};

export default config;
