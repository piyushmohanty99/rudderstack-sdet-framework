import { Page } from 'playwright';
import { BasePage } from './BasePage';
import { TestLogger } from '../utils/Logger';

export class LoginPage extends BasePage {
  private readonly emailInput = 'input[type="email"], input[name="email"], #email';
  private readonly passwordInput = 'input[type="password"], input[name="password"], #password';
  private readonly loginButton = 'button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), .ant-btn-primary';
  private readonly errorMessage = '.ant-form-item-explain-error, .error-message, [role="alert"]';
  private readonly signUpLink = 'a:has-text("Sign up"), a:has-text("Create account")';

  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin(): Promise<void> {
    TestLogger.getInstance().info('Navigating to login page');
    await this.navigateTo(`${this.config.getBaseUrl()}/login`);
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Wait for any of the expected login elements
    try {
      await Promise.race([
        this.page.waitForSelector(this.emailInput, { timeout: 15000 }),
        this.page.waitForSelector(this.loginButton, { timeout: 15000 }),
        this.page.waitForSelector('form', { timeout: 15000 })
      ]);
      TestLogger.getInstance().info('Login page loaded successfully');
    } catch (error) {
      TestLogger.getInstance().error('Login page elements not found, page may have loaded differently');
      // Continue execution to allow inspection of actual page structure
    }
  }

  async isLoaded(): Promise<boolean> {
    try {
      // Try multiple selectors that could indicate a login page
      const selectors = [
        this.emailInput,
        this.loginButton,
        'form[action*="login"]',
        'form:has(input[type="password"])',
        '[data-testid*="login"]',
        '.login-form'
      ];

      for (const selector of selectors) {
        if (await this.page.isVisible(selector)) {
          TestLogger.getInstance().info(`Login page confirmed with selector: ${selector}`);
          return true;
        }
      }
      
      TestLogger.getInstance().warn('No login page indicators found');
      return false;
    } catch (error) {
      TestLogger.getInstance().error('Error checking if login page is loaded', { error });
      return false;
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    TestLogger.getInstance().info('Attempting to log in', { email });
    
    try {
      // Ensure we're on the login page
      if (!await this.isLoaded()) {
        await this.navigateToLogin();
      }

      // Wait for form to be stable
      await this.page.waitForTimeout(2000);

      // Try to find and fill email field
      const emailFound = await this.tryFillField(this.emailInput, email, 'email');
      if (!emailFound) {
        throw new Error('Could not find email input field');
      }

      // Try to find and fill password field
      const passwordFound = await this.tryFillField(this.passwordInput, password, 'password');
      if (!passwordFound) {
        throw new Error('Could not find password input field');
      }

      // Submit the form
      const submitted = await this.trySubmitForm();
      if (!submitted) {
        throw new Error('Could not submit login form');
      }

      // Wait for navigation or error
      await Promise.race([
        this.page.waitForURL('**/connections', { timeout: 15000 }),
        this.page.waitForURL('**/dashboard', { timeout: 15000 }),
        this.page.waitForSelector(this.errorMessage, { timeout: 5000 })
      ]);

      // Check if we're now logged in (not on login page anymore)
      const currentUrl = this.page.url();
      const isLoggedIn = !currentUrl.includes('/login') && 
                        (currentUrl.includes('/connections') || currentUrl.includes('/dashboard'));

      if (isLoggedIn) {
        TestLogger.getInstance().info('Login successful');
        return true;
      } else {
        const errorExists = await this.page.isVisible(this.errorMessage);
        if (errorExists) {
          const errorText = await this.page.textContent(this.errorMessage);
          TestLogger.getInstance().error('Login failed with error', { error: errorText });
        }
        return false;
      }

    } catch (error) {
      TestLogger.getInstance().error('Login process failed', { error });
      return false;
    }
  }

  private async tryFillField(selector: string, value: string, fieldName: string): Promise<boolean> {
    const selectors = selector.split(', ');
    
    for (const sel of selectors) {
      try {
        if (await this.page.isVisible(sel.trim())) {
          await this.page.fill(sel.trim(), value);
          TestLogger.getInstance().info(`Successfully filled ${fieldName} field with selector: ${sel.trim()}`);
          return true;
        }
      } catch (error) {
        TestLogger.getInstance().debug(`Failed to fill ${fieldName} with selector ${sel.trim()}`, { error });
      }
    }
    
    TestLogger.getInstance().error(`Could not find visible ${fieldName} field`);
    return false;
  }

  private async trySubmitForm(): Promise<boolean> {
    const submitSelectors = [
      this.loginButton,
      'button[type="submit"]',
      'input[type="submit"]',
      'form button:last-child',
      'button:has-text("Sign in")',
      'button:has-text("Log in")'
    ];

    for (const selector of submitSelectors) {
      const selectors = selector.split(', ');
      for (const sel of selectors) {
        try {
          if (await this.page.isVisible(sel.trim())) {
            await this.page.click(sel.trim());
            TestLogger.getInstance().info(`Successfully clicked submit button with selector: ${sel.trim()}`);
            return true;
          }
        } catch (error) {
          TestLogger.getInstance().debug(`Failed to click submit with selector ${sel.trim()}`, { error });
        }
      }
    }

    // Try submitting by pressing Enter on password field
    try {
      await this.page.press(this.passwordInput, 'Enter');
      TestLogger.getInstance().info('Submitted form by pressing Enter on password field');
      return true;
    } catch (error) {
      TestLogger.getInstance().error('Could not submit form', { error });
      return false;
    }
  }

  async getErrorMessage(): Promise<string> {
    try {
      if (await this.page.isVisible(this.errorMessage)) {
        return await this.page.textContent(this.errorMessage) || '';
      }
      return '';
    } catch {
      return '';
    }
  }

  async isErrorDisplayed(): Promise<boolean> {
    try {
      return await this.page.isVisible(this.errorMessage);
    } catch {
      return false;
    }
  }
}
