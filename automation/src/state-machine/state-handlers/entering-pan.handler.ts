import { JobState } from '@anas/shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';

export class EnteringPanHandler extends BaseStateHandler {
  readonly state = JobState.ENTERING_PAN;

  async handle(context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    if (!context.bot) {
      throw new Error('Bot not initialized');
    }
    await context.bot.enterPan(context.pan);
    
    // Check if CAPTCHA is present, if yes transition to WAITING_FOR_CAPTCHA.
    // If not, transition to WAITING_FOR_OTP.
    const hasCaptcha = await context.bot.isCaptchaPresent();
    if (hasCaptcha) {
      return JobState.WAITING_FOR_CAPTCHA;
    }
    return JobState.WAITING_FOR_OTP;
  }
}
