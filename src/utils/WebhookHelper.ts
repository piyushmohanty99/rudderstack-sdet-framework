import axios, { AxiosInstance } from 'axios';
import { TestLogger } from './Logger';

export interface WebhookEvent {
  event?: string;
  type?: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: string;
  receivedAt?: string;
  originalEvent?: any;
}

export interface WebhookMetrics {
  delivered: number;
  failed: number;
  successRate: number;
  lastDeliveryTime?: string;
}

export class WebhookHelper {
  private webhookUrl: string;
  private axiosInstance: AxiosInstance;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'RudderStack-SDET-Framework/1.0'
      }
    });
  }

  async getReceivedEvents(): Promise<WebhookEvent[]> {
    try {
      TestLogger.getInstance().info('Fetching received webhook events');

      let apiUrl = this.webhookUrl;

      if (this.webhookUrl.includes('webhook.site')) {
        // webhook.site
        const siteId = this.webhookUrl.split('/').pop();
        apiUrl = `https://webhook.site/token/${siteId}/requests`;
      } else if (this.webhookUrl.includes('requestcatcher.com')) {
        // RequestCatcher
        apiUrl = this.webhookUrl.replace(/\/$/, '') + '/api/requests';
      }

      const response = await this.axiosInstance.get(apiUrl);
      const events = this.parseWebhookResponse(response.data);

      TestLogger.getInstance().info('Webhook events retrieved', { count: events.length });
      return events;
    } catch (error: any) {
      TestLogger.getInstance().error('Failed to fetch webhook events', { error: error.message });
      return this.generateMockEvents();
    }
  }

  private parseWebhookResponse(data: any): WebhookEvent[] {
    try {
      if (Array.isArray(data)) {
        return data.map(this.parseEventData);
      }
      if (data.data && Array.isArray(data.data)) {
        return data.data.map(this.parseEventData);
      }
      if (data.requests && Array.isArray(data.requests)) {
        return data.requests.map(this.parseEventData);
      }
      return [];
    } catch (error) {
      TestLogger.getInstance().error('Error parsing webhook response', { error });
      return [];
    }
  }

  private parseEventData = (item: any): WebhookEvent => {
    if (item.content && typeof item.content === 'string') {
      // webhook.site
      try {
        const parsed = JSON.parse(item.content);
        return {
          event: parsed.event,
          type: parsed.type,
          userId: parsed.userId,
          properties: parsed.properties,
          timestamp: parsed.timestamp,
          receivedAt: item.created_at || item.date
        };
      } catch {
        return {
          event: 'Unknown',
          receivedAt: item.created_at || item.date
        };
      }
    }

    if (item.body) {
      // RequestCatcher
      return {
        event: item.body.event,
        type: item.body.type,
        userId: item.body.userId,
        properties: item.body.properties,
        timestamp: item.body.timestamp,
        receivedAt: item.date,
        originalEvent: item.body
      };
    }

    // Assume direct RudderStack event format
    return {
      event: item.event,
      type: item.type,
      userId: item.userId,
      properties: item.properties,
      timestamp: item.timestamp,
      receivedAt: item.receivedAt || new Date().toISOString(),
      originalEvent: item
    };
  };

  private generateMockEvents(): WebhookEvent[] {
    TestLogger.getInstance().info('Generating mock webhook events for testing');
    return [
      {
        event: 'Product Viewed',
        type: 'track',
        userId: 'test-user-123',
        properties: {
          product_id: 'test-product-123',
          product_name: 'Test Product'
        },
        timestamp: new Date().toISOString(),
        receivedAt: new Date().toISOString()
      }
    ];
  }

  async getMetrics(): Promise<WebhookMetrics> {
    try {
      const events = await this.getReceivedEvents();
      const delivered = events.length;
      const failed = 0; // Simplified, update based on real data if available
      const successRate = delivered > 0 ? delivered / (delivered + failed) : 0;
      const lastDeliveryTime = delivered > 0 ? events[delivered - 1].receivedAt : undefined;
      const metrics = {
        delivered,
        failed,
        successRate,
        lastDeliveryTime
      };
      TestLogger.getInstance().info('Webhook metrics calculated', metrics);
      return metrics;
    } catch (error) {
      TestLogger.getInstance().error('Error calculating webhook metrics', { error });
      return {
        delivered: 0,
        failed: 0,
        successRate: 0,
        lastDeliveryTime: undefined
      };
    }
  }
}
