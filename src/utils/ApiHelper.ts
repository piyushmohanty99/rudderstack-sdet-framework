import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TestLogger } from './Logger';

export interface TrackEventPayload {
  userId?: string;
  anonymousId?: string;
  event: string;
  properties?: Record<string, any>;
  context?: Record<string, any>;
  timestamp?: string;
  messageId?: string;
}

export interface ApiResponse {
  success: boolean;
  status?: number;
  data?: any;
  error?: any;
  responseTime?: number;
}

export class ApiHelper {
  private axiosInstance: AxiosInstance;
  private dataPlaneUrl: string;

  constructor(dataPlaneUrl: string) {
    this.dataPlaneUrl = dataPlaneUrl.replace(/\/$/, ''); // Remove trailing slash
    this.axiosInstance = axios.create({
      baseURL: this.dataPlaneUrl,
      timeout: parseInt(process.env.API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RudderStack-SDET-Framework/1.0'
      }
    });

    // Logging interceptors omitted here for brevity...
  }

  async sendTrackEvent(
    event: string,
    writeKey: string,
    userId?: string,
    properties?: Record<string, any>
  ): Promise<ApiResponse> {
    const startTime = Date.now();
    try {
      TestLogger.getInstance().info('Sending track event', { event, writeKey: writeKey.substring(0, 8) + '...', userId });
      const payload: TrackEventPayload = {
        userId: userId || `test-user-${Date.now()}`,
        event,
        properties: properties || {},
        context: {
          library: {
            name: 'rudderstack-sdet-framework',
            version: '1.0.0'
          },
          userAgent: 'RudderStack-SDET-Framework/1.0'
        },
        timestamp: new Date().toISOString(),
        messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      const response: AxiosResponse = await this.axiosInstance.post('/v1/track', payload, {
        headers: {
          'Authorization': `Basic ${Buffer.from(writeKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;
      TestLogger.getInstance().info('Track event sent successfully', {
        event,
        status: response.status,
        responseTime: `${responseTime}ms`
      });

      return {
        success: true,
        status: response.status,
        data: response.data,
        responseTime
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      TestLogger.getInstance().error('Failed to send track event', {
        event,
        error: error.message,
        status: error.response?.status,
        responseTime: `${responseTime}ms`
      });

      return {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message,
        responseTime
      };
    }
  }

  // Additional methods (identify, batch) unchanged...
}
