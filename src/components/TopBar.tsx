import { Search, RefreshCw } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function TopBar() {
  const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 transition-colors">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search agendas, KPIs, remarks, officers..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <div>
          Sheet data as on <span className="font-bold text-slate-700 dark:text-slate-200">{currentDate}</span> · synced <span className="font-bold text-slate-700 dark:text-slate-200">{currentTime}</span>
        </div>
        <ThemeToggle />
        <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md font-medium text-slate-700 dark:text-slate-200 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  );
}
