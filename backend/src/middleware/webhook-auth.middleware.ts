import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/api-error';

/**
 * Webhook HMAC-SHA256 authentication middleware.
 * Validates the X-Webhook-Signature header against the payload.
 */
export function webhookAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const signature = req.headers['x-webhook-signature'] as string | undefined;

  if (!signature) {
    throw new UnauthorizedError('Missing X-Webhook-Signature header');
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', env.webhookSecret)
    .update(payload)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );

  if (!isValid) {
    throw new UnauthorizedError('Invalid webhook signature');
  }

  next();
}
