'use client';

import React, { useState, useEffect, useRef } from 'react';
import { type AutomationEvent } from 'shared';
import { LOG_LEVEL_COLORS } from '@/lib/constants';
import { Terminal, Scroll, Play } from 'lucide-react';

interface LiveLogsProps {
  events: AutomationEvent[];
}

export function LiveLogs({ events }: LiveLogsProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, autoScroll]);

  const formatTime = (isoString: string): string => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
  };

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-2xl flex flex-col h-[420px] shadow-lg overflow-hidden font-mono text-xs">
      
      {/* Terminal Titlebar bar */}
      <div className="bg-slate-900 px-6 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-slate-200 font-bold tracking-wider text-[11px] uppercase">
            Automation Live Stream Console
          </span>
        </div>

        {/* Scroll management toggles */}
        <button
          onClick={() => setAutoScroll((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
            autoScroll
              ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              : 'bg-brand-500 text-white border-brand-400 hover:bg-brand-600 animate-pulse'
          }`}
        >
          {autoScroll ? (
            <>
              <Scroll className="w-3.5 h-3.5" />
              Pause Auto-Scroll
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              Resume Auto-Scroll
            </>
          )}
        </button>
      </div>

      {/* Screen logs body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 select-text scrollbar-thin scrollbar-thumb-slate-800">
        {events.length === 0 ? (
          <div className="text-slate-600 italic py-4">
            Connection initialized. Awaiting events stream...
          </div>
        ) : (
          events.map((event) => (
            <div key={event.eventId} className="flex items-start gap-3 leading-relaxed hover:bg-slate-900/40 py-0.5 rounded px-1 transition-colors">
              {/* Timestamp */}
              <span className="text-slate-500 select-none shrink-0 font-medium">
                [{formatTime(event.timestamp)}]
              </span>

              {/* FSM Phase badge prefix */}
              <span className="text-brand-400 select-none shrink-0 font-bold uppercase text-[10px]">
                {event.phase}
              </span>

              {/* Log Message */}
              <span className={`flex-1 break-all ${LOG_LEVEL_COLORS[event.level]}`}>
                {event.message}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

    </div>
  );
}
