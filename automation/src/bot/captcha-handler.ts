import { logger } from '../utils/logger';
import { env } from '../config/env';

interface PendingCaptcha {
  resolve: (value: string) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * CAPTCHA Bridge — same pattern as OTP Bridge.
 *
 * When the automation reaches WAITING_FOR_CAPTCHA:
 * 1. Captures CAPTCHA screenshot and emits it via webhook metadata
 * 2. Calls captchaBridge.waitForCaptcha(jobId)
 * 3. Frontend shows the CAPTCHA image to the operator
 * 4. Operator enters the solution
 * 5. Backend forwards it here
 * 6. Promise resolves, FSM resumes
 */
class CaptchaBridge {
  private pending = new Map<string, PendingCaptcha>();

  waitForCaptcha(jobId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.cancel(jobId);

      const timer = setTimeout(() => {
        this.pending.delete(jobId);
        reject(new Error(`CAPTCHA timeout for job ${jobId} after ${env.captchaTimeoutMs}ms`));
      }, env.captchaTimeoutMs);

      this.pending.set(jobId, { resolve, reject, timer });

      logger.info({ jobId, timeoutMs: env.captchaTimeoutMs }, 'Waiting for CAPTCHA solution');
    });
  }

  deliverCaptcha(jobId: string, captcha: string): boolean {
    const pending = this.pending.get(jobId);
    if (!pending) {
      logger.warn({ jobId }, 'No pending CAPTCHA request found');
      return false;
    }

    clearTimeout(pending.timer);
    this.pending.delete(jobId);
    pending.resolve(captcha);

    logger.info({ jobId }, 'CAPTCHA solution delivered to automation');
    return true;
  }

  cancel(jobId: string): void {
    const pending = this.pending.get(jobId);
    if (pending) {
      clearTimeout(pending.timer);
      this.pending.delete(jobId);
      pending.reject(new Error(`CAPTCHA request cancelled for job ${jobId}`));
    }
  }

  isPending(jobId: string): boolean {
    return this.pending.has(jobId);
  }
}

export const captchaBridge = new CaptchaBridge();
