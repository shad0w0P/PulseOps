/**
 * Phases map 1:1 with JobState but are used semantically in events
 * to describe "what phase of the automation was active when the event fired."
 *
 * Re-exported from states for clarity in the event context.
 */
export { JobState as Phase } from './states';
