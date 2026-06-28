import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import type { ApiErrorResponse } from 'shared';

/**
 * Global error handler middleware.
 * Catches all errors and returns structured JSON responses.
 * Never exposes stack traces in production.
 */
export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Handle known API errors
  if (err instanceof ApiError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      requestId: req.headers['x-request-id'] as string,
    };

    logger.warn({ err, requestId: req.headers['x-request-id'] }, err.message);
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      requestId: req.headers['x-request-id'] as string,
    };

    logger.warn({ err, requestId: req.headers['x-request-id'] }, 'Validation error');
    res.status(400).json(response);
    return;
  }

  // Handle unknown errors
  logger.error({ err, requestId: req.headers['x-request-id'] }, 'Unhandled error');

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env['NODE_ENV'] === 'production'
        ? 'Internal server error'
        : err.message,
    },
    requestId: req.headers['x-request-id'] as string,
  };

  res.status(500).json(response);
}
