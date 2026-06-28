'use client';

import React, { useState } from 'react';
import { apiService } from '@/services/api';
import { AlertCircle, Image, Check } from 'lucide-react';

interface CaptchaInputProps {
  jobId: string;
  isEnabled: boolean;
  captchaImageBase64: string | null;
}

export function CaptchaInput({ jobId, isEnabled, captchaImageBase64 }: CaptchaInputProps) {
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!captcha.trim()) {
      setError('CAPTCHA solution cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.submitCaptcha(jobId, captcha.trim());
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit CAPTCHA');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isEnabled) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 opacity-60 pointer-events-none select-none flex items-center gap-4">
        <Image className="w-8 h-8 text-slate-400" />
        <div>
          <h4 className="font-bold text-slate-700 text-sm">CAPTCHA Authorization</h4>
          <p className="text-xs text-slate-500">
            This module will activate if the portal presents a CAPTCHA.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <Check className="w-5 h-5 stroke-[3]" />
        </div>
        <div>
          <h4 className="font-bold text-emerald-800 text-sm">CAPTCHA Submitted</h4>
          <p className="text-xs text-emerald-600 font-medium">
            Resuming automation pipeline. Verifying CAPTCHA...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Image className="w-5 h-5 text-amber-700" />
        <h4 className="font-bold text-amber-900 text-sm">CAPTCHA Solution Required</h4>
      </div>

      <p className="text-xs text-amber-800 mb-4 font-medium">
        Solve the CAPTCHA image shown below to continue the login sequence.
      </p>

      {/* Renders image challenge from webhook metadata */}
      {captchaImageBase64 ? (
        <div className="bg-white p-3 rounded-xl border border-amber-300 w-fit mb-4 mx-auto shadow-sm">
          <img
            src={`data:image/png;base64,${captchaImageBase64}`}
            alt="Tax Portal CAPTCHA Challenge"
            className="h-12 w-auto object-contain select-none"
          />
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl border border-amber-300 text-center text-xs text-amber-600 italic mb-4 font-medium">
          Awaiting CAPTCHA image snapshot...
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Enter CAPTCHA characters"
          value={captcha}
          onChange={(e) => setCaptcha(e.target.value)}
          disabled={submitting}
          className="flex-1 px-4 py-2 border border-amber-300 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono font-bold tracking-widest text-slate-800"
        />
        <button
          type="submit"
          disabled={submitting || !captcha.trim()}
          className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/10 transition-all disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit CAPTCHA'}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-2 p-3 mt-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
