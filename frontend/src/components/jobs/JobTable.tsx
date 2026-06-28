'use client';

import React from 'react';
import Link from 'next/link';
import { type Job } from '@anas/shared';
import { STATE_LABELS, STATE_COLORS } from '@/lib/constants';
import { Eye, Clock } from 'lucide-react';

interface JobTableProps {
  jobs: Job[];
  loading: boolean;
}

export function JobTable({ jobs, loading }: JobTableProps) {
  const formatDuration = (ms: number | null): string => {
    if (!ms) return '--';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
        <div className="flex justify-center items-center gap-2 text-slate-500 text-sm">
          <Clock className="w-5 h-5 animate-spin text-brand-500" />
          Loading jobs...
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
        <p className="text-slate-400 text-sm">No automation runs match the filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
              <th className="px-6 py-4">Job ID</th>
              <th className="px-6 py-4">Masked PAN</th>
              <th className="px-6 py-4">Current Phase</th>
              <th className="px-6 py-4">Started Time</th>
              <th className="px-6 py-4">Updated Time</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Outcome</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {jobs.map((job) => (
              <tr key={job.jobId} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-500 font-medium">
                  {job.jobId.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {job.pan}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATE_COLORS[job.status] || ''}`}>
                    {STATE_LABELS[job.status] || job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {formatDate(job.createdAt)}
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {formatDate(job.updatedAt)}
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                  {formatDuration(job.durationMs)}
                </td>
                <td className="px-6 py-4">
                  {job.status === 'SUCCESS' ? (
                    <span className="text-emerald-600 font-semibold text-xs">Success</span>
                  ) : job.status === 'FAILED' ? (
                    <span className="text-rose-600 font-semibold text-xs">Failed</span>
                  ) : job.status === 'CANCELLED' ? (
                    <span className="text-slate-500 font-semibold text-xs">Cancelled</span>
                  ) : (
                    <span className="text-brand-500 font-medium text-xs animate-pulse">Running</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/jobs/${job.jobId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-600 text-xs font-semibold transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Observe
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
