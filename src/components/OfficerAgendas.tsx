"use client";

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function OfficerAgendas({ data }: { data: any[] }) {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'completed' | 'in-progress'>('all');

  // Filter data first based on selected filter
  const filteredData = data.filter(row => {
    if (filter === 'all') return true;
    
    const hasFlag = row['Auto-Flag'] && row['Auto-Flag'].trim() !== '';
    const status = (row['Status'] || '').toLowerCase();
    const isCompleted = status === 'completed';
    
    if (filter === 'flagged') return hasFlag;
    if (filter === 'completed') return isCompleted;
    if (filter === 'in-progress') return !hasFlag && !isCompleted;
    
    return true;
  });

  // Group filtered data by Priority Agenda
  const groupedData = filteredData.reduce((acc, row) => {
    const agenda = row['Priority Agenda'] || 'Other';
    if (!acc[agenda]) acc[agenda] = [];
    acc[agenda].push(row);
    return acc;
  }, {} as Record<string, any[]>);

  // Initialize all sections as collapsed by default
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.keys(groupedData).reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );

  const toggleGroup = (agenda: string) => {
    setExpandedGroups(prev => ({ ...prev, [agenda]: !prev[agenda] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 mt-8">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight uppercase">▣ Agendas & Tasks</h2>
          <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{filteredData.length} Items</span>
        </div>
        
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === 'all' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
            All
          </button>
          <button onClick={() => setFilter('flagged')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${filter === 'flagged' ? 'bg-red-500 text-white shadow-sm' : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'}`}>
            <AlertCircle className="w-3.5 h-3.5" /> Flagged
          </button>
          <button onClick={() => setFilter('in-progress')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${filter === 'in-progress' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'}`}>
            In Progress
          </button>
          <button onClick={() => setFilter('completed')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${filter === 'completed' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </button>
        </div>
      </div>
      
      {Object.entries(groupedData).map(([agenda, groupItems]: [string, any], groupIdx) => {
        const isExpanded = expandedGroups[agenda];

        return (
          <div key={groupIdx} className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 overflow-hidden">
            <button 
              onClick={() => toggleGroup(agenda)}
              className="w-full flex flex-col p-5 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-left"
            >
              <div className="w-full flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    {agenda}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wide ml-3.5">
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{groupItems.length} ITEMS</span>
                    {groupItems.filter((r: any) => r['Auto-Flag']?.trim() !== '').length > 0 && (
                      <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {groupItems.filter((r: any) => r['Auto-Flag']?.trim() !== '').length} FLAGGED</span>
                    )}
                    {groupItems.filter((r: any) => r['Status']?.toLowerCase() === 'completed').length > 0 && (
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {groupItems.filter((r: any) => r['Status']?.toLowerCase() === 'completed').length} COMPLETED</span>
                    )}
                  </div>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Mini Metrics Tag Cloud */}
              <div className="mt-4 ml-3.5 flex flex-wrap gap-2">
                {groupItems.map((row: any, idx: number) => {
                  const title = row['KPI / Metric'];
                  const current = row['Current Value'];
                  const pct = row['Achieved %'];
                  const target = row['Target / Total'];
                  
                  let displayValue = '';
                  if (pct && pct !== '-') displayValue = pct;
                  else if (current && current !== '-') displayValue = current;
                  else if (target && target !== '-') displayValue = target;
                  
                  if (!displayValue || !title) return null;

                  return (
                    <div key={idx} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 flex items-center gap-1.5 shadow-sm max-w-[280px]">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate" title={title}>{title}</span>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap pl-1 border-l border-slate-200 dark:border-slate-700">{displayValue}</span>
                    </div>
                  );
                })}
              </div>
            </button>
            
            {isExpanded && (
              <div className="p-5 pt-0 border-t border-slate-200 dark:border-slate-800/50 mt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 items-start">
                  {groupItems.map((row: any, idx: number) => {
                    const hasFlag = row['Auto-Flag'] && row['Auto-Flag'].trim() !== '';
                    const status = row['Status'] || '';
                    const isCompleted = status.toLowerCase() === 'completed';
                    const isPending = status.toLowerCase().includes('pending') || status.toLowerCase().includes('blocked');
                    
                    const hasMetrics = row['Current Value'] || row['Target / Total'] || row['Last Value'] || row['Flag Bar'];
                    const hasProgressBar = row['Target / Total'] || (row['Achieved %'] && row['Achieved %'].trim() !== '-');
                    
                    const pctRaw = parseFloat(row['Achieved %']);
                    const pct = isNaN(pctRaw) ? 0 : pctRaw;

                    return (
                      <div key={idx} className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm transition-shadow flex flex-col h-full ${hasFlag ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-800 hover:shadow-md'}`}>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 flex flex-col gap-1">
                            <span>SR. {row['Sr'] || '-'}</span>
                            {row['Key'] && <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[10px] max-w-fit">{row['Key']}</span>}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {hasFlag && (
                              <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Flagged
                              </span>
                            )}
                            {isCompleted ? (
                              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Completed
                              </span>
                            ) : isPending && !hasFlag ? (
                              <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md">Pending</span>
                            ) : !hasFlag && status ? (
                              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-md">{status}</span>
                            ) : null}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-snug" title={row['KPI / Metric']}>
                          {row['KPI / Metric']}
                        </h3>
                        
                        <div className="flex-1"></div>

                        {/* Metrics Grid */}
                        {hasMetrics && (
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
                        )}

                        {/* Progress Bar */}
                        {hasProgressBar && (
                          <div className="space-y-1.5 mb-4">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                              <span>{row['Target / Total'] ? `${row['Target / Total']} Total` : 'Progress'}</span>
                              <span className={pct >= 100 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>{row['Achieved %']}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${hasFlag || isPending ? 'bg-red-500' : pct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Remarks */}
                        {row['Remarks / Context'] && (
                          <div className={`text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 pt-3 mt-1 ${!hasMetrics && !hasProgressBar ? 'border-t-0 pt-0 mt-0' : ''}`}>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">Remarks:</span>
                            {row['Remarks / Context']}
                          </div>
                        )}

                        {/* Footer info */}
                        {(row['Concerned Officer'] || row['Bottom Performer'] || row['Updated By']) && (
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap gap-2 text-[10px] text-slate-400 uppercase tracking-wider items-center justify-between">
                            {row['Concerned Officer'] && <span>Owner: {row['Concerned Officer']}</span>}
                            {row['Bottom Performer'] && <span className="text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 px-1.5 rounded">⚠️ Bottom: {row['Bottom Performer']}</span>}
                            {row['Updated By'] && <span>By: {row['Updated By']}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
