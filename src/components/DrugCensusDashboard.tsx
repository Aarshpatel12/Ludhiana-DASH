"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Users, Target, Activity, AlertTriangle, Building, Map } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Line, AreaChart, Area } from 'recharts';

export default function DrugCensusDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/drug_census.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load drug census data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p className="font-medium animate-pulse">Loading Live Census Data...</p>
      </div>
    );
  }

  if (!data || !data.tracker || data.tracker.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-500">
        <AlertTriangle className="w-10 h-10 mb-4 text-amber-500 opacity-50" />
        <p className="font-medium">No Data Available.</p>
        <p className="text-sm">Please run the fetch script to generate data.</p>
      </div>
    );
  }

  // Extract District Totals (Usually the last row in tracker, labeled 'DISTRICT TOTAL')
  const trackerRows = data.tracker.filter((r: any) => str(r['Assembly Constituency']).toLowerCase() !== 'nan');
  const districtTotalRow = trackerRows.find((r: any) => str(r['Assembly Constituency']).toUpperCase().includes('TOTAL')) || trackerRows[trackerRows.length - 1];
  
  // Filter out the total row for the AC list
  const acRows = trackerRows.filter((r: any) => !str(r['Assembly Constituency']).toUpperCase().includes('TOTAL') && str(r['Assembly Constituency']) !== 'nan');

  // Helper safely format strings
  function str(val: any) {
    return val !== undefined && val !== null ? String(val) : '';
  }

  // Find manpower gaps
  const gapRows = (data.deployment_gaps || []).filter((r: any) => !str(r['Assembly Constituency']).toUpperCase().includes('TOTAL') && str(r['Assembly Constituency']) !== 'nan');
  const criticalGaps = gapRows.filter((r: any) => parseFloat(str(r['Enum. Gap']) || '0') > 0 || parseFloat(str(r['Supervisor Gap']) || '0') > 0);

  // Find booth issues
  const boothRows = (data.booth_analysis || []).filter((r: any) => !str(r['Assembly Constituency']).toUpperCase().includes('TOTAL') && str(r['Assembly Constituency']) !== 'nan');
  const criticalBooths = boothRows.filter((r: any) => parseFloat(str(r['Booths with 0 Surveys']) || '0') > 0 || parseFloat(str(r['Booths with NO Surveyor Mapped']) || '0') > 0);

  // Prepare chart data
  const chartData = acRows.map((r: any) => ({
    name: str(r['Assembly Constituency']).replace('Ldh-', 'L-'), // Abbreviate for chart
    completionPct: parseFloat(str(r['Completed %']).replace('%', '')) || 0,
    pace: parseFloat(str(r['Per Enumerator per Day'])) || 0,
    pending: parseFloat(str(r['Pending']).replace(/,/g, '')) || 0,
  }));

  // Prepare Booth Pie Chart Data
  const allBoothRows = data.booth_analysis || [];
  const boothTotalRow = allBoothRows.find((r: any) => str(r['Assembly Constituency']).toUpperCase().includes('TOTAL')) || allBoothRows[allBoothRows.length - 1];
  
  let boothPieData = [];
  if (boothTotalRow) {
    const totalBooths = parseFloat(str(boothTotalRow['Total Booths']).replace(/,/g, '')) || 0;
    const unstarted = parseFloat(str(boothTotalRow['Booths with 0 Surveys']).replace(/,/g, '')) || 0;
    const completed = parseFloat(str(boothTotalRow['Booths at 100%']).replace(/,/g, '')) || 0;
    const inProgress = Math.max(0, totalBooths - unstarted - completed);
    
    boothPieData = [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'In Progress', value: inProgress, color: '#3b82f6' },
      { name: 'Not Started', value: unstarted, color: '#f59e0b' },
    ];
  }

  // Prepare Daily Surveys Trend Data
  const dailyRows = (data.daily_surveys || []).filter((r: any) => str(r['Rank']).includes('2026') || str(r['Rank']).includes('Jul'));
  const dailyTrendData = dailyRows.map((r: any) => ({
    date: str(r['Rank']).replace(' 2026', '').replace(' (5 PM)', '').replace(' (24 hr)', '').trim(),
    cumulative: parseFloat(str(r['Assembly Constituency']).replace(/,/g, '')) || 0,
    dailyDone: parseFloat(str(r['Cumulative 06-Jul']).replace(/,/g, '')) || 0,
    completionPct: parseFloat(str(r['11-Jul']).replace('%', '')) || 0
  })).filter((d: any) => d.cumulative > 0);

  // Prepare Manpower Gaps Data
  const manpowerData = gapRows.map((r: any) => ({
    name: str(r['Assembly Constituency']).replace('Ldh-', 'L-'),
    enumGap: parseFloat(str(r['Enum. Gap'])) || 0,
    supGap: parseFloat(str(r['Supervisor Gap'])) || 0,
  })).filter((d: any) => d.enumGap > 0 || d.supGap > 0);

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Survey Target</h3>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {str(districtTotalRow['Survey Target'])}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Completed Surveys</h3>
          </div>
          <div className="flex items-end gap-2">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {str(districtTotalRow['Completed (16-Jul)'])}
            </div>
            <div className="text-sm font-bold text-emerald-500 mb-1">
              ({str(districtTotalRow['Completed %'])})
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pending Surveys</h3>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {str(districtTotalRow['Pending'])}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Enumerators</h3>
          </div>
          <div className="flex items-end gap-2">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {str(districtTotalRow['Enum. Assigned'])}
            </div>
            {parseFloat(str(districtTotalRow['Enum. NOT Assigned']) || '0') > 0 && (
              <div className="text-sm font-bold text-red-500 mb-1">
                ({str(districtTotalRow['Enum. NOT Assigned'])} Idle)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Completion % by AC</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="completionPct" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Pace (Surveys / Enum / Day)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="pace" fill="#10b981" radius={[4, 4, 0, 0]} name="Pace" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Pending Workload vs Completion %</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar yAxisId="left" dataKey="pending" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Pending Surveys" />
                <Line yAxisId="right" type="monotone" dataKey="completionPct" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: '#f43f5e' }} name="Completion %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Overall Booth Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={boothPieData} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {boothPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Daily Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Cumulative District Progress</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="cumulative" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCumulative)" name="Total Surveys" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Manpower Gaps */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Staff Shortages by AC</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={manpowerData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="enumGap" stackId="a" fill="#ef4444" name="Idle Enumerators" radius={[0, 0, 0, 0]} />
                <Bar dataKey="supGap" stackId="a" fill="#f59e0b" name="Missing Supervisors" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">AC-Wise Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Constituency</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3 w-48">Progress</th>
                <th className="px-4 py-3">Pace / Day</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {acRows.map((row: any, idx: number) => {
                const pctStr = str(row['Completed %']).replace('%', '');
                const pct = parseFloat(pctStr) || 0;
                
                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">#{str(row['Rank']).replace('.0','')}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">{str(row['Assembly Constituency'])}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{str(row['Survey Target'])}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">{str(row['Completed (16-Jul)'])}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold w-10 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{str(row['Per Enumerator per Day'])}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider
                        ${str(row['Status']).includes('CRITICAL') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                          str(row['Status']).includes('course') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}
                      `}>
                        {str(row['Status'])}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottlenecks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Manpower Gaps */}
        <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-red-100 dark:border-red-900/30 bg-red-100/50 dark:bg-red-900/20 flex items-center gap-2 text-red-800 dark:text-red-400 font-bold">
            <Users className="w-4 h-4" /> Manpower Gaps (Idle Staff)
          </div>
          <div className="p-4 space-y-3">
            {criticalGaps.length === 0 ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">All enumerators and supervisors deployed!</p>
            ) : (
              criticalGaps.map((row: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 bg-white/60 dark:bg-slate-900/40 rounded border border-red-50 dark:border-red-900/20">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{str(row['Assembly Constituency'])}</span>
                  <div className="flex gap-3 text-red-600 dark:text-red-400 font-medium">
                    {parseFloat(str(row['Enum. Gap']) || '0') > 0 && <span>{str(row['Enum. Gap'])} Idle Enums</span>}
                    {parseFloat(str(row['Supervisor Gap']) || '0') > 0 && <span>{str(row['Supervisor Gap'])} Missing Supvs</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booth Bottlenecks */}
        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-amber-100 dark:border-amber-900/30 bg-amber-100/50 dark:bg-amber-900/20 flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold">
            <Building className="w-4 h-4" /> Booth Bottlenecks
          </div>
          <div className="p-4 space-y-3">
            {criticalBooths.length === 0 ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">No booth issues found.</p>
            ) : (
              criticalBooths.map((row: any, i: number) => (
                <div key={i} className="flex flex-col gap-1 text-sm p-2 bg-white/60 dark:bg-slate-900/40 rounded border border-amber-50 dark:border-amber-900/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{str(row['Assembly Constituency'])}</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{str(row['Booths with 0 Surveys'])} Booths Unstarted</span>
                  </div>
                  {parseFloat(str(row['Booths with NO Surveyor Mapped']) || '0') > 0 && (
                     <div className="text-xs text-red-500 font-medium">{str(row['Booths with NO Surveyor Mapped'])} have NO surveyor mapped!</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
