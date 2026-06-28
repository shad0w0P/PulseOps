'use client';

import React from 'react';
import { RefreshCw, Play, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNewJobClick?: () => void;
}

export function Header({ title, subtitle, onNewJobClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* System Secure indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Secure Operator Session
        </div>

        {/* Start job button */}
        {onNewJobClick && (
          <button
            onClick={onNewJobClick}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/10 transition-all hover:scale-[1.01]"
          >
            <Play className="w-4 h-4 fill-white" />
            New Automation Job
          </button>
        )}
      </div>
    </header>
  );
}
