import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { sseManager } from './events/sse-manager';
import { logger } from './utils/logger';

/**
 * Server bootstrap with graceful shutdown.
 */
async function main(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(env.port, () => {
      logger.info({ port: env.port, env: env.nodeEnv }, '🚀 Backend server started');
    });

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Received shutdown signal');

      // Stop accepting new connections
      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close all SSE connections
      sseManager.closeAll();

      // Disconnect from MongoDB
      await disconnectDatabase();

      logger.info('Graceful shutdown complete');
      process.exit(0);
    };

    // Register shutdown handlers
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason) => {
      logger.fatal({ reason }, 'Unhandled rejection');
      process.exit(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.fatal({ error }, 'Uncaught exception');
      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
}

main();
