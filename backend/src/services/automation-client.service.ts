import { createHttpClient } from '../utils/http-client';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * HTTP client for communicating with the Automation service.
 * Handles job start, OTP delivery, CAPTCHA delivery, and cancellation.
 */
class AutomationClientService {
  private client = createHttpClient(env.automationServiceUrl, env.automationBearerToken);

  /**
   * Start a new automation job.
   */
  async startJob(jobId: string, pan: string, requestId: string): Promise<void> {
    logger.info({ jobId }, 'Sending start command to automation');
    await this.client.post('/automation/start', { jobId, pan, requestId });
  }

  /**
   * Forward OTP to the automation service.
   */
  async submitOtp(jobId: string, otp: string): Promise<void> {
    logger.info({ jobId }, 'Forwarding OTP to automation');
    await this.client.post('/automation/otp', { jobId, otp });
  }

  /**
   * Forward CAPTCHA solution to the automation service.
   */
  async submitCaptcha(jobId: string, captcha: string): Promise<void> {
    logger.info({ jobId }, 'Forwarding CAPTCHA to automation');
    await this.client.post('/automation/captcha', { jobId, captcha });
  }

  /**
   * Cancel a running automation job.
   */
  async cancelJob(jobId: string): Promise<void> {
    logger.info({ jobId }, 'Sending cancel to automation');
    await this.client.post('/automation/cancel', { jobId });
  }

  /**
   * Check if the automation service is reachable.
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const automationClientService = new AutomationClientService();
