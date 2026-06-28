import { JobState } from 'shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';
import { otpBridge } from '../../otp/otp-bridge';

export class WaitingOtpHandler extends BaseStateHandler {
  readonly state = JobState.WAITING_FOR_OTP;

  async handle(context: FSMContext, fsm: AutomationFSM): Promise<JobState | null> {
    if (!context.bot) {
      throw new Error('Bot not initialized');
    }

    // Explicitly transition to WAITING_FOR_OTP to notify backend
    await fsm.transitionTo(
      JobState.WAITING_FOR_OTP,
      'Awaiting OTP input',
      'Please enter the 6-digit OTP sent to your registered mobile/email'
    );

    // Wait on bridge for OTP
    const otp = await otpBridge.waitForOtp(context.jobId);
    context.otpValue = otp;

    return JobState.OTP_RECEIVED;
  }
}
