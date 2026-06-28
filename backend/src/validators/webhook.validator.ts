import { Request, Response, NextFunction } from 'express';
import { webhookEventPayloadSchema } from 'shared';

/**
 * Validate webhook event payload.
 */
export function validateWebhookEvent(req: Request, _res: Response, next: NextFunction): void {
  req.body = webhookEventPayloadSchema.parse(req.body);
  next();
}
