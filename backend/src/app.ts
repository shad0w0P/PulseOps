import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { apiRateLimiter } from './middleware/rate-limiter.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware';
import jobRoutes from './routes/job.routes';
import webhookRoutes from './routes/webhook.routes';
import metricRoutes from './routes/metric.routes';
import healthRoutes from './routes/health.routes';

/**
 * Express application factory.
 * Creates and configures the Express app without starting the server.
 * This separation enables testing with supertest.
 */
export function createApp(): express.Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(cors(corsOptions));

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request ID for correlation
  app.use(requestIdMiddleware);

  // Rate limiting
  app.use('/api/v1', apiRateLimiter);

  // Routes
  app.use('/api/v1/jobs', jobRoutes);
  app.use('/api/v1/webhook', webhookRoutes);
  app.use('/api/v1/metrics', metricRoutes);
  app.use('/health', healthRoutes);

  // Global error handler (must be last)
  app.use(errorHandlerMiddleware);

  return app;
}
