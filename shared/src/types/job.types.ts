import { JobState } from '../constants';

/**
 * Input required to create a new automation job.
 */
export interface JobInput {
  /** PAN number of the taxpayer (validated format: AAAAA0000A) */
  pan: string;
  /** Optional correlation ID from the caller */
  requestId?: string;
}

/**
 * Full job record as stored in MongoDB and returned by the API.
 */
export interface Job {
  jobId: string;
  /** Masked PAN — never stored raw */
  pan: string;
  status: JobState;
  requestId: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  /** Duration in milliseconds (null until completed) */
  durationMs: number | null;
  /** Error message if status is FAILED */
  error: string | null;
  metadata: JobMetadata;
}

export interface JobMetadata {
  browserSessionId: string | null;
  automationVersion: string;
}

/**
 * Paginated job list response.
 */
export interface JobListResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filters for listing jobs.
 */
export interface JobListFilters {
  status?: JobState;
  pan?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
