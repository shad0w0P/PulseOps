'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, Database, ShieldAlert, Cpu } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'System Status', href: '/status', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand logo header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold shadow-sm shadow-brand-500/20">
            T
          </div>
          <span className="font-bold text-slate-800 text-lg leading-none tracking-tight">
            TaxFlow <span className="text-brand-500 font-medium text-xs block">Automation</span>
          </span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer info box */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-1.5">
          <Cpu className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-semibold text-slate-700">Automation Engine</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Observation platform for real-time Income Tax Portal login credential generation.
        </p>
      </div>
    </aside>
  );
}
