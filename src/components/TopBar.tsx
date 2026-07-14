"use client";

import { RefreshCw, Printer } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function TopBar() {
  const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 transition-colors print:hidden">
      <div className="flex-1 max-w-xl">
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">District Executive Dashboard</h2>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <div className="hidden md:block">
          Data as on <span className="font-bold text-slate-700 dark:text-slate-200">{currentDate}</span>
        </div>
        <ThemeToggle />
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-md font-bold transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </button>
      </div>
    </div>
  );
}
