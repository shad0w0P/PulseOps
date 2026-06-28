import { z } from 'zod';

/**
 * OTP is exactly 6 digits.
 */
export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'OTP must be exactly 6 digits'),
});

export type OtpSchemaType = z.infer<typeof otpSchema>;
