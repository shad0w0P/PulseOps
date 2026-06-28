'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { apiService } from '@/services/api';
import { type HealthResponse } from '@anas/shared';
import { Activity, Database, Cpu, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function StatusPage() {
  const [status, setStatus] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      // Direct call to /health endpoint which returns health status
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/../health`);
      if (!response.ok) {
        throw new Error('Failed to reach health endpoint');
      }
      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'System services are unreachable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header title="System Status Status" subtitle="Real-time connectivity monitoring of automation services." />

      <main className="p-8 space-y-6 max-w-4xl">
        {loading ? (
          <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Activity className="w-5 h-5 animate-spin text-brand-500" />
            Polling status nodes...
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-6 rounded-2xl">
            <div className="flex items-center gap-2 font-bold mb-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              API Server Offline
            </div>
            <p className="text-xs text-rose-600 mb-4">{error}</p>
            <button onClick={fetchStatus} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold">
              Retry Sync
            </button>
          </div>
        ) : status ? (
          <div className="space-y-6">
            
            {/* Main status indicator */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Health</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1 capitalize">
                  System {status.status}
                </h3>
              </div>
              <div className={`p-2 rounded-full ${status.status === 'ok' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>

            {/* Service details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Database Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-slate-400" />
                    <h4 className="font-bold text-slate-800 text-sm">MongoDB Instance</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    status.services.database === 'connected' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {status.services.database}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Holds persistent logging event sequence buffers, job configurations, encrypted credentials, and calculated daily metrics.
                </p>
              </div>

              {/* Automation service Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-slate-400" />
                    <h4 className="font-bold text-slate-800 text-sm">Playwright Bot Service</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    status.services.automation === 'reachable' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {status.services.automation}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Headless browser automation server that runs state handlers and executes taxpayer interactions.
                </p>
              </div>

            </div>

            {/* Metadata information block */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-xs text-slate-500 space-y-2">
              <p><span className="font-semibold text-slate-600">Platform Uptime:</span> {Math.round(status.uptime / 60)} minutes</p>
              <p><span className="font-semibold text-slate-600">Current Node Clock:</span> {new Date(status.timestamp).toLocaleString()}</p>
              <p><span className="font-semibold text-slate-600">Software Version:</span> v{status.version}</p>
            </div>

          </div>
        ) : null}
      </main>
    </>
  );
}
