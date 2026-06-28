import { JobState } from 'shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';
import { captchaBridge } from '../../bot/captcha-handler';
import { logger } from '../../utils/logger';

export class WaitingCaptchaHandler extends BaseStateHandler {
  readonly state = JobState.WAITING_FOR_CAPTCHA;

  async handle(context: FSMContext, fsm: AutomationFSM): Promise<JobState | null> {
    if (!context.bot) {
      throw new Error('Bot not initialized');
    }

    const captchaImageBase64 = await context.bot.captureCaptchaImage();
    if (!captchaImageBase64) {
      logger.warn({ jobId: context.jobId }, 'CAPTCHA was expected but image could not be captured');
    }

    // Transition to WAITING_FOR_CAPTCHA first via FSM to notify backend, sending the captcha image in metadata
    await fsm.transitionTo(
      JobState.WAITING_FOR_CAPTCHA,
      'CAPTCHA screenshot captured',
      'Please enter the CAPTCHA solution shown in the dashboard',
      { captchaImage: captchaImageBase64 }
    );

    // Wait on bridge for solution
    const solution = await captchaBridge.waitForCaptcha(context.jobId);
    context.captchaSolution = solution;

    return JobState.CAPTCHA_SUBMITTED;
  }
}
