import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { jobCreationRateLimiter } from '../middleware/rate-limiter.middleware';
import { validateCreateJob } from '../validators/job.validator';
import { validateOtp } from '../validators/otp.validator';

const router = Router();

// All job routes require authentication
router.use(authMiddleware);

// POST /jobs — Create a new job
router.post('/', jobCreationRateLimiter, validateCreateJob, (req, res, next) =>
  jobController.createJob(req, res, next),
);

// GET /jobs — List all jobs
router.get('/', (req, res, next) => jobController.listJobs(req, res, next));

// GET /jobs/:id — Get single job
router.get('/:id', (req, res, next) => jobController.getJob(req, res, next));

// POST /jobs/:id/otp — Submit OTP
router.post('/:id/otp', validateOtp, (req, res, next) =>
  jobController.submitOtp(req, res, next),
);

// POST /jobs/:id/captcha — Submit CAPTCHA
router.post('/:id/captcha', (req, res, next) =>
  jobController.submitCaptcha(req, res, next),
);

// POST /jobs/:id/cancel — Cancel job
router.post('/:id/cancel', (req, res, next) => jobController.cancelJob(req, res, next));

// GET /jobs/:id/events — Get all events (REST)
router.get('/:id/events', (req, res, next) => jobController.getJobEvents(req, res, next));

// GET /jobs/:id/stream — SSE stream
router.get('/:id/stream', (req, res, next) => jobController.streamJobEvents(req, res, next));

// GET /jobs/:id/credentials — Get credentials
router.get('/:id/credentials', (req, res, next) =>
  jobController.getCredentials(req, res, next),
);

export default router;
