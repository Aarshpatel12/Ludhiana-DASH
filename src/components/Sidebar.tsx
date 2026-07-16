import { fetchMasterDashboard } from '@/lib/dataFetcher';
import Link from 'next/link';
import { LayoutDashboard, Flag, Landmark } from 'lucide-react';
import UploadDropzone from './UploadDropzone';

export default async function Sidebar() {
  let masterData: any[] = [];
  let metadata: any = null;
  let totalRedFlags = 0;
  
  try {
    const res = await fetchMasterDashboard();
    masterData = res.data;
    metadata = res.metadata;
    totalRedFlags = masterData.reduce((acc, row) => acc + (parseInt(row['Flags']) || 0), 0);
  } catch (error) {
    console.error('Failed to load sidebar data:', error);
  }

  return (
    <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-300 flex flex-col h-screen shrink-0 overflow-y-auto transition-colors print:hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-xl mb-1">
          <Landmark className="w-6 h-6" />
          <span>DC Ludhiana</span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
          District Priority Agenda
          <br />
          Review & Tracking Portal
        </div>
      </div>

      {/* Main Nav */}
      <div className="p-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-md font-medium"
        >
          <LayoutDashboard className="w-4 h-4" />
          Executive Overview
        </Link>
        <Link 
          href="/red-flags"
          className="flex items-center justify-between px-3 py-2 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <div className="flex items-center gap-3">
            <Flag className="w-4 h-4 text-red-500" />
            Red Flags
          </div>
          <span className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-xs py-0.5 px-2 rounded-full font-bold">
            {totalRedFlags}
          </span>
        </Link>
      </div>

      {/* Officers List */}
      <div className="px-4 py-2 flex-1">
        <div className="text-xs font-semibold text-slate-500 tracking-wider mb-2 px-3">
          OFFICERS
        </div>
        <div className="space-y-1">
          {masterData.map((officer, idx) => (
            <Link
              key={idx}
              href={`/officer/${encodeURIComponent(officer['Officer / Tab'])}`}
              className="flex items-center justify-between px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md group transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 text-xs">▶</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                  {officer['Officer / Tab']}
                </span>
              </div>
              {parseInt(officer['Flags']) > 0 && (
                <span className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-xs py-0.5 px-2 rounded-full font-bold">
                  {officer['Flags']}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Instructions / Focus */}
      {metadata?.instructions && metadata.instructions.length > 0 && (
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest mb-3 px-3 uppercase">
            Weekly Meeting Focus
          </div>
          <div className="space-y-3 px-3 text-xs text-slate-500 dark:text-slate-400">
            {metadata.instructions.map((inst: string, idx: number) => {
              if (inst === 'WEEKLY MEETING FOCUS') return null;
              return (
                <p key={idx} className="leading-relaxed">
                  {inst}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Documentation */}
      <div className="px-4 py-4 mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900">
        <div className="text-xs font-semibold text-slate-500 tracking-wider mb-2 px-3">
          DOCUMENTATION
        </div>
        <div className="space-y-1">
          <Link
            href="/doc/Instructions"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Instructions
          </Link>
          <Link
            href="/doc/DataConnections"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Data Connections
          </Link>
        </div>
      </div>
      
      {/* Upload Dropzone */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900 pb-4">
        <UploadDropzone />
      </div>
    </div>
  );
}
