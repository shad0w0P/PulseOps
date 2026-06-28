import { Request, Response, NextFunction } from 'express';
import { generateId } from '@anas/shared';

/**
 * Attach a unique request ID to every incoming request.
 * Uses X-Request-ID from the client if present, otherwise generates one.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || generateId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
