import { Page, Locator, expect } from '@playwright/test';
import { TestLogger } from '../../src/utils/Logger';
import { ConfigManager } from '../../src/utils/ConfigManager';

export abstract class BasePage {
  protected page: Page;
  protected logger: TestLogger;
  protected config: ConfigManager;
  protected timeout: number;

  constructor(page: Page) {
    this.page = page;
    this.logger = TestLogger.getInstance();
    this.config = ConfigManager.getInstance();
    this.timeout = this.config.getTimeout();
  }

  public async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
  public async clickButton(selector: string | Locator): Promise<void> {
    await this.click(selector);
  }

  public async waitForSelectorVisible(selector: string, timeout = 10000) {
  await this.page.waitForSelector(selector, { timeout, state: 'visible' });
}

  // Navigation methods
  public async navigateTo(url: string): Promise<void> {
    this.logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle', timeout: this.timeout });
    await this.waitForPageLoad();
  }

  public async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Element interaction methods
  protected async click(selector: string | Locator, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const elementName = typeof selector === 'string' ? selector : 'element';
    
    this.logger.debug(`Clicking on: ${elementName}`);
    await element.click({ 
      timeout: options?.timeout || this.timeout,
      force: options?.force || false
    });
  }

  protected async fill(selector: string | Locator, value: string, options?: { timeout?: number }): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const elementName = typeof selector === 'string' ? selector : 'element';
    
    this.logger.debug(`Filling ${elementName} with: ${value}`);
    await element.fill(value, { timeout: options?.timeout || this.timeout });
  }

  protected async type(selector: string | Locator, text: string, options?: { delay?: number; timeout?: number }): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const elementName = typeof selector === 'string' ? selector : 'element';
    
    this.logger.debug(`Typing in ${elementName}: ${text}`);
    await element.type(text, { 
      delay: options?.delay || 50,
      timeout: options?.timeout || this.timeout 
    });
  }

  protected async getText(selector: string | Locator): Promise<string> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.textContent() || '';
  }

  protected async getValue(selector: string | Locator): Promise<string> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.inputValue();
  }

  protected async getAttribute(selector: string | Locator, attribute: string): Promise<string | null> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.getAttribute(attribute);
  }

  // Wait methods
  protected async waitForElement(selector: string | Locator, options?: { state?: 'visible' | 'hidden' | 'attached' | 'detached'; timeout?: number }): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await element.waitFor({ 
      state: options?.state || 'visible',
      timeout: options?.timeout || this.timeout 
    });
  }

  protected async waitForText(selector: string | Locator, text: string, options?: { timeout?: number }): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(element).toContainText(text, { timeout: options?.timeout || this.timeout });
  }

  protected async waitForUrl(urlPattern: string | RegExp, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout: options?.timeout || this.timeout });
  }

  // Visibility and state checks
  protected async isVisible(selector: string | Locator): Promise<boolean> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.isVisible();
  }

  protected async isEnabled(selector: string | Locator): Promise<boolean> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.isEnabled();
  }

  protected async isChecked(selector: string | Locator): Promise<boolean> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.isChecked();
  }

  // Dropdown and selection methods
  protected async selectOption(selector: string | Locator, option: string | { label?: string; value?: string; index?: number }): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    
    if (typeof option === 'string') {
      await element.selectOption({ label: option });
    } else if (option.label) {
      await element.selectOption({ label: option.label });
    } else if (option.value) {
      await element.selectOption({ value: option.value });
    } else if (option.index !== undefined) {
      await element.selectOption({ index: option.index });
    }
  }

  // Screenshot methods
  protected async takeScreenshot(name?: string): Promise<string> {
    const screenshotName = name || `screenshot-${Date.now()}.png`;
    const screenshotPath = `reports/screenshots/${screenshotName}`;
    
    await this.page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    
    this.logger.info(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  // Scroll methods
  protected async scrollToElement(selector: string | Locator): Promise<void> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await element.scrollIntoViewIfNeeded();
  }

  protected async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  protected async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  // Dialog handling
  protected async handleDialog(accept: boolean = true, promptText?: string): Promise<void> {
    this.page.once('dialog', async dialog => {
      this.logger.info(`Dialog appeared: ${dialog.message()}`);
      if (dialog.type() === 'prompt' && promptText) {
        await dialog.accept(promptText);
      } else if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  // URL and navigation helpers
  public async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  public async getTitle(): Promise<string> {
    return await this.page.title();
  }

  public async goBack(): Promise<void> {
    await this.page.goBack();
  }

  public async goForward(): Promise<void> {
    await this.page.goForward();
  }

  public async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'networkidle' });
  }

  // Cookie methods
  protected async getCookies(): Promise<any[]> {
    return await this.page.context().cookies();
  }

  protected async setCookie(name: string, value: string, options?: any): Promise<void> {
    await this.page.context().addCookies([{
      name,
      value,
      url: this.page.url(),
      ...options
    }]);
  }

  // Local storage methods
  protected async getLocalStorageItem(key: string): Promise<string | null> {
    return await this.page.evaluate((key) => localStorage.getItem(key), key);
  }

  protected async setLocalStorageItem(key: string, value: string): Promise<void> {
    await this.page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key, value });
  }

  // Error handling and retry mechanism
  protected async retryAction<
    T>(
    action: () => Promise<T>, 
    maxRetries: number = 3, 
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Attempting action (attempt ${attempt}/${maxRetries})`);
        return await action();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Action failed on attempt ${attempt}:`, error);
        
        if (attempt < maxRetries) {
          await this.page.waitForTimeout(delayMs * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError || new Error('Action failed after all retries');
  }

  // Abstract method to be implemented by child classes
  public abstract isLoaded(): Promise<boolean>;
}
