/**
 * Masking utilities for sensitive data.
 * Used by both the automation service (before emitting events)
 * and the frontend (as a safety net for display).
 *
 * Rules:
 * - PAN: Show first 4 + last 1, mask middle 5 → ABCD*****F
 * - OTP: Show last 3, mask first 3 → ***456
 * - Password: Mask entirely → **********
 * - User ID: Same as PAN masking
 */

/**
 * Mask a PAN number. Input: ABCDE1234F → Output: ABCD*****F
 */
export function maskPan(pan: string): string {
  if (!pan || pan.length < 6) {
    return '*'.repeat(pan?.length || 0);
  }
  return pan.slice(0, 4) + '*'.repeat(pan.length - 5) + pan.slice(-1);
}

/**
 * Mask an OTP. Input: 123456 → Output: ***456
 */
export function maskOtp(otp: string): string {
  if (!otp || otp.length < 4) {
    return '*'.repeat(otp?.length || 0);
  }
  return '*'.repeat(otp.length - 3) + otp.slice(-3);
}

/**
 * Mask a password completely. Input: anything → Output: **********
 */
export function maskPassword(_password: string): string {
  return '**********';
}

/**
 * Mask a User ID (same rules as PAN).
 */
export function maskUserId(userId: string): string {
  return maskPan(userId);
}

/**
 * Generic masking: replaces all characters with asterisks.
 */
export function maskFull(value: string): string {
  return '*'.repeat(value.length);
}
