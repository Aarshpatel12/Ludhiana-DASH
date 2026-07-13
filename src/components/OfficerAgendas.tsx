"use client";

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function OfficerAgendas({ data }: { data: any[] }) {
  // Group all data by Priority Agenda
  const groupedData = data.reduce((acc, row) => {
    const agenda = row['Priority Agenda'] || 'Other';
    if (!acc[agenda]) acc[agenda] = [];
    acc[agenda].push(row);
    return acc;
  }, {} as Record<string, any[]>);

  // Initialize all sections as collapsed
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.keys(groupedData).reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );

  const toggleGroup = (agenda: string) => {
    setExpandedGroups(prev => ({ ...prev, [agenda]: !prev[agenda] }));
  };

  const isScheme = (row: any) => row['Target / Total'] || (row['Achieved %'] && row['Achieved %'].trim() !== '-');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mt-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight uppercase">▣ Agendas & Schemes</h2>
        <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{data.length} Items</span>
      </div>
      
      {Object.entries(groupedData).map(([agenda, groupItems], groupIdx) => {
        const isExpanded = expandedGroups[agenda];
        const schemes = groupItems.filter(isScheme);
        const tasks = groupItems.filter((row) => !isScheme(row));

        return (
          <div key={groupIdx} className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 overflow-hidden">
            <button 
              onClick={() => toggleGroup(agenda)}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-left"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                {agenda} <span className="text-sm font-normal text-slate-500">({groupItems.length})</span>
              </h3>
              <div className="text-slate-400">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>
            
            {isExpanded && (
              <div className="p-5 pt-0 border-t border-slate-200 dark:border-slate-800/50 mt-1 space-y-6">
                
                {/* Schemes Grid */}
                {schemes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {schemes.map((row, idx) => {
                      const pctRaw = parseFloat(row['Achieved %']);
                      const pct = isNaN(pctRaw) ? 0 : pctRaw;
                      const hasFlag = row['Auto-Flag'] && row['Auto-Flag'].trim() !== '';
                      const status = row['Status'] || '';
                      const isPending = status.toLowerCase().includes('pending') || status.toLowerCase().includes('blocked');

                      return (
                        <div key={idx} className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm transition-shadow ${hasFlag ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-800 hover:shadow-md'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 flex flex-col gap-1">
                              <span>SR. {row['Sr'] || '-'}</span>
                              {row['Key'] && <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[10px] max-w-fit">{row['Key']}</span>}
                            </div>
                            {hasFlag && (
                              <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Flagged
                              </span>
                            )}
                            {isPending && !hasFlag && (
                              <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md">Pending</span>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-snug line-clamp-2" title={row['KPI / Metric']}>
                            {row['KPI / Metric']}
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs mb-4 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div><span className="font-semibold text-slate-900 dark:text-slate-300">Current:</span> {row['Current Value'] || '-'}</div>
                            <div><span className="font-semibold text-slate-900 dark:text-slate-300">Target:</span> {row['Target / Total'] || '-'}</div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-slate-300">Last:</span> {row['Last Value'] || '-'}
                              {row['Change'] && row['Change'] !== '-' ? <span className={`ml-1 font-medium ${row['Change'].includes('-') ? 'text-red-500' : 'text-emerald-500'}`}>({row['Change']})</span> : null}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-slate-300">Flag Bar:</span> {row['Flag Bar'] || '-'}
                              {row['Rule'] && <span className="ml-1 text-[10px] bg-slate-200 dark:bg-slate-700 px-1 rounded">{row['Rule']}</span>}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                              <span>{row['Target / Total']} Total</span>
                              <span className={pct >= 100 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>{row['Achieved %']}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${hasFlag || isPending ? 'bg-red-500' : pct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tasks Table */}
                {tasks.length > 0 && (
                  <div className={`overflow-x-auto ${schemes.length > 0 ? 'mt-6 pt-6 border-t border-slate-200 dark:border-slate-800' : 'pt-4'}`}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <th className="px-4 py-3 w-12 text-center rounded-tl-lg">Sr.</th>
                          <th className="px-4 py-3 w-1/3">KPI / Metric</th>
                          <th className="px-4 py-3">Status & Ownership</th>
                          <th className="px-4 py-3 w-1/3 rounded-tr-lg">Remarks & History</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
                        {tasks.map((row, idx) => {
                          const hasFlag = row['Auto-Flag'] && row['Auto-Flag'].trim() !== '';
                          const isCompleted = row['Status']?.toLowerCase() === 'completed';
                          const isPending = row['Status']?.toLowerCase().includes('pending') || row['Status']?.toLowerCase().includes('blocked');

                          return (
                            <tr key={idx} className={`${hasFlag ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'} transition-colors`}>
                              <td className="px-4 py-3 text-center text-slate-400 dark:text-slate-500 font-medium align-top">
                                <div>{row['Sr'] || '-'}</div>
                                {row['Key'] && <div className="text-[9px] mt-1 bg-slate-100 dark:bg-slate-800/80 rounded px-1 mx-auto max-w-fit">{row['Key']}</div>}
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">{row['KPI / Metric']}</div>
                                {(row['Current Value'] || row['Target / Total']) && (
                                  <div className="mt-2 flex gap-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded inline-flex border border-slate-100 dark:border-slate-700/50">
                                    {row['Current Value'] && <span><span className="font-semibold text-slate-500">Current:</span> {row['Current Value']}</span>}
                                    {row['Target / Total'] && <span><span className="font-semibold text-slate-500">Target:</span> {row['Target / Total']}</span>}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 align-top">
                                {isCompleted ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                                  </span>
                                ) : isPending || hasFlag ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                    <AlertCircle className="w-3.5 h-3.5" /> {row['Status'] || 'Pending'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {row['Status'] || 'In Progress'}
                                  </span>
                                )}
                                {row['Concerned Officer'] && (
                                  <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md inline-flex">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Owner:</span> {row['Concerned Officer']}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed align-top">
                                {row['Remarks / Context'] || '-'}
                                {row['Rule'] && (
                                  <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                    <span className="font-semibold">Rule:</span> {row['Rule']}
                                  </div>
                                )}
                                {hasFlag && (
                                  <div className="mt-2 text-red-600 dark:text-red-400 font-medium text-xs bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded-md block">
                                    Auto-Flag: {row['Auto-Flag']}
                                  </div>
                                )}
                                {row['Bottom Performer'] && row['Bottom Performer'].trim() !== '' && (
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
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
