'use client';

import React from 'react';
import { JobState, STATE_ORDER } from 'shared';
import { STATE_LABELS } from '@/lib/constants';
import { Check, AlertCircle, XCircle } from 'lucide-react';

interface StepperProps {
  currentStatus: JobState;
}

export function Stepper({ currentStatus }: StepperProps) {
  const activeIndex = STATE_ORDER.indexOf(currentStatus);
  const isFailed = currentStatus === JobState.FAILED;
  const isCancelled = currentStatus === JobState.CANCELLED;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wider">
        Automation Pipeline Progress
      </h3>

      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-2">
        {STATE_ORDER.map((state, index) => {
          const isCompleted = index < activeIndex || currentStatus === JobState.SUCCESS;
          const isActive = state === currentStatus;
          const isPending = index > activeIndex && currentStatus !== JobState.SUCCESS;

          let stepNumberClass = 'bg-slate-50 border-slate-200 text-slate-400';
          let icon = <span>{index + 1}</span>;

          if (isCompleted) {
            stepNumberClass = 'bg-emerald-50 border-emerald-500 text-emerald-600';
            icon = <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />;
          } else if (isActive) {
            if (isFailed) {
              stepNumberClass = 'bg-rose-50 border-rose-500 text-rose-600';
              icon = <AlertCircle className="w-4 h-4 text-rose-600 stroke-[3]" />;
            } else if (isCancelled) {
              stepNumberClass = 'bg-zinc-100 border-zinc-400 text-zinc-600';
              icon = <XCircle className="w-4 h-4 text-zinc-600 stroke-[3]" />;
            } else {
              stepNumberClass = 'bg-brand-50 border-brand-500 text-brand-600 ring-2 ring-brand-500/20';
              icon = <span className="animate-pulse">{index + 1}</span>;
            }
          }

          return (
            <div key={state} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 w-full last:flex-none">
              
              {/* Node bubble */}
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${stepNumberClass}`}>
                {icon}
              </div>

              {/* Text metadata labels */}
              <div className="flex flex-col md:items-center text-left md:text-center">
                <span className={`text-xs font-semibold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                  {STATE_LABELS[state] || state}
                </span>
                {isActive && (isFailed || isCancelled) && (
                  <span className={`text-[10px] font-bold ${isFailed ? 'text-rose-600' : 'text-slate-500'}`}>
                    {isFailed ? 'Error Blocked' : 'Cancelled'}
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
