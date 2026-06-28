import express from 'express';
import automationRoutes from './routes/automation.routes';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware';

export function createApp(): express.Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register routes
  app.use('/', automationRoutes);

  // Global error handler
  app.use(errorHandlerMiddleware);

  return app;
}
