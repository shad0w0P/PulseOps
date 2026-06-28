import mongoose, { Document, Schema } from 'mongoose';

export interface IMetricDocument extends Document {
  date: string;
  totalRuns: number;
  successCount: number;
  failureCount: number;
  cancelledCount: number;
  totalDurationMs: number;
  durations: number[];
  updatedAt: Date;
}

const metricSchema = new Schema<IMetricDocument>(
  {
    date: { type: String, required: true, unique: true, index: true },
    totalRuns: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    cancelledCount: { type: Number, default: 0 },
    totalDurationMs: { type: Number, default: 0 },
    durations: { type: [Number], default: [] },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false,
  },
);

export const MetricModel = mongoose.model<IMetricDocument>('Metric', metricSchema);
