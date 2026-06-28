import { EventEmitter } from 'events';
import { type AutomationEvent } from '@anas/shared';
import { logger } from '../utils/logger';

/**
 * In-process event bus.
 * Bridges the webhook receiver → SSE manager.
 *
 * Events are emitted per-job so SSE connections only receive
 * events for the job they're subscribed to.
 */
class EventBus extends EventEmitter {
  constructor() {
    super();
    // Allow many SSE connections per job
    this.setMaxListeners(100);
  }

  /**
   * Publish an event for a job.
   * All SSE connections for this jobId will receive it.
   */
  publishEvent(event: AutomationEvent): void {
    const channel = `job:${event.jobId}`;
    this.emit(channel, event);
    logger.debug({ jobId: event.jobId, seq: event.sequenceNumber }, 'Event published to bus');
  }

  /**
   * Subscribe to events for a specific job.
   * Returns an unsubscribe function.
   */
  subscribeToJob(jobId: string, handler: (event: AutomationEvent) => void): () => void {
    const channel = `job:${jobId}`;
    this.on(channel, handler);
    return () => {
      this.off(channel, handler);
    };
  }
}

export const eventBus = new EventBus();
