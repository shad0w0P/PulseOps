import { JobState } from '@anas/shared';
import { BrowserManager } from '../bot/browser-manager';
import { AutomationFSM, FSMContext } from '../state-machine/automation-fsm';
import { CreatedHandler } from '../state-machine/state-handlers/created.handler';
import { StartingBrowserHandler } from '../state-machine/state-handlers/starting-browser.handler';
import { OpeningPortalHandler } from '../state-machine/state-handlers/opening-portal.handler';
import { EnteringPanHandler } from '../state-machine/state-handlers/entering-pan.handler';
import { WaitingCaptchaHandler } from '../state-machine/state-handlers/waiting-captcha.handler';
import { CaptchaSubmittedHandler } from '../state-machine/state-handlers/captcha-submitted.handler';
import { WaitingOtpHandler } from '../state-machine/state-handlers/waiting-otp.handler';
import { OtpReceivedHandler } from '../state-machine/state-handlers/otp-received.handler';
import { VerifyingOtpHandler } from '../state-machine/state-handlers/verifying-otp.handler';
import { GeneratingCredentialsHandler } from '../state-machine/state-handlers/generating-credentials.handler';
import { SuccessHandler } from '../state-machine/state-handlers/success.handler';
import { FailedHandler } from '../state-machine/state-handlers/failed.handler';
import { otpBridge } from '../otp/otp-bridge';
import { captchaBridge } from '../bot/captcha-handler';
import { logger } from '../utils/logger';

class AutomationService {
  private activeJobs = new Map<string, AutomationFSM>();

  /**
   * Start a new Playwright automation job.
   */
  async startJob(jobId: string, pan: string, requestId: string): Promise<void> {
    if (this.activeJobs.has(jobId)) {
      throw new Error(`Job ${jobId} is already running`);
    }

    logger.info({ jobId, pan }, 'Starting automation job');

    const browserManager = new BrowserManager();
    const context: FSMContext = {
      jobId,
      pan,
      requestId,
      browserManager,
    };

    const fsm = new AutomationFSM(context);

    // Register all state handlers
    fsm.registerHandler(new CreatedHandler());
    fsm.registerHandler(new StartingBrowserHandler());
    fsm.registerHandler(new OpeningPortalHandler());
    fsm.registerHandler(new EnteringPanHandler());
    fsm.registerHandler(new WaitingCaptchaHandler());
    fsm.registerHandler(new CaptchaSubmittedHandler());
    fsm.registerHandler(new WaitingOtpHandler());
    fsm.registerHandler(new OtpReceivedHandler());
    fsm.registerHandler(new VerifyingOtpHandler());
    fsm.registerHandler(new GeneratingCredentialsHandler());
    fsm.registerHandler(new SuccessHandler());
    fsm.registerHandler(new FailedHandler());

    this.activeJobs.set(jobId, fsm);

    // Run in background (fire-and-forget from caller perspective, but monitored via events)
    fsm.run()
      .catch((err) => {
        logger.error({ jobId, error: err.message }, 'Unhandled error in FSM execution thread');
      })
      .finally(() => {
        // Only remove if it has reached a terminal state
        if (fsm.isTerminal()) {
          this.activeJobs.delete(jobId);
          logger.info({ jobId }, 'Job cleared from active jobs');
        }
      });
  }

  /**
   * Submit OTP to resume a waiting job.
   */
  async submitOtp(jobId: string, otp: string): Promise<void> {
    logger.info({ jobId }, 'Submitting OTP to active job');
    const fsm = this.activeJobs.get(jobId);

    if (!fsm) {
      throw new Error(`No active job found with id ${jobId}`);
    }

    if (fsm.getCurrentState() !== JobState.WAITING_FOR_OTP) {
      throw new Error(`Job ${jobId} is in state ${fsm.getCurrentState()}, not WAITING_FOR_OTP`);
    }

    const delivered = otpBridge.deliverOtp(jobId, otp);
    if (!delivered) {
      throw new Error('Failed to deliver OTP to OTP bridge');
    }

    // Resume FSM loop execution
    fsm.resume().catch((err) => {
      logger.error({ jobId, error: err.message }, 'Error resuming job after OTP delivery');
    });
  }

  /**
   * Submit CAPTCHA to resume a waiting job.
   */
  async submitCaptcha(jobId: string, captcha: string): Promise<void> {
    logger.info({ jobId }, 'Submitting CAPTCHA to active job');
    const fsm = this.activeJobs.get(jobId);

    if (!fsm) {
      throw new Error(`No active job found with id ${jobId}`);
    }

    if (fsm.getCurrentState() !== JobState.WAITING_FOR_CAPTCHA) {
      throw new Error(`Job ${jobId} is in state ${fsm.getCurrentState()}, not WAITING_FOR_CAPTCHA`);
    }

    const delivered = captchaBridge.deliverCaptcha(jobId, captcha);
    if (!delivered) {
      throw new Error('Failed to deliver CAPTCHA to CAPTCHA bridge');
    }

    // Resume FSM loop execution
    fsm.resume().catch((err) => {
      logger.error({ jobId, error: err.message }, 'Error resuming job after CAPTCHA delivery');
    });
  }

  /**
   * Cancel an active job.
   */
  async cancelJob(jobId: string): Promise<void> {
    logger.info({ jobId }, 'Cancelling active job');
    const fsm = this.activeJobs.get(jobId);

    if (!fsm) {
      throw new Error(`No active job found with id ${jobId}`);
    }

    // Cancel bridges
    otpBridge.cancel(jobId);
    captchaBridge.cancel(jobId);

    // Transition to CANCELLED state
    await fsm.transitionTo(
      JobState.CANCELLED,
      'Automation cancelled',
      'Automation execution was cancelled by operator'
    );

    // Close browser and cleanup
    await fsm.getContext().browserManager.close();
    this.activeJobs.delete(jobId);
  }

  /**
   * Get total number of running jobs.
   */
  getRunningJobCount(): number {
    return this.activeJobs.size;
  }
}

export const automationService = new AutomationService();
