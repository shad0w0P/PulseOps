import { JobState } from '@anas/shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';

export class VerifyingOtpHandler extends BaseStateHandler {
  readonly state = JobState.VERIFYING_OTP;

  async handle(context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    if (!context.bot) {
      throw new Error('Bot not initialized');
    }

    await context.bot.submitOtp();

    // Verify if successfully logged in or if there is an error message
    const errorMsg = await context.bot.getErrorMessage();
    if (errorMsg) {
      throw new Error(`OTP Verification failed: ${errorMsg}`);
    }

    // Since we don't have a real portal login, we check success or proceed to generate credentials
    return JobState.GENERATING_CREDENTIALS;
  }
}
