import { JobState, generateId, maskPan, TERMINAL_STATES, type Job, type JobListFilters, type JobListResponse } from 'shared';
import { jobRepository } from '../repositories/job.repository';
import { automationClientService } from './automation-client.service';
import { credentialService } from './credential.service';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/api-error';
import { logger } from '../utils/logger';

/**
 * Job service — orchestrates the job lifecycle.
 * Contains all business logic for creating, querying, and managing jobs.
 */
class JobService {
  /**
   * Create a new automation job.
   */
  async createJob(pan: string): Promise<Job> {
    const jobId = generateId();
    const requestId = generateId();
    const maskedPan = maskPan(pan);

    logger.info({ jobId, pan: maskedPan }, 'Creating new job');

    const jobDoc = await jobRepository.create({
      jobId,
      pan: maskedPan,
      requestId,
      status: JobState.CREATED,
    });

    // Fire-and-forget: start automation (don't block the response)
    this.startAutomation(jobId, pan, requestId).catch((error) => {
      logger.error({ error, jobId }, 'Failed to start automation');
    });

    return this.toJobResponse(jobDoc);
  }

  /**
   * Get a single job by ID.
   */
  async getJob(jobId: string): Promise<Job> {
    const jobDoc = await jobRepository.findByJobId(jobId);
    if (!jobDoc) {
      throw new NotFoundError('Job', jobId);
    }
    return this.toJobResponse(jobDoc);
  }

  /**
   * List jobs with pagination and filtering.
   */
  async listJobs(filters: JobListFilters): Promise<JobListResponse> {
    const { jobs, total } = await jobRepository.findAll(filters);
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    return {
      jobs: jobs.map((j) => this.toJobResponse(j)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Submit OTP for a waiting job.
   */
  async submitOtp(jobId: string, otp: string): Promise<void> {
    const jobDoc = await jobRepository.findByJobId(jobId);
    if (!jobDoc) {
      throw new NotFoundError('Job', jobId);
    }

    if (jobDoc.status !== JobState.WAITING_FOR_OTP) {
      throw new ConflictError(
        `Job ${jobId} is in state ${jobDoc.status}, not WAITING_FOR_OTP`,
      );
    }

    logger.info({ jobId }, 'Forwarding OTP to automation service');
    await automationClientService.submitOtp(jobId, otp);
  }

  /**
   * Submit CAPTCHA solution for a waiting job.
   */
  async submitCaptcha(jobId: string, captcha: string): Promise<void> {
    const jobDoc = await jobRepository.findByJobId(jobId);
    if (!jobDoc) {
      throw new NotFoundError('Job', jobId);
    }

    if (jobDoc.status !== JobState.WAITING_FOR_CAPTCHA) {
      throw new ConflictError(
        `Job ${jobId} is in state ${jobDoc.status}, not WAITING_FOR_CAPTCHA`,
      );
    }

    logger.info({ jobId }, 'Forwarding CAPTCHA to automation service');
    await automationClientService.submitCaptcha(jobId, captcha);
  }

  /**
   * Cancel a running job.
   */
  async cancelJob(jobId: string): Promise<Job> {
    const jobDoc = await jobRepository.findByJobId(jobId);
    if (!jobDoc) {
      throw new NotFoundError('Job', jobId);
    }

    if (TERMINAL_STATES.has(jobDoc.status)) {
      throw new ConflictError(`Job ${jobId} is already in terminal state ${jobDoc.status}`);
    }

    if (jobDoc.status !== JobState.WAITING_FOR_OTP) {
      throw new ConflictError(
        `Job ${jobId} can only be cancelled while WAITING_FOR_OTP, currently ${jobDoc.status}`,
      );
    }

    const updated = await jobRepository.updateStatus(jobId, JobState.CANCELLED, {
      completedAt: new Date(),
      durationMs: Date.now() - jobDoc.createdAt.getTime(),
    });

    // Notify automation service to clean up
    automationClientService.cancelJob(jobId).catch((error) => {
      logger.error({ error, jobId }, 'Failed to notify automation of cancellation');
    });

    if (!updated) {
      throw new NotFoundError('Job', jobId);
    }

    logger.info({ jobId }, 'Job cancelled');
    return this.toJobResponse(updated);
  }

  /**
   * Update job status (called by webhook handler).
   */
  async updateJobStatus(
    jobId: string,
    status: JobState,
    error?: string,
  ): Promise<void> {
    const additionalFields: Record<string, unknown> = {};

    if (TERMINAL_STATES.has(status)) {
      const jobDoc = await jobRepository.findByJobId(jobId);
      if (jobDoc) {
        additionalFields['completedAt'] = new Date();
        additionalFields['durationMs'] = Date.now() - jobDoc.createdAt.getTime();
      }
    }

    if (error) {
      additionalFields['error'] = error;
    }

    await jobRepository.updateStatus(jobId, status, additionalFields);
  }

  /**
   * Get credentials for a completed job.
   */
  async getCredentials(jobId: string) {
    const jobDoc = await jobRepository.findByJobId(jobId);
    if (!jobDoc) {
      throw new NotFoundError('Job', jobId);
    }

    if (jobDoc.status !== JobState.SUCCESS) {
      throw new BadRequestError(`Job ${jobId} is not in SUCCESS state`);
    }

    return credentialService.getDecryptedCredentials(jobId);
  }

  /**
   * Start automation via HTTP call.
   */
  private async startAutomation(jobId: string, pan: string, requestId: string): Promise<void> {
    await automationClientService.startJob(jobId, pan, requestId);
  }

  /**
   * Transform a Mongoose document to API response type.
   */
  private toJobResponse(doc: Record<string, any>): Job {
    return {
      jobId: doc.jobId,
      pan: doc.pan,
      status: doc.status,
      requestId: doc.requestId,
      createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
      updatedAt: doc.updatedAt?.toISOString?.() || doc.updatedAt,
      completedAt: doc.completedAt?.toISOString?.() || doc.completedAt || null,
      durationMs: doc.durationMs || null,
      error: doc.error || null,
      metadata: {
        browserSessionId: doc.metadata?.browserSessionId || null,
        automationVersion: doc.metadata?.automationVersion || '1.0.0',
      },
    };
  }
}

export const jobService = new JobService();
