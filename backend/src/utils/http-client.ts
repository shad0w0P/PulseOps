import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { logger } from './logger';

/**
 * Create an Axios HTTP client with retry and logging.
 */
export function createHttpClient(baseURL: string, bearerToken: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  // Retry on network errors and 5xx responses
  axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response?.status !== undefined && error.response.status >= 500)
      );
    },
    onRetry: (retryCount, error) => {
      logger.warn(
        { retryCount, url: error.config?.url, status: error.response?.status },
        'Retrying HTTP request',
      );
    },
  });

  return client;
}
