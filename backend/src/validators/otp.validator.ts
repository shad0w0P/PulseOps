import { Request, Response, NextFunction } from 'express';
import { otpSchema } from 'shared';

/**
 * Validate OTP submission request body.
 */
export function validateOtp(req: Request, _res: Response, next: NextFunction): void {
  req.body = otpSchema.parse(req.body);
  next();
}
