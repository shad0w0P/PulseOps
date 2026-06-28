'use client';

import React, { useState } from 'react';
import { apiService } from '@/services/api';
import { createJobSchema } from '@anas/shared';
import { X, Play, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NewJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewJobDialog({ isOpen, onClose }: NewJobDialogProps) {
  const [pan, setPan] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate using Zod schema
    const validation = createJobSchema.safeParse({ pan });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Invalid PAN structure');
      return;
    }

    setSubmitting(true);
    try {
      const job = await apiService.createJob(validation.data.pan);
      onClose();
      // Redirect to the job Details/Observe page directly
      router.push(`/jobs/${job.jobId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start automation job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Launch New Automation Job</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-50 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Taxpayer PAN
            </label>
            <input
              type="text"
              placeholder="e.g. ABCDE1234F"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-semibold tracking-wider text-slate-700"
              maxLength={10}
            />
            <p className="text-[10px] text-slate-400">
              Format: 5 letters, 4 digits, 1 letter. e.g. ABCDE1234F
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/10 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              {submitting ? 'Launching...' : 'Launch Job'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
