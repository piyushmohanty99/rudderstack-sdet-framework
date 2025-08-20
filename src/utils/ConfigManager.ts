import dotenv from 'dotenv';
import path from 'path';

export interface EnvironmentConfig {
  name: string;
  baseUrl: string;
  dataPlaneUrl: string;
  credentials: {
    username: string;
    password: string;
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private environment: EnvironmentConfig;
  private config: Record<string, any>;

  private constructor() {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });

    const envName = process.env.ENVIRONMENT?.toLowerCase() || 'dev';
    this.environment = this.loadEnvironmentConfig(envName);

    this.config = {
      browser: process.env.BROWSER || 'chromium',
      headless: process.env.HEADLESS !== 'false',
      timeout: Number(process.env.TIMEOUT) || 30000,
      retries: Number(process.env.RETRY_COUNT) || 2,
      parallel: process.env.PARALLEL_WORKERS ? Number(process.env.PARALLEL_WORKERS) > 1 : true,
      screenshots: process.env.SCREENSHOTS !== 'false',
      videos: process.env.VIDEOS === 'true',
      traces: process.env.TRACES === 'true',
      logLevel: process.env.LOG_LEVEL || 'info',
    };
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadEnvironmentConfig(name: string): EnvironmentConfig {
    switch (name) {
      case 'qa':
        return {
          name: 'qa',
          baseUrl: 'https://app-qa.rudderstack.com',
          dataPlaneUrl: 'https://qa-dataplane.rudderstack.com',
          credentials: {
            username: process.env.RUDDERSTACK_USERNAME || '',
            password: process.env.RUDDERSTACK_PASSWORD || '',
          },
        };
      case 'prod':
        return {
          name: 'prod',
          baseUrl: 'https://app.rudderstack.com',
          dataPlaneUrl: 'https://prod-dataplane.rudderstack.com',
          credentials: {
            username: process.env.RUDDERSTACK_USERNAME || '',
            password: process.env.RUDDERSTACK_PASSWORD || '',
          },
        };
      case 'dev':
      default:
        return {
          name: 'dev',
          baseUrl: 'https://app-dev.rudderstack.com',
          dataPlaneUrl: 'https://dev-dataplane.rudderstack.com',
          credentials: {
            username: process.env.RUDDERSTACK_USERNAME || '',
            password: process.env.RUDDERSTACK_PASSWORD || '',
          },
        };
    }
  }

  public isCI(): boolean {
  return process.env.CI === 'true';
}
  public validateConfiguration(): void {
    if (!this.environment.baseUrl) {
      throw new Error('Base URL is not configured. Please set RUDDERSTACK_BASE_URL in your .env file.');
    }
  }


  public getConfig(): Record<string, any> {
    return this.config;
  }

  public getBrowser(): string {
    return this.config.browser;
  }

  public isHeadless(): boolean {
    return this.config.headless;
  }

  public getTimeout(): number {
    return this.config.timeout;
  }

  public getRetries(): number {
    return this.config.retries;
  }

  public isParallelEnabled(): boolean {
    return this.config.parallel;
  }

  public getEnvironment(): EnvironmentConfig {
    return this.environment;
  }

  public getBaseUrl(): string {
    return this.environment.baseUrl;
  }

  public getDataPlaneUrl(): string {
    return this.environment.dataPlaneUrl;
  }

  public getCredentials() {
    return this.environment.credentials;
  }
}
