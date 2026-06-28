'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  colorClass?: string;
}

export function MetricCard({ title, value, description, icon: Icon, colorClass = 'text-slate-600' }: MetricCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-start justify-between shadow-sm">
      <div className="space-y-2">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        <div className="text-3xl font-bold text-slate-800 tracking-tight">{value}</div>
        {description && <p className="text-xs text-slate-400 font-medium">{description}</p>}
      </div>

      <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100/50 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
