import { JobState } from '@anas/shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';
import { TaxPortalBot } from '../../bot/tax-portal.bot';

export class StartingBrowserHandler extends BaseStateHandler {
  readonly state = JobState.STARTING_BROWSER;

  async handle(context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    const page = await context.browserManager.launch();
    context.bot = new TaxPortalBot(page);
    return JobState.OPENING_PORTAL;
  }
}
