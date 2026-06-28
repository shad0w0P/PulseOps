import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const env = {
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  port: parseInt(optionalEnv('PORT', '4001'), 10),

  // Backend webhook
  backendWebhookUrl: requireEnv('BACKEND_WEBHOOK_URL'),
  webhookSecret: requireEnv('WEBHOOK_SECRET'),

  // Backend auth
  backendBearerToken: requireEnv('BACKEND_BEARER_TOKEN'),

  // Timeouts
  otpTimeoutMs: parseInt(optionalEnv('OTP_TIMEOUT_MS', '300000'), 10),
  captchaTimeoutMs: parseInt(optionalEnv('CAPTCHA_TIMEOUT_MS', '180000'), 10),

  // Playwright
  headless: optionalEnv('HEADLESS', 'false') === 'true',
  slowMo: parseInt(optionalEnv('SLOW_MO', '0'), 10),

  // Portal
  portalUrl: optionalEnv(
    'PORTAL_URL',
    'https://eportal.incometax.gov.in/iec/foservices/#/login',
  ),

  isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  },
} as const;
