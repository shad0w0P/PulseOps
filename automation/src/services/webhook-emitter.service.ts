import crypto from 'crypto';
import { type AutomationEvent, type WebhookEventPayload, type JobState, generateId, EventLevel } from 'shared';
import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

class WebhookEmitter {
  private client = axios.create({
    baseURL: env.backendWebhookUrl,
    timeout: 10000,
  });

  private sequenceNumbers = new Map<string, number>();

  constructor() {
    // Add retry or custom error handling if needed
  }

  /**
   * Send an automation event to the backend.
   */
  async emit(params: {
    jobId: string;
    requestId: string;
    level: EventLevel;
    phase: JobState;
    step: string;
    message: string;
    metadata?: Record<string, any>;
    previousState?: JobState;
    credentials?: WebhookEventPayload['credentials'];
  }): Promise<void> {
    const { jobId, requestId, level, phase, step, message, metadata = {}, previousState, credentials } = params;

    // Get and increment sequence number
    const currentSeq = (this.sequenceNumbers.get(jobId) || 0) + 1;
    this.sequenceNumbers.set(jobId, currentSeq);

    const event: AutomationEvent = {
      eventId: generateId(),
      jobId,
      sequenceNumber: currentSeq,
      level,
      phase,
      step,
      message,
      timestamp: new Date().toISOString(),
      requestId,
      metadata,
    };

    const payload: WebhookEventPayload = {
      event,
      previousState,
      credentials,
    };

    const body = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', env.webhookSecret)
      .update(body)
      .digest('hex');

    logger.debug({ jobId, phase, seq: currentSeq }, 'Sending webhook event to backend');

    try {
      await this.client.post('', payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'Authorization': `Bearer ${env.backendBearerToken}`,
        },
      });
    } catch (error: any) {
      logger.error(
        { jobId, phase, seq: currentSeq, error: error.message },
        'Failed to deliver webhook event'
      );
      // Depending on requirements, we can implement memory buffer retry or throw.
      // Throwing allows the FSM state execution to catch and handle it.
      throw error;
    }
  }

  /**
   * Reset sequence number for a job.
   */
  resetJob(jobId: string): void {
    this.sequenceNumbers.delete(jobId);
  }
}

export const webhookEmitter = new WebhookEmitter();
