import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err, path: req.path }, 'Error occurred in automation request handler');

  res.status(500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
    },
  });
}
