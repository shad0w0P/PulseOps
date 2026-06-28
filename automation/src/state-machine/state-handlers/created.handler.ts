import { JobState } from '@anas/shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';

export class CreatedHandler extends BaseStateHandler {
  readonly state = JobState.CREATED;

  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    // Immediate transition to STARTING_BROWSER
    return JobState.STARTING_BROWSER;
  }
}
