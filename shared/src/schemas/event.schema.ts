import { z } from 'zod';
import { EventLevel, JobState } from '../constants';

/**
 * Validates the structure of an automation event.
 * Used by the backend when receiving webhook payloads.
 */
export const automationEventSchema = z.object({
  eventId: z.string().uuid(),
  jobId: z.string().uuid(),
  sequenceNumber: z.number().int().positive(),
  level: z.nativeEnum(EventLevel),
  phase: z.nativeEnum(JobState),
  step: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid(),
  metadata: z.record(z.unknown()).default({}),
});

export const webhookEventPayloadSchema = z.object({
  event: automationEventSchema,
  previousState: z.nativeEnum(JobState).optional(),
  credentials: z
    .object({
      userId: z.string().min(1),
      password: z.string().min(1),
    })
    .optional(),
});

export type AutomationEventSchemaType = z.infer<typeof automationEventSchema>;
export type WebhookEventPayloadSchemaType = z.infer<typeof webhookEventPayloadSchema>;
