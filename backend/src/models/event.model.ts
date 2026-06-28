import mongoose, { Document, Schema } from 'mongoose';
import { EventLevel, JobState } from 'shared';

export interface IEventDocument extends Document {
  eventId: string;
  jobId: string;
  sequenceNumber: number;
  level: EventLevel;
  phase: JobState;
  step: string;
  message: string;
  timestamp: Date;
  requestId: string;
  metadata: Record<string, unknown>;
}

const eventSchema = new Schema<IEventDocument>(
  {
    eventId: { type: String, required: true, unique: true },
    jobId: { type: String, required: true },
    sequenceNumber: { type: Number, required: true },
    level: {
      type: String,
      required: true,
      enum: Object.values(EventLevel),
    },
    phase: {
      type: String,
      required: true,
      enum: Object.values(JobState),
    },
    step: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
    requestId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    versionKey: false,
  },
);

// Unique compound: no duplicate sequence numbers per job
eventSchema.index({ jobId: 1, sequenceNumber: 1 }, { unique: true });
// Time-ordered retrieval per job
eventSchema.index({ jobId: 1, timestamp: 1 });
// Filter by phase
eventSchema.index({ phase: 1 });

export const EventModel = mongoose.model<IEventDocument>('Event', eventSchema);
