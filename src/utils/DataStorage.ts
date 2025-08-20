import { TestData, SourceConfig, DestinationConfig, EventPayload, TestMetrics } from '../../src/types/index';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { TestLogger } from './Logger';



export class DataStorage {
  private static instance: DataStorage;
  private logger: TestLogger;

  private testData: Map<string, TestData> = new Map();
  private metrics: Map<string, TestMetrics> = new Map();
  private writeKeys: Map<string, string> = new Map();
  private webhookUrls: Map<string, string> = new Map();
  private sessionId: string;

  private constructor() {
    this.logger = TestLogger.getInstance();
    this.sessionId = randomUUID();
    this.ensureDirectories();
  }

  static getInstance(): DataStorage {
    if (!DataStorage.instance) {
      DataStorage.instance = new DataStorage();
    }
    return DataStorage.instance;
  }

  private ensureDirectories(): void {
    const dirs = ['reports/test-data', 'reports/logs', 'reports/screenshots'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Methods for storing and getting test data, write keys, webhook URLs, metrics

  public generateWriteKey(): string {
    return randomUUID().replace(/-/g, '');
  }

  public generateTestUser() {
    const timestamp = Date.now();
    return {
      email: `test.user.${timestamp}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
  }

  public generateSourceConfig(name?: string): SourceConfig {
    return {
      name: name || `HTTP-Source-${Date.now()}`,
      type: 'HTTP',
      writeKey: this.generateWriteKey(),
      enabled: true,
      settings: {
        allowInsecure: false,
        enableDeduplication: true,
      },
    };
  }

  public generateDestinationConfig(name?: string, url?: string): DestinationConfig {
    return {
      name: name || `Webhook-Destination-${Date.now()}`,
      type: 'Webhook',
      url: url || 'https://webhook.site/unique-id',
      enabled: true,
      settings: {
        headers: { 'Content-Type': 'application/json' },
      },
    };
  }

  public generateEventPayload(eventName: string, properties: Record<string, any> = {}): EventPayload {
    return {
      userId: randomUUID(),
      event: eventName,
      properties: {
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        ...properties,
      },
      context: {
        library: { name: 'RudderStack-SDET-Framework', version: '1.0.0' },
      },
      timestamp: new Date().toISOString(),
      messageId: randomUUID(),
    };
  }

  public storeWriteKey(key: string, value: string) {
  this.writeKeys.set(key, value);
}
public storeWebhookUrl(key: string, value: string) {
  this.webhookUrls.set(key, value);
}

public exportData(): { path: string; data: any } {
  return { 
    path: 'memory-only', 
    data: {
      testData: Array.from(this.testData.entries()),
      metrics: Array.from(this.metrics.entries()),
      writeKeys: Array.from(this.writeKeys.entries()),
      webhookUrls: Array.from(this.webhookUrls.entries()),
      sessionId: this.sessionId
    }
  };
}


public exportSessionData(): string { return ""; }
public cleanup(): void { }
public initializeMetrics(_testId: string): void { }
public getMetrics(_testId: string): any { return {}; }
public storeTestData(_testId: string, _testData: any): void { }
public finalizeMetrics(_testId: string): any { return { apiResponseTime: [] }; }
public addResponseTime(_testId: string, _responseTime: number): void { }


}
