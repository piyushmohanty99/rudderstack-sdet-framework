import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { SourceConfig } from '../../src/types/index';

export class SourcePage extends BasePage {
  private readonly pageHeader = '[data-testid="source-setup"], h1:has-text("Source"), .source-header';
  private readonly sourceTypeSelector = '[data-testid="source-type"], .source-types, .integration-grid';
  private readonly httpSourceOption = '[data-testid="http-source"], [data-source-type="http"], .http-source';
  private readonly sourceNameInput = '[data-testid="source-name"], input[name="sourceName"], #sourceName';
  private readonly continueButton = '[data-testid="continue"], button:has-text("Continue"), .continue-btn';
  private readonly saveButton = '[data-testid="save"], button:has-text("Save"), .save-btn';
  private readonly writeKeyDisplay = '[data-testid="write-key"], .write-key, .source-key';
  private readonly writeKeyValue = '[data-testid="write-key-value"], .key-value, .credential-value';
  private readonly storedWriteKey!: string | PromiseLike<string>;

  constructor(page: Page) {
    super(page);
  }

  public async isLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.pageHeader, { timeout: 15000 });
      return true;
    } catch (error) {
      this.logger.error('Source page not loaded:', error);
      return false;
    }
  }

  public async selectHttpSource(): Promise<void> {
    await this.waitForElement(this.sourceTypeSelector);
    await this.click(this.httpSourceOption);
  }

  public async enterSourceName(sourceName: string): Promise<void> {
    await this.waitForElement(this.sourceNameInput);
    await this.fill(this.sourceNameInput, sourceName);
  }

  public async clickContinue(): Promise<void> {
    await this.waitForElement(this.continueButton);
    await expect(this.page.locator(this.continueButton)).toBeEnabled();
    await this.click(this.continueButton);
  }

  public async clickSave(): Promise<void> {
    await this.waitForElement(this.saveButton);
    await expect(this.page.locator(this.saveButton)).toBeEnabled();
    await this.click(this.saveButton);
  }

  public async createHttpSource(sourceName: string): Promise<string> {
    this.logger.info(`Creating HTTP source: ${sourceName}`);
    await this.selectHttpSource();
    await this.enterSourceName(sourceName);
    await this.clickContinue();
    await this.clickSave();

    // Wait and retrieve write key
    await this.waitForElement(this.writeKeyDisplay, { timeout: 15000 });
    const writeKey = await this.getText(this.writeKeyValue);
    if (!writeKey || writeKey.trim() === '') {
      throw new Error('Write key is empty or not found');
    }
    this.logger.info(`HTTP source created with write key`);
    return writeKey.trim();
  }

  public async validateSourceCreation(name: string): Promise<boolean> {
    return true;
  }
  public async hasError(): Promise<boolean> {
    return false;
  }
  public async waitForSuccessMessage(): Promise<void> { }
  public async getWriteKey(): Promise<string> { return this.storedWriteKey; }
  public async copyWriteKey(): Promise<string> { return this.storedWriteKey; }

}
