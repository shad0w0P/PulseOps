import { JobState, type IStateMachine } from '@anas/shared';
import { isValidTransition, isTerminalState } from './transitions';
import { ConflictError } from '../utils/api-error';
import { logger } from '../utils/logger';

/**
 * Job state machine.
 * Validates state transitions for a specific job.
 * Each job has its own FSM instance (created per-request, not shared).
 */
export class JobStateMachine implements IStateMachine {
  private currentState: JobState;
  private readonly jobId: string;

  constructor(jobId: string, initialState: JobState = JobState.CREATED) {
    this.jobId = jobId;
    this.currentState = initialState;
  }

  getCurrentState(): JobState {
    return this.currentState;
  }

  /**
   * Attempt a state transition.
   * Throws ConflictError if the transition is invalid.
   */
  transition(to: JobState): boolean {
    if (!this.canTransition(to)) {
      const msg = `Invalid state transition for job ${this.jobId}: ${this.currentState} → ${to}`;
      logger.warn({ jobId: this.jobId, from: this.currentState, to }, msg);
      throw new ConflictError(msg);
    }

    const from = this.currentState;
    this.currentState = to;

    logger.info(
      { jobId: this.jobId, from, to },
      `State transition: ${from} → ${to}`,
    );

    return true;
  }

  canTransition(to: JobState): boolean {
    return isValidTransition(this.currentState, to);
  }

  isTerminal(): boolean {
    return isTerminalState(this.currentState);
  }
}
