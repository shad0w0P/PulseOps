import pino from 'pino';
import { env } from '../config/env';

/**
 * Structured logger using pino.
 * Pretty-prints in development, JSON in production.
 */
export const logger = pino({
  level: env.isDevelopment() ? 'debug' : 'info',
  transport: env.isDevelopment()
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  // Redact any accidentally logged sensitive fields
  redact: {
    paths: ['password', 'otp', 'pan', 'credentials.password', 'credentials.userId'],
    censor: '[REDACTED]',
  },
});
