import { JobState, type AggregatedMetrics } from '@anas/shared';
import { metricRepository } from '../repositories/metric.repository';
import { jobRepository } from '../repositories/job.repository';
import { logger } from '../utils/logger';

/**
 * Metric service — aggregates and computes dashboard metrics.
 */
class MetricService {
  /**
   * Record a job completion in daily metrics.
   */
  async recordCompletion(finalState: JobState, durationMs: number): Promise<void> {
    const today = this.getTodayDate();
    const fields: Record<string, number> = { totalRuns: 1 };

    if (finalState === JobState.SUCCESS) {
      fields['successCount'] = 1;
    } else if (finalState === JobState.FAILED) {
      fields['failureCount'] = 1;
    } else if (finalState === JobState.CANCELLED) {
      fields['cancelledCount'] = 1;
    }

    if (durationMs > 0) {
      fields['totalDurationMs'] = durationMs;
    }

    await metricRepository.incrementMetrics(today, {
      ...fields,
      duration: durationMs > 0 ? durationMs : undefined,
    });

    logger.info({ date: today, finalState, durationMs }, 'Metrics updated');
  }

  /**
   * Compute aggregated metrics for the dashboard.
   */
  async getAggregatedMetrics(): Promise<AggregatedMetrics> {
    const allMetrics = await metricRepository.findAll();
    const today = this.getTodayDate();
    const todayMetric = allMetrics.find((m) => m.date === today);

    let totalRuns = 0;
    let totalSuccess = 0;
    let totalFailure = 0;
    const allDurations: number[] = [];

    for (const metric of allMetrics) {
      totalRuns += metric.totalRuns;
      totalSuccess += metric.successCount;
      totalFailure += metric.failureCount;
      allDurations.push(...metric.durations);
    }

    const runningJobs = await jobRepository.countRunning();
    const successRate = totalRuns > 0 ? (totalSuccess / totalRuns) * 100 : 0;
    const failureRate = totalRuns > 0 ? (totalFailure / totalRuns) * 100 : 0;
    const averageDurationMs =
      allDurations.length > 0
        ? allDurations.reduce((a, b) => a + b, 0) / allDurations.length
        : 0;

    return {
      totalRuns,
      successRate: Math.round(successRate * 100) / 100,
      failureRate: Math.round(failureRate * 100) / 100,
      averageDurationMs: Math.round(averageDurationMs),
      p50DurationMs: this.percentile(allDurations, 50),
      p99DurationMs: this.percentile(allDurations, 99),
      runningJobs,
      todayRuns: todayMetric?.totalRuns || 0,
      todaySuccess: todayMetric?.successCount || 0,
      todayFailures: todayMetric?.failureCount || 0,
    };
  }

  /**
   * Compute a percentile from an array of durations.
   */
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const arr = [...sorted].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, index)] ?? 0;
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0]!;
  }
}

export const metricService = new MetricService();
