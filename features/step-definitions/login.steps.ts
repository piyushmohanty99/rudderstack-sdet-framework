import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { TestLogger } from '../../src/utils/Logger';

// Remove any logger initialization attempts - use singleton directly
Given('I have a valid RudderStack business email account', function () {
  TestLogger.getInstance().info('Setting up valid RudderStack credentials');
  
  this.credentials = {
    email: process.env.RUDDERSTACK_USERNAME || 'test@business-domain.com',
    password: process.env.RUDDERSTACK_PASSWORD || 'TestPassword123!'
  };
  
  TestLogger.getInstance().info('Valid RudderStack credentials confirmed', { 
    email: this.credentials.email 
  });
});

When('I log in to the application', async function () {
  TestLogger.getInstance().info('Attempting to log in to RudderStack');
  
  await this.loginPage.navigateToLogin();
  
  const loginSuccess = await this.loginPage.login(
    this.credentials.email, 
    this.credentials.password
  );
  
  expect(loginSuccess).toBe(true);
  TestLogger.getInstance().info('Login successful');
});

When('I try to log in with invalid credentials', async function () {
  TestLogger.getInstance().info('Attempting login with invalid credentials');
  
  await this.loginPage.navigateToLogin();
  
  const invalidCredentials = {
    email: 'invalid@email.com',
    password: 'wrongpassword'
  };
  
  this.loginSuccess = await this.loginPage.login(
    invalidCredentials.email,
    invalidCredentials.password
  );
});

Given('I am logged in to the application', async function () {
  TestLogger.getInstance().info('Ensuring user is logged in');
  
  // Check if already logged in
  const currentUrl = this.page.url();
  if (!currentUrl.includes('/login') && 
      (currentUrl.includes('/connections') || currentUrl.includes('/dashboard'))) {
    TestLogger.getInstance().info('User already logged in');
    return;
  }
  
  // Otherwise, perform login
  await this.loginPage.navigateToLogin();
  const loginSuccess = await this.loginPage.login(
    this.credentials.email,
    this.credentials.password
  );
  
  expect(loginSuccess).toBe(true);
  TestLogger.getInstance().info('User login confirmed');
});

Then('I should be successfully logged in', async function () {
  TestLogger.getInstance().info('Validating successful login');
  
  // Wait for redirect after login
  await this.page.waitForTimeout(3000);
  
  const currentUrl = this.page.url();
  const isLoggedIn = !currentUrl.includes('/login') && 
                    (currentUrl.includes('/connections') || 
                     currentUrl.includes('/dashboard') || 
                     currentUrl.includes('/app'));
  
  expect(isLoggedIn).toBe(true);
  TestLogger.getInstance().info('Login validation successful', { currentUrl });
});

Then('I should see an error message', async function () {
  TestLogger.getInstance().info('Checking for error message');
  
  const errorDisplayed = await this.loginPage.isErrorDisplayed();
  expect(errorDisplayed).toBe(true);
  
  const errorMessage = await this.loginPage.getErrorMessage();
  expect(errorMessage.length).toBeGreaterThan(0);
  
  TestLogger.getInstance().info('Error message confirmed', { message: errorMessage });
});

Then('I should remain on the login page', async function () {
  TestLogger.getInstance().info('Validating user remains on login page');
  
  await this.page.waitForTimeout(2000);
  
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/login');
  
  const loginPageLoaded = await this.loginPage.isLoaded();
  expect(loginPageLoaded).toBe(true);
});

When('I navigate to the connections page', async function () {
  TestLogger.getInstance().info('Navigating to connections page');
  
  await this.connectionsPage.navigateToConnections();
});

Then('I should be able to navigate to the connections page', async function () {
  TestLogger.getInstance().info('Validating navigation to connections page');
  
  await this.connectionsPage.navigateToConnections();
  
  const isLoaded = await this.connectionsPage.isLoaded();
  expect(isLoaded).toBe(true);
  
  TestLogger.getInstance().info('Connections page navigation successful');
});

Then('I should see the data plane URL in the top right corner', async function () {
  TestLogger.getInstance().info('Looking for data plane URL');
  
  const dataPlaneUrl = await this.connectionsPage.getDataPlaneUrl();
  expect(dataPlaneUrl).toBeDefined();
  expect(dataPlaneUrl.length).toBeGreaterThan(0);
  expect(dataPlaneUrl).toMatch(/^https?:\/\//);
  
  // Store for later use
  this.extractedDataPlaneUrl = dataPlaneUrl;
  
  TestLogger.getInstance().info('Data plane URL found', { url: dataPlaneUrl });
});

Then('I should see the connections dashboard', async function () {
  TestLogger.getInstance().info('Validating connections dashboard');
  
  const isLoaded = await this.connectionsPage.isLoaded();
  expect(isLoaded).toBe(true);
  
  // Check for key dashboard elements
  const hasAddSourceButton = await this.connectionsPage.hasAddSourceButton();
  const hasAddDestinationButton = await this.connectionsPage.hasAddDestinationButton();
  
  expect(hasAddSourceButton || hasAddDestinationButton).toBe(true);
  
  TestLogger.getInstance().info('Connections dashboard validated');
});

Then('I should see options to add sources and destinations', async function () {
  TestLogger.getInstance().info('Checking for add source and destination options');
  
  const hasAddSourceButton = await this.connectionsPage.hasAddSourceButton();
  const hasAddDestinationButton = await this.connectionsPage.hasAddDestinationButton();
  
  expect(hasAddSourceButton).toBe(true);
  expect(hasAddDestinationButton).toBe(true);
  
  TestLogger.getInstance().info('Add source and destination options confirmed');
});

Then('I should see the data plane URL displayed prominently', async function () {
  TestLogger.getInstance().info('Validating prominent data plane URL display');
  
  const dataPlaneUrl = await this.connectionsPage.getDataPlaneUrl();
  expect(dataPlaneUrl).toBeDefined();
  expect(dataPlaneUrl).toMatch(/^https?:\/\/.+/);
  
  TestLogger.getInstance().info('Data plane URL prominently displayed', { url: dataPlaneUrl });
});
