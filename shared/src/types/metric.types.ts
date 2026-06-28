/**
 * Daily metric snapshot stored in MongoDB.
 */
export interface MetricSnapshot {
  date: string;
  totalRuns: number;
  successCount: number;
  failureCount: number;
  cancelledCount: number;
  totalDurationMs: number;
  /** Individual durations for percentile calculation */
  durations: number[];
  updatedAt: string;
}

/**
 * Aggregated metrics returned to the dashboard.
 */
export interface AggregatedMetrics {
  totalRuns: number;
  successRate: number;
  failureRate: number;
  averageDurationMs: number;
  p50DurationMs: number;
  p99DurationMs: number;
  runningJobs: number;
  todayRuns: number;
  todaySuccess: number;
  todayFailures: number;
}
