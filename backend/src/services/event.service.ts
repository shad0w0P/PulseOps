import { type AutomationEvent, type WebhookEventPayload, JobState, TERMINAL_STATES } from 'shared';
import { eventRepository } from '../repositories/event.repository';
import { eventBus } from '../events/event-bus';
import { jobService } from './job.service';
import { credentialService } from './credential.service';
import { metricService } from './metric.service';
import { JobStateMachine } from '../state-machine/job-state-machine';
import { jobRepository } from '../repositories/job.repository';
import { logger } from '../utils/logger';

/**
 * Event service — processes incoming webhook events.
 *
 * Flow:
 * 1. Validate event structure (done by validator middleware).
 * 2. Validate state transition via FSM.
 * 3. Persist event to MongoDB.
 * 4. Update job status.
 * 5. Handle credentials if SUCCESS.
 * 6. Update metrics if terminal state.
 * 7. Publish to event bus (triggers SSE).
 */
class EventService {
  /**
   * Process a webhook event payload.
   */
  async processWebhookEvent(payload: WebhookEventPayload): Promise<void> {
    const { event, credentials } = payload;

    logger.info(
      { jobId: event.jobId, seq: event.sequenceNumber, phase: event.phase },
      'Processing webhook event',
    );

    // Validate state transition
    if (payload.previousState) {
      const jobDoc = await jobRepository.findByJobId(event.jobId);
      if (jobDoc) {
        const fsm = new JobStateMachine(event.jobId, jobDoc.status);
        fsm.transition(event.phase);
      }
    }

    // Persist event
    await eventRepository.create(event);

    // Update job status
    const errorMsg = event.phase === JobState.FAILED
      ? event.message
      : undefined;
    await jobService.updateJobStatus(event.jobId, event.phase, errorMsg);

    // Handle credentials on SUCCESS
    if (event.phase === JobState.SUCCESS && credentials) {
      await credentialService.storeCredentials(
        event.jobId,
        credentials.userId,
        credentials.password,
      );
    }

    // Update metrics on terminal states
    if (TERMINAL_STATES.has(event.phase)) {
      const jobDoc = await jobRepository.findByJobId(event.jobId);
      if (jobDoc) {
        await metricService.recordCompletion(event.phase, jobDoc.durationMs || 0);
      }
    }

    // Publish to event bus (SSE subscribers receive it)
    eventBus.publishEvent(event);
  }

  /**
   * Get all events for a job (REST endpoint).
   */
  async getJobEvents(jobId: string): Promise<AutomationEvent[]> {
    const eventDocs = await eventRepository.findByJobId(jobId);
    return eventDocs.map((doc) => ({
      eventId: doc.eventId,
      jobId: doc.jobId,
      sequenceNumber: doc.sequenceNumber,
      level: doc.level,
      phase: doc.phase,
      step: doc.step,
      message: doc.message,
      timestamp: doc.timestamp.toISOString(),
      requestId: doc.requestId,
      metadata: doc.metadata,
    }));
  }
}

export const eventService = new EventService();
