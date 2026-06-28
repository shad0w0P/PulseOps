import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validated environment configuration.
 * Fails fast at startup if required variables are missing.
 */
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
  port: parseInt(optionalEnv('PORT', '4000'), 10),

  // MongoDB
  mongodbUri: requireEnv('MONGODB_URI'),

  // Authentication
  apiBearerToken: requireEnv('API_BEARER_TOKEN'),
  webhookSecret: requireEnv('WEBHOOK_SECRET'),

  // Automation Service
  automationServiceUrl: requireEnv('AUTOMATION_SERVICE_URL'),
  automationBearerToken: requireEnv('AUTOMATION_BEARER_TOKEN'),

  // Encryption
  encryptionKey: requireEnv('ENCRYPTION_KEY'),

  // CORS
  corsOrigin: optionalEnv('CORS_ORIGIN', 'http://localhost:3000'),

  // Rate Limiting
  rateLimitWindowMs: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '60000'), 10),
  rateLimitMax: parseInt(optionalEnv('RATE_LIMIT_MAX', '100'), 10),

  isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  },

  isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
} as const;
