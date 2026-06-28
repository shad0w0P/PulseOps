'use client';

import React from 'react';
import { JobState } from 'shared';
import { STATE_LABELS } from '@/lib/constants';
import { Search, SlidersHorizontal } from 'lucide-react';

interface JobFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  searchFilter: string;
  onSearchChange: (search: string) => void;
}

export function JobFilters({
  statusFilter,
  onStatusChange,
  searchFilter,
  onSearchChange,
}: JobFiltersProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by PAN..."
          value={searchFilter}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-100 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-slate-700 bg-slate-50/50"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden md:block" />
        
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full md:w-48 px-3 py-2 border border-slate-100 rounded-xl text-sm outline-none bg-slate-50/50 focus:border-brand-500 text-slate-700"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATE_LABELS).map(([state, label]) => (
            <option key={state} value={state}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
