import cors from 'cors';
import { env } from './env';

/**
 * CORS configuration.
 * Only allows the configured frontend origin.
 */
export const corsOptions: cors.CorsOptions = {
  origin: env.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Last-Event-ID'],
  credentials: true,
  maxAge: 86400, // 24 hours preflight cache
};
