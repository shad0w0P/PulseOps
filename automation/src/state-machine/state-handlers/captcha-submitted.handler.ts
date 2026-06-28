import { JobState } from 'shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';

export class CaptchaSubmittedHandler extends BaseStateHandler {
  readonly state = JobState.CAPTCHA_SUBMITTED;

  async handle(context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    if (!context.bot || !context.captchaSolution) {
      throw new Error('CAPTCHA solution missing or bot not initialized');
    }
    
    await context.bot.enterCaptcha(context.captchaSolution);
    await context.bot.submitLogin();

    // Check if error message is shown (e.g. incorrect CAPTCHA)
    const errorMsg = await context.bot.getErrorMessage();
    if (errorMsg && (errorMsg.toLowerCase().includes('captcha') || errorMsg.toLowerCase().includes('invalid'))) {
      // Re-trigger WAITING_FOR_CAPTCHA if captcha was incorrect
      const hasCaptcha = await context.bot.isCaptchaPresent();
      if (hasCaptcha) {
        return JobState.WAITING_FOR_CAPTCHA;
      }
    }

    return JobState.WAITING_FOR_OTP;
  }
}
