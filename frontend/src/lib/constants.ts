import { JobState, EventLevel } from '@anas/shared';

export const STATE_LABELS: Record<JobState, string> = {
  [JobState.CREATED]: 'Created',
  [JobState.STARTING_BROWSER]: 'Starting Browser',
  [JobState.OPENING_PORTAL]: 'Opening Tax Portal',
  [JobState.ENTERING_PAN]: 'Entering PAN',
  [JobState.WAITING_FOR_CAPTCHA]: 'Waiting for CAPTCHA',
  [JobState.CAPTCHA_SUBMITTED]: 'CAPTCHA Submitted',
  [JobState.WAITING_FOR_OTP]: 'Waiting for OTP',
  [JobState.OTP_RECEIVED]: 'OTP Received',
  [JobState.VERIFYING_OTP]: 'Verifying OTP',
  [JobState.GENERATING_CREDENTIALS]: 'Generating Credentials',
  [JobState.SUCCESS]: 'Completed Successfully',
  [JobState.FAILED]: 'Failed',
  [JobState.CANCELLED]: 'Cancelled',
};

export const STATE_COLORS: Record<JobState, string> = {
  [JobState.CREATED]: 'bg-slate-100 text-slate-700 border-slate-200',
  [JobState.STARTING_BROWSER]: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
  [JobState.OPENING_PORTAL]: 'bg-blue-50 text-blue-700 border-blue-200',
  [JobState.ENTERING_PAN]: 'bg-blue-50 text-blue-700 border-blue-200',
  [JobState.WAITING_FOR_CAPTCHA]: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
  [JobState.CAPTCHA_SUBMITTED]: 'bg-blue-50 text-blue-700 border-blue-200',
  [JobState.WAITING_FOR_OTP]: 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse',
  [JobState.OTP_RECEIVED]: 'bg-blue-50 text-blue-700 border-blue-200',
  [JobState.VERIFYING_OTP]: 'bg-blue-50 text-blue-700 border-blue-200',
  [JobState.GENERATING_CREDENTIALS]: 'bg-blue-50 text-blue-700 border-blue-200',
  [JobState.SUCCESS]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [JobState.FAILED]: 'bg-rose-50 text-rose-700 border-rose-200',
  [JobState.CANCELLED]: 'bg-zinc-100 text-zinc-700 border-zinc-200',
};

export const LOG_LEVEL_COLORS: Record<EventLevel, string> = {
  [EventLevel.INFO]: 'text-slate-300',
  [EventLevel.WARN]: 'text-amber-400 font-medium',
  [EventLevel.ERROR]: 'text-rose-500 font-bold',
  [EventLevel.SUCCESS]: 'text-emerald-400 font-semibold',
};
