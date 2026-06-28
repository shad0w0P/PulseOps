import { JobState } from '@anas/shared';
import { BaseStateHandler, FSMContext, AutomationFSM } from '../automation-fsm';

export class FailedHandler extends BaseStateHandler {
  readonly state = JobState.FAILED;

  async handle(_context: FSMContext, _fsm: AutomationFSM): Promise<JobState | null> {
    return null; // Terminal state
  }
}
