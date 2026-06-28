/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * API error response.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

/**
 * OTP submission request body.
 */
export interface OtpSubmitRequest {
  otp: string;
}

/**
 * CAPTCHA submission request body.
 */
export interface CaptchaSubmitRequest {
  captcha: string;
}

/**
 * Job creation request body.
 */
export interface CreateJobRequest {
  pan: string;
}

/**
 * Health check response.
 */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: 'connected' | 'disconnected';
    automation: 'reachable' | 'unreachable';
  };
}
