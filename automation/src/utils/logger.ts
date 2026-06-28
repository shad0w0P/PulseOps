import pino from 'pino';
import { env } from '../config/env';

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
  redact: {
    paths: ['password', 'otp', 'pan', 'credentials.password', 'credentials.userId'],
    censor: '[REDACTED]',
  },
});
