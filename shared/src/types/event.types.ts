import { EventLevel, JobState } from '../constants';

/**
 * An automation event representing a single observable action.
 * Every state transition and notable sub-step emits one of these.
 */
export interface AutomationEvent {
  /** Globally unique event ID (UUID v4) */
  eventId: string;
  /** Reference to the parent job */
  jobId: string;
  /** Monotonically increasing per job (1-based). Used for SSE replay. */
  sequenceNumber: number;
  /** Severity level for log display */
  level: EventLevel;
  /** FSM state when the event was emitted */
  phase: JobState;
  /** Human-readable step name (e.g., "Navigating to login page") */
  step: string;
  /** Detailed message */
  message: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Correlation ID for the original job request */
  requestId: string;
  /**
   * Additional context. MUST NEVER contain:
   * - Raw PAN
   * - Raw OTP
   * - Passwords
   * - Any other sensitive data
   */
  metadata: Record<string, unknown>;
}

/**
 * Payload sent from automation service to backend via webhook.
 * Includes the event plus optional state transition info.
 */
export interface WebhookEventPayload {
  event: AutomationEvent;
  /** If this event represents a state transition, the previous state */
  previousState?: JobState;
  /** If credentials were generated (only on SUCCESS) */
  credentials?: {
    userId: string;
    password: string;
  };
}
