import { type AutomationEvent } from 'shared';
import { EventModel, IEventDocument } from '../models/event.model';

/**
 * Repository for Event data access.
 * Handles event persistence and replay queries.
 */
export class EventRepository {
  async create(event: AutomationEvent): Promise<IEventDocument> {
    const doc = new EventModel({
      ...event,
      timestamp: new Date(event.timestamp),
    });
    return doc.save();
  }

  async findByJobId(jobId: string): Promise<IEventDocument[]> {
    return EventModel.find({ jobId }).sort({ sequenceNumber: 1 }).exec();
  }

  /**
   * Find events after a given sequence number (for SSE replay).
   * Returns events in sequence order.
   */
  async findAfterSequence(jobId: string, afterSequence: number): Promise<IEventDocument[]> {
    return EventModel.find({
      jobId,
      sequenceNumber: { $gt: afterSequence },
    })
      .sort({ sequenceNumber: 1 })
      .exec();
  }

  /**
   * Get the latest sequence number for a job.
   * Returns 0 if no events exist.
   */
  async getLatestSequenceNumber(jobId: string): Promise<number> {
    const latest = await EventModel.findOne({ jobId })
      .sort({ sequenceNumber: -1 })
      .select({ sequenceNumber: 1 })
      .exec();
    return latest?.sequenceNumber || 0;
  }

  async countByJobId(jobId: string): Promise<number> {
    return EventModel.countDocuments({ jobId }).exec();
  }
}

export const eventRepository = new EventRepository();
