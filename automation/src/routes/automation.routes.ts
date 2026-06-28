import { Router } from 'express';
import { automationController } from '../controllers/automation.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Health check endpoint (public)
router.get('/health', (req, res) => automationController.healthCheck(req, res));

// Secure automation endpoints
router.use(authMiddleware);

router.post('/automation/start', (req, res, next) => automationController.startJob(req, res, next));
router.post('/automation/otp', (req, res, next) => automationController.submitOtp(req, res, next));
router.post('/automation/captcha', (req, res, next) => automationController.submitCaptcha(req, res, next));
router.post('/automation/cancel', (req, res, next) => automationController.cancelJob(req, res, next));

export default router;
