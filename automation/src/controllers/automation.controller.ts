import { Request, Response, NextFunction } from 'express';
import { automationService } from '../services/automation.service';
import { logger } from '../utils/logger';

export class AutomationController {
  async startJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId, pan, requestId } = req.body;
      if (!jobId || !pan || !requestId) {
        res.status(400).json({ success: false, error: 'jobId, pan, and requestId are required' });
        return;
      }

      // Start the job asynchronously (non-blocking)
      automationService.startJob(jobId, pan, requestId).catch((err) => {
        logger.error({ jobId, error: err.message }, 'Failed background startJob');
      });

      res.status(202).json({ success: true, message: 'Job start command accepted' });
    } catch (error) {
      next(error);
    }
  }

  async submitOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId, otp } = req.body;
      if (!jobId || !otp) {
        res.status(400).json({ success: false, error: 'jobId and otp are required' });
        return;
      }

      await automationService.submitOtp(jobId, otp);
      res.json({ success: true, message: 'OTP submitted' });
    } catch (error) {
      next(error);
    }
  }

  async submitCaptcha(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId, captcha } = req.body;
      if (!jobId || !captcha) {
        res.status(400).json({ success: false, error: 'jobId and captcha are required' });
        return;
      }

      await automationService.submitCaptcha(jobId, captcha);
      res.json({ success: true, message: 'CAPTCHA submitted' });
    } catch (error) {
      next(error);
    }
  }

  async cancelJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.body;
      if (!jobId) {
        res.status(400).json({ success: false, error: 'jobId is required' });
        return;
      }

      await automationService.cancelJob(jobId);
      res.json({ success: true, message: 'Job cancellation requested' });
    } catch (error) {
      next(error);
    }
  }

  async healthCheck(_req: Request, res: Response): Promise<void> {
    res.json({
      status: 'ok',
      runningJobs: automationService.getRunningJobCount(),
      timestamp: new Date().toISOString(),
    });
  }
}

export const automationController = new AutomationController();
