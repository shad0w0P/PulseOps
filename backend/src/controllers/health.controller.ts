import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { automationClientService } from '../services/automation-client.service';
import type { HealthResponse } from 'shared';

/**
 * Health check controller.
 */
export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const automationReachable = await automationClientService.healthCheck();

    const health: HealthResponse = {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      services: {
        database: dbStatus as 'connected' | 'disconnected',
        automation: automationReachable ? 'reachable' : 'unreachable',
      },
    };

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  }
}

export const healthController = new HealthController();
