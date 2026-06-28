import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { env } from './env';

/**
 * Connect to MongoDB with auto-reconnect and event logging.
 */
export async function connectDatabase(): Promise<void> {
  try {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });

    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to connect to MongoDB');
    throw error;
  }
}

/**
 * Gracefully disconnect from MongoDB.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully');
  } catch (error) {
    logger.error({ error }, 'Error disconnecting from MongoDB');
  }
}
