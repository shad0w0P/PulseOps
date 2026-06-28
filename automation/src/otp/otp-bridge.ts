import { logger } from '../utils/logger';
import { env } from '../config/env';

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * OTP Bridge — Promise-based pause/resume mechanism.
 *
 * When the automation reaches WAITING_FOR_OTP:
 * 1. FSM calls otpBridge.waitForOtp(jobId) which returns a Promise<string>
 * 2. The Promise is stored in a pending map
 * 3. When the backend POST /automation/otp arrives, we resolve the Promise
 * 4. The FSM handler resumes with the OTP value
 * 5. A timeout rejects the Promise if no OTP arrives
 */
class OtpBridge {
  private pending = new Map<string, PendingRequest<string>>();

  /**
   * Wait for OTP from the operator.
   * Returns a Promise that resolves with the OTP string.
   * Rejects after timeout.
   */
  waitForOtp(jobId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // Clean up any existing pending request for this job
      this.cancel(jobId);

      const timer = setTimeout(() => {
        this.pending.delete(jobId);
        reject(new Error(`OTP timeout for job ${jobId} after ${env.otpTimeoutMs}ms`));
      }, env.otpTimeoutMs);

      this.pending.set(jobId, { resolve, reject, timer });

      logger.info({ jobId, timeoutMs: env.otpTimeoutMs }, 'Waiting for OTP');
    });
  }

  /**
   * Deliver OTP received from the backend.
   * Resolves the waiting Promise.
   */
  deliverOtp(jobId: string, otp: string): boolean {
    const pending = this.pending.get(jobId);
    if (!pending) {
      logger.warn({ jobId }, 'No pending OTP request found');
      return false;
    }

    clearTimeout(pending.timer);
    this.pending.delete(jobId);
    pending.resolve(otp);

    logger.info({ jobId }, 'OTP delivered to automation');
    return true;
  }

  /**
   * Cancel a pending OTP wait (e.g., on job cancellation).
   */
  cancel(jobId: string): void {
    const pending = this.pending.get(jobId);
    if (pending) {
      clearTimeout(pending.timer);
      this.pending.delete(jobId);
      pending.reject(new Error(`OTP request cancelled for job ${jobId}`));
      logger.info({ jobId }, 'OTP wait cancelled');
    }
  }

  /**
   * Check if there's a pending OTP wait for a job.
   */
  isPending(jobId: string): boolean {
    return this.pending.has(jobId);
  }
}

export const otpBridge = new OtpBridge();
