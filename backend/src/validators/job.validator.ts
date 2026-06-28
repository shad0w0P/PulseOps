import { Request, Response, NextFunction } from 'express';
import { createJobSchema } from '@anas/shared';

/**
 * Validate job creation request body.
 */
export function validateCreateJob(req: Request, _res: Response, next: NextFunction): void {
  req.body = createJobSchema.parse(req.body);
  next();
}
