'use client';

import React, { useState } from 'react';
import { apiService } from '@/services/api';
import { type DecryptedCredential } from 'shared';
import { Shield, Eye, EyeOff, Copy, Check, Lock } from 'lucide-react';

interface CredentialCardProps {
  jobId: string;
}

export function CredentialCard({ jobId }: CredentialCardProps) {
  const [credentials, setCredentials] = useState<DecryptedCredential | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'user' | 'pass' | null>(null);

  const fetchCredentials = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getCredentials(jobId);
      setCredentials(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch decrypted credentials');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!credentials && !loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm py-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-700 text-sm">Security Encrypted Credentials</h4>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Generated login details are stored encrypted. Click below to decrypt.
          </p>
        </div>
        <button
          onClick={fetchCredentials}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-500/10 transition-all hover:scale-[1.01]"
        >
          <Shield className="w-3.5 h-3.5" />
          Decrypt Credentials
        </button>
        {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm py-12">
        <div className="flex flex-col items-center gap-2 text-slate-500 text-xs font-semibold">
          <Lock className="w-6 h-6 animate-pulse text-brand-500" />
          <span>Decrypting secure records...</span>
        </div>
      </div>
    );
  }

  if (credentials) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
          <Shield className="w-5 h-5 text-brand-500" />
          <h4 className="font-bold text-slate-800 text-sm">Generated Login Credentials</h4>
        </div>

        {/* Username Row */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            User ID (PAN)
          </span>
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="font-mono font-bold text-slate-800 select-all tracking-wide">
              {credentials.userId}
            </span>
            <button
              onClick={() => copyToClipboard(credentials.userId, 'user')}
              className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            >
              {copiedField === 'user' ? (
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Password Row */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Portal Password
          </span>
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="font-mono font-bold text-slate-800 select-all tracking-wide">
              {showPassword ? credentials.password : '••••••••••••••••'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowPassword((prev) => !prev)}
                className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(credentials.password, 'pass')}
                className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                {copiedField === 'pass' ? (
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
          Credentials decrypted at operator session layer. Never share or print this raw password.
        </p>
      </div>
    );
  }

  return null;
}
