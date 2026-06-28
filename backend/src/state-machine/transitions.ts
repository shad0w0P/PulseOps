import { JobState, VALID_TRANSITIONS, TERMINAL_STATES } from 'shared';

/**
 * Valid state transition map.
 * Imported from shared package for consistency across services.
 */
export const transitions = VALID_TRANSITIONS;

/**
 * Check if a transition from one state to another is valid.
 */
export function isValidTransition(from: JobState, to: JobState): boolean {
  const allowed = transitions[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

/**
 * Check if a state is terminal (no outgoing transitions).
 */
export function isTerminalState(state: JobState): boolean {
  return TERMINAL_STATES.has(state);
}
