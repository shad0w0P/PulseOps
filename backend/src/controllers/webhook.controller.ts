import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/event.service';
import { logger } from '../utils/logger';

/**
 * Webhook controller — receives events from the automation service.
 */
export class WebhookController {
  /**
   * POST /webhook/events
   */
  async receiveEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await eventService.processWebhookEvent(req.body);
      res.status(202).json({ success: true, message: 'Event accepted' });
    } catch (error) {
      logger.error({ error, body: req.body }, 'Failed to process webhook event');
      next(error);
    }
  }
}

export const webhookController = new WebhookController();
