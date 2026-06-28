import { JobState } from '../constants';

/**
 * Interface for the finite state machine engine.
 */
export interface IStateMachine {
  /** Get the current state */
  getCurrentState(): JobState;

  /** Attempt a transition. Returns true if valid, throws if invalid. */
  transition(to: JobState): boolean;

  /** Check if a transition is valid without performing it */
  canTransition(to: JobState): boolean;

  /** Check if the current state is terminal */
  isTerminal(): boolean;
}
