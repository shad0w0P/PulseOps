import mongoose, { Document, Schema } from 'mongoose';
import { JobState } from '@anas/shared';

export interface IJobDocument extends Document {
  jobId: string;
  pan: string;
  status: JobState;
  requestId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  durationMs: number | null;
  error: string | null;
  metadata: {
    browserSessionId: string | null;
    automationVersion: string;
  };
}

const jobSchema = new Schema<IJobDocument>(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    pan: { type: String, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(JobState),
      default: JobState.CREATED,
      index: true,
    },
    requestId: { type: String, required: true },
    completedAt: { type: Date, default: null },
    durationMs: { type: Number, default: null },
    error: { type: String, default: null },
    metadata: {
      browserSessionId: { type: String, default: null },
      automationVersion: { type: String, default: '1.0.0' },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    versionKey: false,
  },
);

// Compound index for sorting by recent activity
jobSchema.index({ updatedAt: -1 });
jobSchema.index({ status: 1, createdAt: -1 });

export const JobModel = mongoose.model<IJobDocument>('Job', jobSchema);
