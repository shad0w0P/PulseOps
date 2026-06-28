/**
 * Finite State Machine — Job States
 *
 * These represent every possible state a job can be in during its lifecycle.
 * Terminal states (SUCCESS, FAILED, CANCELLED) have no outgoing transitions.
 */
export enum JobState {
  CREATED = 'CREATED',
  STARTING_BROWSER = 'STARTING_BROWSER',
  OPENING_PORTAL = 'OPENING_PORTAL',
  ENTERING_PAN = 'ENTERING_PAN',
  WAITING_FOR_CAPTCHA = 'WAITING_FOR_CAPTCHA',
  CAPTCHA_SUBMITTED = 'CAPTCHA_SUBMITTED',
  WAITING_FOR_OTP = 'WAITING_FOR_OTP',
  OTP_RECEIVED = 'OTP_RECEIVED',
  VERIFYING_OTP = 'VERIFYING_OTP',
  GENERATING_CREDENTIALS = 'GENERATING_CREDENTIALS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Valid FSM transitions.
 * Key = current state, Value = array of allowed next states.
 */
export const VALID_TRANSITIONS: Record<JobState, JobState[]> = {
  [JobState.CREATED]: [JobState.STARTING_BROWSER],
  [JobState.STARTING_BROWSER]: [JobState.OPENING_PORTAL, JobState.FAILED],
  [JobState.OPENING_PORTAL]: [JobState.ENTERING_PAN, JobState.FAILED],
  [JobState.ENTERING_PAN]: [JobState.WAITING_FOR_CAPTCHA, JobState.FAILED],
  [JobState.WAITING_FOR_CAPTCHA]: [JobState.CAPTCHA_SUBMITTED, JobState.FAILED],
  [JobState.CAPTCHA_SUBMITTED]: [JobState.WAITING_FOR_OTP, JobState.FAILED],
  [JobState.WAITING_FOR_OTP]: [JobState.OTP_RECEIVED, JobState.CANCELLED],
  [JobState.OTP_RECEIVED]: [JobState.VERIFYING_OTP],
  [JobState.VERIFYING_OTP]: [JobState.GENERATING_CREDENTIALS, JobState.FAILED],
  [JobState.GENERATING_CREDENTIALS]: [JobState.SUCCESS, JobState.FAILED],
  [JobState.SUCCESS]: [],
  [JobState.FAILED]: [],
  [JobState.CANCELLED]: [],
};

/** States that indicate the job is finished and immutable */
export const TERMINAL_STATES: ReadonlySet<JobState> = new Set([
  JobState.SUCCESS,
  JobState.FAILED,
  JobState.CANCELLED,
]);

/** States that require human interaction (OTP / CAPTCHA) */
export const WAITING_STATES: ReadonlySet<JobState> = new Set([
  JobState.WAITING_FOR_OTP,
  JobState.WAITING_FOR_CAPTCHA,
]);

/**
 * Ordered list of states for stepper UI.
 * Excludes FAILED and CANCELLED (they are overlaid on any step).
 */
export const STATE_ORDER: readonly JobState[] = [
  JobState.CREATED,
  JobState.STARTING_BROWSER,
  JobState.OPENING_PORTAL,
  JobState.ENTERING_PAN,
  JobState.WAITING_FOR_CAPTCHA,
  JobState.CAPTCHA_SUBMITTED,
  JobState.WAITING_FOR_OTP,
  JobState.OTP_RECEIVED,
  JobState.VERIFYING_OTP,
  JobState.GENERATING_CREDENTIALS,
  JobState.SUCCESS,
] as const;
