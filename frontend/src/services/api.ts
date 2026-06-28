import { type Job, type JobListResponse, type JobListFilters, type ApiResponse, type AggregatedMetrics, type DecryptedCredential } from '@anas/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const BEARER_TOKEN = process.env.NEXT_PUBLIC_API_BEARER_TOKEN || 'your-api-bearer-token-here';

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${BEARER_TOKEN}`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();
  return result.data;
}

export const apiService = {
  /**
   * Create a new job.
   */
  async createJob(pan: string): Promise<Job> {
    return fetcher<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify({ pan }),
    });
  },

  /**
   * List jobs with optional filtering.
   */
  async listJobs(filters: JobListFilters = {}): Promise<JobListResponse> {
    const query = new URLSearchParams();
    if (filters.status) query.append('status', filters.status);
    if (filters.pan) query.append('pan', filters.pan);
    if (filters.page) query.append('page', String(filters.page));
    if (filters.limit) query.append('limit', String(filters.limit));
    if (filters.sortBy) query.append('sortBy', filters.sortBy);
    if (filters.sortOrder) query.append('sortOrder', filters.sortOrder);

    const queryString = query.toString();
    return fetcher<JobListResponse>(`/jobs${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get single job details.
   */
  async getJob(jobId: string): Promise<Job> {
    return fetcher<Job>(`/jobs/${jobId}`);
  },

  /**
   * Submit OTP to resume a waiting job.
   */
  async submitOtp(jobId: string, otp: string): Promise<void> {
    return fetcher<void>(`/jobs/${jobId}/otp`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  },

  /**
   * Submit CAPTCHA to resume a waiting job.
   */
  async submitCaptcha(jobId: string, captcha: string): Promise<void> {
    return fetcher<void>(`/jobs/${jobId}/captcha`, {
      method: 'POST',
      body: JSON.stringify({ captcha }),
    });
  },

  /**
   * Cancel an active job.
   */
  async cancelJob(jobId: string): Promise<Job> {
    return fetcher<Job>(`/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
  },

  /**
   * Fetch decrypted credentials for successful job.
   */
  async getCredentials(jobId: string): Promise<DecryptedCredential> {
    return fetcher<DecryptedCredential>(`/jobs/${jobId}/credentials`);
  },

  /**
   * Fetch dashboard aggregated metrics.
   */
  async getMetrics(): Promise<AggregatedMetrics> {
    return fetcher<AggregatedMetrics>('/metrics');
  },
};
