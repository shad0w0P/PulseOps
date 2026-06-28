import { Request, Response, NextFunction } from 'express';
import { metricService } from '../services/metric.service';

/**
 * Metric controller.
 */
export class MetricController {
  /**
   * GET /metrics
   */
  async getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await metricService.getAggregatedMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
}

export const metricController = new MetricController();
