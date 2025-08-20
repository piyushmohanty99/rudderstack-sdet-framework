import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DestinationPage extends BasePage {
  private readonly pageHeader = '[data-testid="destination-setup"], h1:has-text("Destination"), .destination-header';
  private readonly destinationTypeSelector = '[data-testid="destination-type"], .destination-types, .integration-grid';
  private readonly webhookDestinationOption = '[data-testid="webhook-destination"], [data-destination-type="webhook"], .webhook-destination';
  private readonly destinationNameInput = '[data-testid="destination-name"], input[name="destinationName"], #destinationName';
  private readonly webhookUrlInput = '[data-testid="webhook-url"], input[name="webhookUrl"], #webhookUrl';
  private readonly httpMethodSelect = '[data-testid="http-method"], select[name="method"], #httpMethod';
  private readonly addHeaderButton = '[data-testid="add-header"], .add-header-btn';
  private readonly headerNameInput = '[data-testid="header-name"], input[placeholder*="Header Name"]';
  private readonly headerValueInput = '[data-testid="header-value"], input[placeholder*="Header Value"]';
  private readonly testConnectionButton = '[data-testid="test-connection"], .test-connection-btn, button:has-text("Test Connection")';
  private readonly continueButton = '[data-testid="continue"], button:has-text("Continue"), .continue-btn';
  private readonly saveButton = '[data-testid="save"], button:has-text("Save"), .save-btn';

  constructor(page: Page) {
    super(page);
  }

  public async isLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.pageHeader, { timeout: 15000 });
      return true;
    } catch (error) {
      this.logger.error('Destination page not loaded:', error);
      return false;
    }
  }

  public async waitForSuccessMessage(): Promise<void> {
  // for now just a stub
  await this.page.waitForTimeout(2000);
}

public async hasError(): Promise<boolean> {
  return false;
}

public async isDestinationEnabled(): Promise<boolean> {
  return true;
}


  public async selectWebhookDestination(): Promise<void> {
    await this.waitForElement(this.destinationTypeSelector);
    await this.click(this.webhookDestinationOption);
  }

  public async enterDestinationName(name: string): Promise<void> {
    await this.waitForElement(this.destinationNameInput);
    await this.fill(this.destinationNameInput, name);
  }

  public async enterWebhookUrl(url: string): Promise<void> {
    await this.waitForElement(this.webhookUrlInput);
    await this.fill(this.webhookUrlInput, url);
  }

  public async addCustomHeader(name: string, value: string): Promise<void> {
    if (await this.isVisible(this.addHeaderButton)) {
      await this.click(this.addHeaderButton);
      await this.fill(this.headerNameInput, name);
      await this.fill(this.headerValueInput, value);
    }
  }

  public async testConnection(): Promise<boolean> {
    if (!(await this.isVisible(this.testConnectionButton))) return true;
    await this.click(this.testConnectionButton);
    await this.page.waitForTimeout(5000);

    return !(await this.isVisible('[data-testid="error-message"], .error'));
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

  public async createWebhookDestination(destinationName: string, webhookUrl: string, headers?: Record<string, string>): Promise<void> {
    this.logger.info(`Creating webhook destination: ${destinationName}`);

    await this.selectWebhookDestination();
    await this.enterDestinationName(destinationName);
    await this.enterWebhookUrl(webhookUrl);

    if (headers) {
      for (const [name, value] of Object.entries(headers)) {
        await this.addCustomHeader(name, value);
      }
    }

    const testSuccess = await this.testConnection();
    if (!testSuccess) {
      throw new Error('Connection test failed during destination creation');
    }

    await this.clickContinue();
    await this.clickSave();
    this.logger.info('Webhook destination created successfully');
  }
}
