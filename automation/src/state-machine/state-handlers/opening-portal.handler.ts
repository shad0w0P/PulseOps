import { JobState } from '@anas/shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';

export class OpeningPortalHandler extends BaseStateHandler {
  readonly state = JobState.OPENING_PORTAL;

  async handle(context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    if (!context.bot) {
      throw new Error('Bot not initialized');
    }
    await context.bot.navigateToPortal();
    return JobState.ENTERING_PAN;
  }
}
