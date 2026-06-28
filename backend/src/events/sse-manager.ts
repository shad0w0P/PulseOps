import { Response } from 'express';
import { type AutomationEvent } from '@anas/shared';
import { eventBus } from './event-bus';
import { eventRepository } from '../repositories/event.repository';
import { logger } from '../utils/logger';

interface SSEConnection {
  res: Response;
  unsubscribe: () => void;
}

/**
 * Manages Server-Sent Event connections per job.
 *
 * Responsibilities:
 * 1. Register SSE connections.
 * 2. Replay missed events on reconnect (using Last-Event-ID).
 * 3. Forward live events from the event bus to connected clients.
 * 4. Clean up on disconnect.
 */
class SSEManager {
  /** Map of jobId → set of active SSE connections */
  private connections = new Map<string, Set<SSEConnection>>();

  /**
   * Register a new SSE connection for a job.
   * If lastEventId is provided, replay missed events first.
   */
  async registerConnection(
    jobId: string,
    res: Response,
    lastEventId?: string,
  ): Promise<void> {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ jobId })}\n\n`);

    // Replay missed events if reconnecting
    if (lastEventId) {
      const afterSequence = parseInt(lastEventId, 10);
      if (!isNaN(afterSequence)) {
        await this.replayEvents(jobId, afterSequence, res);
      }
    }

    // Subscribe to live events from the event bus
    const unsubscribe = eventBus.subscribeToJob(jobId, (event: AutomationEvent) => {
      this.sendEvent(res, event);
    });

    const connection: SSEConnection = { res, unsubscribe };

    // Track the connection
    if (!this.connections.has(jobId)) {
      this.connections.set(jobId, new Set());
    }
    this.connections.get(jobId)!.add(connection);

    // Handle client disconnect
    res.on('close', () => {
      this.removeConnection(jobId, connection);
    });

    // Send keepalive every 30 seconds
    const keepalive = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch {
        clearInterval(keepalive);
      }
    }, 30000);

    res.on('close', () => clearInterval(keepalive));

    logger.info(
      { jobId, lastEventId, activeConnections: this.connections.get(jobId)?.size },
      'SSE connection registered',
    );
  }

  /**
   * Replay events after a sequence number.
   */
  private async replayEvents(
    jobId: string,
    afterSequence: number,
    res: Response,
  ): Promise<void> {
    const missedEvents = await eventRepository.findAfterSequence(jobId, afterSequence);

    logger.info(
      { jobId, afterSequence, replayed: missedEvents.length },
      'Replaying missed events',
    );

    for (const eventDoc of missedEvents) {
      const event: AutomationEvent = {
        eventId: eventDoc.eventId,
        jobId: eventDoc.jobId,
        sequenceNumber: eventDoc.sequenceNumber,
        level: eventDoc.level,
        phase: eventDoc.phase,
        step: eventDoc.step,
        message: eventDoc.message,
        timestamp: eventDoc.timestamp.toISOString(),
        requestId: eventDoc.requestId,
        metadata: eventDoc.metadata,
      };
      this.sendEvent(res, event);
    }
  }

  /**
   * Send a single SSE event to a response stream.
   */
  private sendEvent(res: Response, event: AutomationEvent): void {
    try {
      const data = JSON.stringify(event);
      res.write(`id: ${event.sequenceNumber}\n`);
      res.write(`event: automation-event\n`);
      res.write(`data: ${data}\n\n`);
    } catch (error) {
      logger.error({ error, jobId: event.jobId }, 'Failed to send SSE event');
    }
  }

  /**
   * Remove a connection from tracking and clean up.
   */
  private removeConnection(jobId: string, connection: SSEConnection): void {
    connection.unsubscribe();
    const jobConnections = this.connections.get(jobId);
    if (jobConnections) {
      jobConnections.delete(connection);
      if (jobConnections.size === 0) {
        this.connections.delete(jobId);
      }
    }
    logger.info(
      { jobId, remaining: this.connections.get(jobId)?.size || 0 },
      'SSE connection removed',
    );
  }

  /**
   * Get the count of active connections for a job.
   */
  getConnectionCount(jobId: string): number {
    return this.connections.get(jobId)?.size || 0;
  }

  /**
   * Close all connections. Used during graceful shutdown.
   */
  closeAll(): void {
    for (const [_jobId, connections] of this.connections) {
      for (const conn of connections) {
        conn.unsubscribe();
        try {
          conn.res.end();
        } catch {
          // Connection may already be closed
        }
      }
      connections.clear();
    }
    this.connections.clear();
    logger.info('All SSE connections closed');
  }
}

export const sseManager = new SSEManager();
