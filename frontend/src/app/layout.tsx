import React from 'react';
import type { Metadata } from 'next';
import { Sidebar } from '@/components/layout/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaxFlow Automation Portal',
  description: 'Income Tax login credential generator observability dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50/50">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full flex font-sans select-none antialiased text-slate-600">
        
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content frame */}
        <div className="flex-1 pl-64 min-h-screen flex flex-col">
          {children}
        </div>

      </body>
    </html>
  );
}
