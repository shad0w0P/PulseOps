'use client';

import React, { useState, useEffect, use } from 'react';
import { apiService } from '@/services/api';
import { useSSE } from '@/hooks/useSSE';
import { Stepper } from '@/components/job-detail/Stepper';
import { LiveLogs } from '@/components/job-detail/LiveLogs';
import { OtpInput } from '@/components/job-detail/OtpInput';
import { CaptchaInput } from '@/components/job-detail/CaptchaInput';
import { CredentialCard } from '@/components/job-detail/CredentialCard';
import { Header } from '@/components/layout/Header';
import { type Job, JobState } from '@anas/shared';
import { STATE_LABELS, STATE_COLORS } from '@/lib/constants';
import { AlertCircle, ArrowLeft, Ban, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';

interface JobDetailsProps {
  params: Promise<{ id: string }>;
}

export default function JobDetails({ params }: JobDetailsProps) {
  // Await params promise in Next.js 15
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;

  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);

  // Initialize SSE event stream
  const { events, status: sseStatus, setEvents } = useSSE({
    jobId,
    onEvent: (event) => {
      // If event has a CAPTCHA image, load it into state
      if (event.metadata?.captchaImage) {
        setCaptchaImage(event.metadata.captchaImage as string);
      }
      
      // Update job state dynamically from event logs
      setJob((prevJob) => {
        if (!prevJob) return null;
        return {
          ...prevJob,
          status: event.phase,
          error: event.phase === JobState.FAILED ? event.message : prevJob.error,
        };
      });
    },
  });

  // Initial fetch of the job metadata and historic REST events (for bootstrap sync)
  const fetchJobAndHistory = async () => {
    try {
      const [jobData, historyData] = await Promise.all([
        apiService.getJob(jobId),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/jobs/${jobId}/events`, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_BEARER_TOKEN || 'your-api-bearer-token-here'}`
          }
        }).then(res => res.json()).then(res => res.data)
      ]);

      setJob(jobData);
      
      if (historyData && Array.isArray(historyData)) {
        // Hydrate SSE events stream state with historical logs
        setEvents(historyData);
        // Extract captcha if already present in history
        const captchaEvent = historyData.find((e: any) => e.metadata?.captchaImage);
        if (captchaEvent) {
          setCaptchaImage(captchaEvent.metadata.captchaImage);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job details');
    }
  };

  useEffect(() => {
    fetchJobAndHistory();
  }, [jobId]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this automation run?')) return;
    setCancelling(true);
    try {
      const updated = await apiService.cancelJob(jobId);
      setJob(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel job');
    } finally {
      setCancelling(false);
    }
  };

  if (error) {
    return (
      <>
        <Header title="Automation Observer" />
        <div className="p-8">
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl flex items-start gap-3 text-sm max-w-lg">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">Error Loading Records</h4>
              <p className="mt-1">{error}</p>
              <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-rose-800 underline">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Header title="Automation Observer" />
        <div className="p-8">
          <div className="text-slate-500 text-xs font-semibold flex items-center gap-2">
            <Cpu className="w-5 h-5 animate-pulse text-brand-500" />
            Syncing database pipelines...
          </div>
        </div>
      </>
    );
  }

  const isTerminal = job.status === JobState.SUCCESS || job.status === JobState.FAILED || job.status === JobState.CANCELLED;

  return (
    <>
      <Header
        title={`Observe Job: ${jobId.slice(0, 8)}...`}
        subtitle={`Real-time observation panel for PAN: ${job.pan}`}
      />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl w-full">
        
        {/* Breadcrumb row & status indicators */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Link>

          <div className="flex items-center gap-3">
            {/* SSE state flag */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border select-none ${
              sseStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
            }`}>
              <span className={`w-2 h-2 rounded-full ${sseStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {sseStatus === 'connected' ? 'Live Stream Active' : 'Connecting stream...'}
            </span>

            {/* FSM Status state badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold border select-none ${STATE_COLORS[job.status]}`}>
              Status: {STATE_LABELS[job.status] || job.status}
            </span>

            {/* Cancel Button */}
            {job.status === JobState.WAITING_FOR_OTP && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-full transition-all disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                Cancel Run
              </button>
            )}
          </div>
        </div>

        {/* Stepper Node Progress */}
        <Stepper currentStatus={job.status} />

        {/* Observation grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Logs Column */}
          <div className="lg:col-span-2 space-y-4">
            <LiveLogs events={events} />
          </div>

          {/* Side Operator Input Modules */}
          <div className="space-y-6">
            
            {/* CAPTCHA solve module */}
            <CaptchaInput
              jobId={jobId}
              isEnabled={job.status === JobState.WAITING_FOR_CAPTCHA}
              captchaImageBase64={captchaImage}
            />

            {/* OTP Input module */}
            <OtpInput
              jobId={jobId}
              isEnabled={job.status === JobState.WAITING_FOR_OTP}
            />

            {/* Decrypted credentials storage output card */}
            {job.status === JobState.SUCCESS && (
              <CredentialCard jobId={jobId} />
            )}

            {/* Connection Information */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-xs text-slate-500 space-y-3">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                Pipeline Security Audit
              </div>
              <div className="space-y-1.5">
                <p>
                  <span className="font-semibold text-slate-600">Correlation ID:</span>{' '}
                  <span className="font-mono text-[10px]">{job.requestId}</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-600">Created:</span>{' '}
                  {new Date(job.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold text-slate-600">Updated:</span>{' '}
                  {new Date(job.updatedAt).toLocaleString()}
                </p>
                {job.durationMs && (
                  <p>
                    <span className="font-semibold text-slate-600">Total Run Time:</span>{' '}
                    {Math.round(job.durationMs / 100) / 10}s
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>

      </main>
    </>
  );
}
