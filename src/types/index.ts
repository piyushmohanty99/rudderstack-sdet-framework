export interface RudderStackCredentials {
  username: string;
  password: string;
}

export interface SourceConfig {
  name: string;
  type: string;
  writeKey?: string;
  enabled?: boolean;
  settings?: Record<string, any>;
}

export interface DestinationConfig {
  name: string;
  type: string;
  url?: string;
  enabled?: boolean;
  settings?: Record<string, any>;
}

export interface EventPayload {
  userId: string;
  event: string;
  properties: Record<string, any>;
  context?: Record<string, any>;
  timestamp: string;
  messageId: string;
}

export interface APIResponse {
  success: boolean;
  statusCode: number;
  data?: any;
  error?: string;
  responseTime?: number;
  headers?: Record<string, string>;
}

export interface WebhookEvent {
  id?: string;
  timestamp: string;
  payload: Record<string, any>;
  headers?: Record<string, string>;
  url?: string;
}

export interface TestData {
  user: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  };
  source: SourceConfig;
  destination: DestinationConfig;
  events: EventPayload[];
}

export interface TestMetrics {
  duration: number;
  eventsDelivered: number;
  eventsFailed: number;
  apiResponseTime: number[];
}

export interface StepDefinitionContext {
  page: import('@playwright/test').Page;
  context: import('@playwright/test').BrowserContext;
  browser: import('@playwright/test').Browser;
  testData: TestData;
  metrics: TestMetrics;
  credentials: RudderStackCredentials;
}
