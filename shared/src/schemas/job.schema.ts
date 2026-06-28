import { z } from 'zod';

/**
 * PAN validation regex: 5 uppercase letters + 4 digits + 1 uppercase letter.
 * Example: ABCDE1234F
 */
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const createJobSchema = z.object({
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PAN_REGEX, 'PAN must be in format AAAAA0000A (5 letters, 4 digits, 1 letter)'),
});

export type CreateJobSchemaType = z.infer<typeof createJobSchema>;
