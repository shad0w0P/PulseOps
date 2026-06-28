import { JobState } from '@anas/shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';

export class OtpReceivedHandler extends BaseStateHandler {
  readonly state = JobState.OTP_RECEIVED;

  async handle(context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    if (!context.bot || !context.otpValue) {
      throw new Error('OTP value missing or bot not initialized');
    }

    await context.bot.enterOtp(context.otpValue);
    return JobState.VERIFYING_OTP;
  }
}
