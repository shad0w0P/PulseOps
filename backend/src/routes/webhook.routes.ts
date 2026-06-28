import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';
import { webhookAuthMiddleware } from '../middleware/webhook-auth.middleware';
import { validateWebhookEvent } from '../validators/webhook.validator';

const router = Router();

// POST /webhook/events — Receive events from automation
router.post(
  '/events',
  webhookAuthMiddleware,
  validateWebhookEvent,
  (req, res, next) => webhookController.receiveEvent(req, res, next),
);

export default router;
