'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/layout/MetricCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobTable } from '@/components/jobs/JobTable';
import { NewJobDialog } from '@/components/jobs/NewJobDialog';
import { apiService } from '@/services/api';
import { type Job, type AggregatedMetrics } from 'shared';
import { PlayCircle, CheckCircle2, AlertTriangle, Timer, Activity, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch metrics and job lists
  const fetchData = async () => {
    try {
      const [jobsData, metricsData] = await Promise.all([
        apiService.listJobs({
          status: statusFilter ? (statusFilter as any) : undefined,
          pan: searchFilter ? searchFilter : undefined,
          limit: 50, // Display recent 50 jobs
        }),
        apiService.getMetrics(),
      ]);

      setJobs(jobsData.jobs);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Failed to poll dashboard data:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Initial fetch and poll configuration
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 4000); // Poll every 4 seconds for real-time overview

    return () => clearInterval(interval);
  }, [statusFilter, searchFilter]);

  const formatDurationText = (ms: number | null): string => {
    if (!ms) return '0s';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <>
      <Header
        title="Dashboard Overview"
        subtitle="Observe and control automated Income Tax Portal credential generation."
        onNewJobClick={() => setIsNewJobOpen(true)}
      />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Runs"
            value={metrics?.totalRuns ?? '--'}
            description="Historical job submissions"
            icon={PlayCircle}
            colorClass="text-brand-500 bg-brand-50 border-brand-100"
          />
          <MetricCard
            title="Success Rate"
            value={metrics ? `${metrics.successRate}%` : '--'}
            description="Landed successfully"
            icon={CheckCircle2}
            colorClass="text-emerald-500 bg-emerald-50 border-emerald-100"
          />
          <MetricCard
            title="Failure Rate"
            value={metrics ? `${metrics.failureRate}%` : '--'}
            description="Error terminations"
            icon={AlertTriangle}
            colorClass="text-rose-500 bg-rose-50 border-rose-100"
          />
          <MetricCard
            title="P50 Duration"
            value={metrics ? formatDurationText(metrics.p50DurationMs) : '--'}
            description="Median pipeline run duration"
            icon={Timer}
            colorClass="text-indigo-500 bg-indigo-50 border-indigo-100"
          />
          <MetricCard
            title="Active Jobs"
            value={metrics?.runningJobs ?? '--'}
            description="Currently running right now"
            icon={Activity}
            colorClass="text-cyan-500 bg-cyan-50 border-cyan-100"
          />
          <MetricCard
            title="Today's Runs"
            value={metrics?.todayRuns ?? '--'}
            description="Submitted since midnight"
            icon={Calendar}
            colorClass="text-slate-500 bg-slate-50 border-slate-100"
          />
        </div>

        {/* Filter bar */}
        <JobFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchFilter={searchFilter}
          onSearchChange={setSearchFilter}
        />

        {/* Listings Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Job Executions Table
          </h2>
          <JobTable jobs={jobs} loading={loadingJobs} />
        </div>

      </main>

      {/* New Job Dialog Modal */}
      <NewJobDialog isOpen={isNewJobOpen} onClose={() => setIsNewJobOpen(false)} />
    </>
  );
}
