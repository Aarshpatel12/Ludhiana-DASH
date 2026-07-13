import { fetchMasterDashboard, fetchOfficerData } from '@/lib/dataFetcher';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import RedFlagsCharts from '@/components/RedFlagsCharts';

export default async function RedFlagsPage() {
  let masterData: any[] = [];
  try {
    const { data } = await fetchMasterDashboard();
    masterData = data;
  } catch (error) {
    console.error('Error fetching master data for red flags:', error);
  }

  let allFlags: any[] = [];

  // Fetch and filter flags from all officers
  for (const officer of masterData) {
    try {
      const officerData = await fetchOfficerData(officer['Officer / Tab']);
      for (const row of officerData) {
        const hasFlag = row['Auto-Flag'] && row['Auto-Flag'].trim() !== '';
        const isPending = row['Status']?.toLowerCase().includes('pending') || row['Status']?.toLowerCase().includes('blocked');
        const isBottom = row['Bottom Performer'] && row['Bottom Performer'].trim() !== '0' && row['Bottom Performer'].trim() !== '';
        
        if (hasFlag || isPending || isBottom) {
          allFlags.push({ ...row, _officerName: officer['Officer / Tab'] });
        }
      }
    } catch (error) {
      console.error(`Error fetching data for ${officer['Officer / Tab']}:`, error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 transition-colors">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Overview</Link>
          <span>/</span>
          <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Red Flags
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">District Red Flags</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Showing {allFlags.length} flagged, pending, or blocked items across all officers.
        </p>
      </div>
      
      {allFlags.length > 0 && <RedFlagsCharts flagsData={allFlags} />}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm overflow-hidden transition-colors">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/50 text-left text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider">
              <th className="px-6 py-4 w-[15%]">Officer</th>
              <th className="px-6 py-4 w-1/3">Agenda & Metric</th>
              <th className="px-6 py-4 w-1/4">Status & Action</th>
              <th className="px-6 py-4 w-1/4">Flags & Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {allFlags.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl mb-3">🎉</span>
                    <span className="font-medium text-lg text-slate-700 dark:text-slate-300">No red flags!</span>
                    <span>All items are currently on track.</span>
                  </div>
                </td>
              </tr>
            ) : (
              allFlags.map((row, idx) => {
                const hasFlag = row['Auto-Flag'] && row['Auto-Flag'].trim() !== '';
                const isBottom = row['Bottom Performer'] && row['Bottom Performer'].trim() !== '0' && row['Bottom Performer'].trim() !== '';
                
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/officer/${encodeURIComponent(row._officerName)}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
                        {row._officerName}
                      </Link>
                      {row['Key'] && <div className="text-[9px] mt-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded px-1.5 py-0.5 max-w-fit">{row['Key']}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{row['Priority Agenda']}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{row['KPI / Metric']}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5" /> {row['Status'] || 'Pending / Flagged'}
                      </span>
                      {row['Concerned Officer'] && (
                        <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md inline-flex">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Owner:</span> {row['Concerned Officer']}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {row['Remarks / Context'] || <span className="text-slate-400 italic">No remarks</span>}
                      {hasFlag && (
                        <div className="mt-2 text-red-600 dark:text-red-400 font-medium text-xs bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded-md block border border-red-200 dark:border-red-900">
                          🔴 Auto-Flag: {row['Auto-Flag']}
                        </div>
                      )}
                      {isBottom && (
                        <div className="mt-2 text-amber-700 dark:text-amber-400 font-medium text-[11px] bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-md block border border-amber-200 dark:border-amber-900">
                          ⚠️ Bottom Performer: {row['Bottom Performer']}
                        </div>
                      )}
                      {(row['Updated By'] || row['Update Date']) && (
                        <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 flex justify-between border-t border-slate-100 dark:border-slate-800/50 pt-2 uppercase tracking-wide">
                           <span>By: {row['Updated By'] || 'System'}</span>
                           <span>{row['Update Date']}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
