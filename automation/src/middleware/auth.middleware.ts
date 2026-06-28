import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Bearer token authentication middleware for the automation service.
 * Verifies that requests are coming from the backend.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  if (token !== env.backendBearerToken) {
    res.status(401).json({ success: false, error: 'Invalid bearer token' });
    return;
  }

  next();
}
