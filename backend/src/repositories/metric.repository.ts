import { MetricModel, IMetricDocument } from '../models/metric.model';

/**
 * Repository for daily metric snapshots.
 */
export class MetricRepository {
  /**
   * Upsert a metric record for a given date.
   * Uses atomic MongoDB operations to avoid race conditions.
   */
  async incrementMetrics(
    date: string,
    fields: {
      totalRuns?: number;
      successCount?: number;
      failureCount?: number;
      cancelledCount?: number;
      totalDurationMs?: number;
      duration?: number;
    },
  ): Promise<IMetricDocument | null> {
    const inc: Record<string, number> = {};
    const push: Record<string, unknown> = {};

    if (fields.totalRuns) inc['totalRuns'] = fields.totalRuns;
    if (fields.successCount) inc['successCount'] = fields.successCount;
    if (fields.failureCount) inc['failureCount'] = fields.failureCount;
    if (fields.cancelledCount) inc['cancelledCount'] = fields.cancelledCount;
    if (fields.totalDurationMs) inc['totalDurationMs'] = fields.totalDurationMs;
    if (fields.duration) push['durations'] = fields.duration;

    const update: Record<string, unknown> = {};
    if (Object.keys(inc).length > 0) update['$inc'] = inc;
    if (Object.keys(push).length > 0) update['$push'] = push;

    return MetricModel.findOneAndUpdate({ date }, update, { upsert: true, new: true }).exec();
  }

  async findByDate(date: string): Promise<IMetricDocument | null> {
    return MetricModel.findOne({ date }).exec();
  }

  async findAll(): Promise<IMetricDocument[]> {
    return MetricModel.find().sort({ date: -1 }).limit(90).exec();
  }
}

export const metricRepository = new MetricRepository();
