import { JobState } from '@anas/shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';

export class SuccessHandler extends BaseStateHandler {
  readonly state = JobState.SUCCESS;

  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return null; // Terminal state
  }
}
