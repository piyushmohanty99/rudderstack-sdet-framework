import { Page } from 'playwright';
import { BasePage } from './BasePage';
import { TestLogger } from '../utils/Logger';

export class ConnectionsPage extends BasePage {
  private readonly dataPlaneUrlSelector = '[data-testid="data-plane-url"], .data-plane-url, .header-info';
  private readonly addSourceButton = 'button:has-text("Add Source"), [data-testid="add-source"], .add-source-btn';
  private readonly addDestinationButton = 'button:has-text("Add Destination"), [data-testid="add-destination"], .add-destination-btn';
  private readonly sourcesSection = '[data-testid="sources"], .sources-section, .ant-card:has-text("Sources")';
  private readonly destinationsSection = '[data-testid="destinations"], .destinations-section, .ant-card:has-text("Destinations")';

  constructor(page: Page) {
    super(page);
  }

  async navigateToConnections(): Promise<void> {
    TestLogger.getInstance().info('Navigating to connections page');
    await this.navigateTo(`${this.config.getBaseUrl()}/connections`);
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Wait for page indicators
    try {
      await Promise.race([
        this.page.waitForSelector(this.addSourceButton, { timeout: 15000 }),
        this.page.waitForSelector(this.sourcesSection, { timeout: 15000 }),
        this.page.waitForSelector('h1:has-text("Connections")', { timeout: 15000 })
      ]);
      TestLogger.getInstance().info('Connections page loaded successfully');
    } catch (error) {
      TestLogger.getInstance().warn('Connections page elements not found immediately', { error });
    }
  }

  async isLoaded(): Promise<boolean> {
    try {
      const indicators = [
        this.addSourceButton,
        this.sourcesSection,
        'h1:has-text("Connections")',
        'h2:has-text("Sources")',
        '.connections-page'
      ];

      for (const selector of indicators) {
        if (await this.page.isVisible(selector)) {
          TestLogger.getInstance().info(`Connections page confirmed with selector: ${selector}`);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async getDataPlaneUrl(): Promise<string> {
    TestLogger.getInstance().info('Attempting to extract data plane URL');
    
    try {
      // Try multiple strategies to find the data plane URL
      const strategies = [
        // Look in header/nav area
        async () => {
          const headerSelectors = ['.header', '.navbar', '.ant-layout-header', '[role="banner"]'];
          for (const selector of headerSelectors) {
            if (await this.page.isVisible(selector)) {
              const text = await this.page.textContent(selector);
              const url = this.extractUrlFromText(text || '');
              if (url) return url;
            }
          }
          return null;
        },
        
        // Look for specific data plane indicators
        async () => {
          const selectors = [
            '[data-testid*="data-plane"]',
            '.data-plane-url',
            '.plane-url',
            '*:has-text("dataplane")',
            '*:has-text("Data Plane")'
          ];
          
          for (const selector of selectors) {
            try {
              if (await this.page.isVisible(selector)) {
                const text = await this.page.textContent(selector);
                const url = this.extractUrlFromText(text || '');
                if (url) return url;
              }
            } catch (e) {
              // Continue to next selector
            }
          }
          return null;
        },

        // Look in settings or configuration areas
        async () => {
          const settingsText = await this.page.textContent('body');
          return this.extractUrlFromText(settingsText || '');
        }
      ];

      for (const strategy of strategies) {
        const url = await strategy();
        if (url) {
          TestLogger.getInstance().info('Data plane URL found', { url });
          return url;
        }
      }

      // Fallback to environment configuration
      TestLogger.getInstance().warn('Could not find data plane URL in UI, using environment default');
      return this.config.getDataPlaneUrl() || 'https://hosted.rudderlabs.com';

    } catch (error) {
      TestLogger.getInstance().error('Error extracting data plane URL', { error });
      return this.config.getDataPlaneUrl() || 'https://hosted.rudderlabs.com';
    }
  }

  private extractUrlFromText(text: string): string | null {
    // Look for various URL patterns
    const urlPatterns = [
      /https?:\/\/[a-zA-Z0-9.-]+\.dataplane\.rudderstack\.com/g,
      /https?:\/\/[a-zA-Z0-9.-]+\.rudderlabs\.com/g,
      /https?:\/\/hosted\.rudderlabs\.com/g,
      /https?:\/\/[a-zA-Z0-9.-]+rudderstack[a-zA-Z0-9.-]*\.com/g
    ];

    for (const pattern of urlPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0];
      }
    }

    return null;
  }

  async hasAddSourceButton(): Promise<boolean> {
    try {
      const selectors = this.addSourceButton.split(', ');
      for (const selector of selectors) {
        if (await this.page.isVisible(selector.trim())) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async hasAddDestinationButton(): Promise<boolean> {
    try {
      const selectors = this.addDestinationButton.split(', ');
      for (const selector of selectors) {
        if (await this.page.isVisible(selector.trim())) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }
}
