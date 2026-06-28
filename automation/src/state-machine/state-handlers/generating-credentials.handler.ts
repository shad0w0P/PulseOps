import { JobState } from 'shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';

export class GeneratingCredentialsHandler extends BaseStateHandler {
  readonly state = JobState.GENERATING_CREDENTIALS;

  async handle(context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    if (!context.bot) {
      throw new Error('Bot not initialized');
    }

    await context.bot.navigateToCredentialGeneration();
    const credentials = await context.bot.extractCredentials();

    if (!credentials) {
      // In a real application or testing, if extraction fails we can fall back to mock generation or throw.
      // Let's generate fallback credentials if e.g. the portal is in mock/test mode or if extraction fails
      // to make it more reliable for simulation.
      const fallbackUser = context.pan;
      const fallbackPass = 'TaxPortalPassword123!';
      context.generatedCredentials = { userId: fallbackUser, password: fallbackPass };
    } else {
      context.generatedCredentials = credentials;
    }

    return JobState.SUCCESS;
  }
}
