import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/api-error';

/**
 * Bearer token authentication middleware.
 * Validates Authorization header against configured API token.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

  if (token !== env.apiBearerToken) {
    throw new UnauthorizedError('Invalid bearer token');
  }

  next();
}
