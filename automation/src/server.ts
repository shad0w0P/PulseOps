import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  const app = createApp();

  const server = app.listen(env.port, () => {
    logger.info({ port: env.port, env: env.nodeEnv }, '🚀 Automation service started');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal');

    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force exit after 10s if server close hangs
    setTimeout(() => {
      logger.warn('Forcing exit after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled rejection');
    process.exit(1);
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ error }, 'Uncaught exception');
    process.exit(1);
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start automation service');
  process.exit(1);
});
