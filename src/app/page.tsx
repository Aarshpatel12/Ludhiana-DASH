import { fetchMasterDashboard, SHEET_ID, SHEET_GIDS } from '@/lib/dataFetcher';
import Link from 'next/link';
import MasterCharts from '@/components/MasterCharts';

export default async function Home() {
  const { data, metadata } = await fetchMasterDashboard();

  let totalItems = 0;
  let completed = 0;
  let inProgress = 0;
  let atRisk = 0;
  let redFlags = 0;

  data.forEach((row) => {
    totalItems += parseInt(row['Total KPIs']) || 0;
    completed += parseInt(row['Completed']) || 0;
    inProgress += parseInt(row['In Progress']) || parseInt(row['On Track']) || 0;
    atRisk += parseInt(row['Pending/Blocked']) || 0;
    redFlags += parseInt(row['Flags']) || 0;
  });

  const percentDone = totalItems > 0 ? ((completed / totalItems) * 100).toFixed(1) : '0.0';

  const sheetGid = (SHEET_GIDS as any)['Master Dashboard'] || '0';
  const editUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${sheetGid}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 transition-colors">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metadata.title || 'Executive Overview'}</h1>
          <a 
            href={editUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-md font-bold transition-colors shadow-sm print:hidden text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
            Edit Master Excel
          </a>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {metadata.subtitle || `District priority agenda roll-up across ${data.length} officers · ${totalItems} tracked items`}
        </p>
        {metadata.thresholdInfo && (
          <div className="inline-block bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-md font-medium border border-slate-200 dark:border-slate-700 max-w-fit">
            <span className="mr-1">⚙</span> {metadata.thresholdInfo}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-2 uppercase">Total Items</div>
          <div className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">{totalItems}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">across {data.length} officers</div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-2 uppercase">Completed</div>
          <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">{completed}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{percentDone}% done</div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-2 uppercase">In Progress</div>
          <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-1">{inProgress}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">marked on-track</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-2 uppercase">At Risk</div>
          <div className="text-4xl font-black text-amber-500 dark:text-amber-400 mb-1">{atRisk}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">low progress / stale</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm border-t-4 border-t-red-500 dark:border-t-red-500 transition-colors">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider mb-2 uppercase">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Red Flags
          </div>
          <div className="text-4xl font-black text-red-600 dark:text-red-400 mb-1">{redFlags}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">pending / blocked / below bar</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-300 font-medium transition-colors">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> On Track / Completed</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> In Progress</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Not Started</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> At Risk (low %, stagnant, or no update {'>'}7d)</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Critical (auto-flag / pending / blocked)</div>
      </div>

      {/* District Analytics */}
      <MasterCharts 
        completed={completed} 
        inProgress={inProgress} 
        atRisk={atRisk} 
        officerData={data} 
      />

      {/* Leaderboard */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Officer Leaderboard</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">click an officer for the full drill-down</p>
          </div>
        </div>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-left text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              <th className="px-6 py-3 font-semibold uppercase">Officer</th>
              <th className="px-6 py-3 font-semibold uppercase text-right">Items</th>
              <th className="px-6 py-3 font-semibold uppercase min-w-[150px]">% Done</th>
              <th className="px-6 py-3 font-semibold uppercase">Status Mix</th>
              <th className="px-6 py-3 font-semibold uppercase text-center"><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"></span>At Risk</th>
              <th className="px-6 py-3 font-semibold uppercase text-center"><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>Flags ↓</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.sort((a, b) => (parseInt(b['Flags']) || 0) - (parseInt(a['Flags']) || 0)).map((row, idx) => {
              const kpis = parseInt(row['Total KPIs']) || 0;
              const comp = parseInt(row['Completed']) || 0;
              const inProg = parseInt(row['In Progress']) || parseInt(row['On Track']) || 0;
              const notStart = parseInt(row['Not Started']) || 0;
              const pend = parseInt(row['Pending/Blocked']) || 0;
              const flags = parseInt(row['Flags']) || 0;
              const bottomPerf = row['Bottom Performer'] || '0';
              
              const pct = kpis > 0 ? ((comp / kpis) * 100).toFixed(1) : '0.0';
              
              return (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                    <Link href={`/officer/${encodeURIComponent(row['Officer / Tab'])}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
                      {row['Officer / Tab']}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">{kpis}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span>{pct}%</span>
                        <span className="text-slate-400 dark:text-slate-500 font-normal">({comp}/{kpis})</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
                      {comp > 0 && (
                        <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                          {comp} <span className="text-[10px]">✓</span>
                        </span>
                      )}
                      {inProg > 0 && (
                        <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                          {inProg} <span className="text-[10px]">•••</span>
                        </span>
                      )}
                      {notStart > 0 && (
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          {notStart} <span className="text-[10px]">○</span>
                        </span>
                      )}
                      {pend > 0 && (
                        <span className="flex items-center gap-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-800">
                          {pend} <span className="text-[10px]">✋</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 font-bold px-2.5 py-1 rounded-md min-w-[32px]">
                      {bottomPerf}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-bold px-2.5 py-1 rounded-md min-w-[32px]">
                      {flags}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
