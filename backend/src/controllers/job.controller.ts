import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service';
import { eventService } from '../services/event.service';
import { sseManager } from '../events/sse-manager';
import type { ApiResponse, JobListFilters } from 'shared';

/**
 * Job controller — thin layer between routes and services.
 * No business logic here; all logic is in services.
 */
export class JobController {
  /**
   * POST /jobs
   */
  async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pan } = req.body;
      const job = await jobService.createJob(pan);
      const response: ApiResponse<typeof job> = {
        success: true,
        data: job,
        message: 'Job created successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /jobs
   */
  async listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: JobListFilters = {
        status: req.query['status'] as any,
        pan: req.query['pan'] as string,
        page: req.query['page'] ? parseInt(req.query['page'] as string, 10) : undefined,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : undefined,
        sortBy: (req.query['sortBy'] as 'createdAt' | 'updatedAt') || 'createdAt',
        sortOrder: (req.query['sortOrder'] as 'asc' | 'desc') || 'desc',
      };
      const result = await jobService.listJobs(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /jobs/:id
   */
  async getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await jobService.getJob(req.params['id']!);
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /jobs/:id/otp
   */
  async submitOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await jobService.submitOtp(req.params['id']!, req.body.otp);
      res.json({ success: true, data: null, message: 'OTP submitted' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /jobs/:id/captcha
   */
  async submitCaptcha(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await jobService.submitCaptcha(req.params['id']!, req.body.captcha);
      res.json({ success: true, data: null, message: 'CAPTCHA submitted' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /jobs/:id/cancel
   */
  async cancelJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await jobService.cancelJob(req.params['id']!);
      res.json({ success: true, data: job, message: 'Job cancelled' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /jobs/:id/events
   */
  async getJobEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await eventService.getJobEvents(req.params['id']!);
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /jobs/:id/stream (SSE)
   */
  async streamJobEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jobId = req.params['id']!;
      const lastEventId = req.headers['last-event-id'] as string | undefined;

      // Verify job exists before opening SSE stream
      await jobService.getJob(jobId);

      await sseManager.registerConnection(jobId, res, lastEventId);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /jobs/:id/credentials
   */
  async getCredentials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials = await jobService.getCredentials(req.params['id']!);
      res.json({ success: true, data: credentials });
    } catch (error) {
      next(error);
    }
  }
}

export const jobController = new JobController();
