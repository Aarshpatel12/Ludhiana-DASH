"use client";

import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ComposedChart, Line
} from 'recharts';
import { Activity, Users, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DrugCensusDashboard() {
  const [data, setData] = useState<{ assembly_summary: any[], booths: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/drug_census.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching drug census data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading detailed census analytics...</div>;
  }

  if (!data || !data.assembly_summary || data.assembly_summary.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        No census data available. Please ensure the extraction script has been run.
      </div>
    );
  }

  // Calculate totals from summary
  const summary = data.assembly_summary;
  const totalTarget = summary.reduce((acc, row) => acc + (row.target || 0), 0);
  const totalCompleted = summary.reduce((acc, row) => acc + (row.completed || 0), 0);
  const totalPending = summary.reduce((acc, row) => acc + (row.pending || 0), 0);
  const overallPct = totalTarget > 0 ? ((totalCompleted / totalTarget) * 100).toFixed(1) : '0';
  
  // Calculate QC totals
  const totalQCTarget = summary.reduce((acc, row) => acc + (row.qc_target || 0), 0);
  const totalQCCompleted = summary.reduce((acc, row) => acc + (row.qc_completed || 0), 0);
  const overallQCPct = totalQCTarget > 0 ? ((totalQCCompleted / totalQCTarget) * 100).toFixed(1) : '0';

  // Format data for chart
  const chartData = summary.map(row => ({
    name: row.assembly,
    Target: row.target,
    Completed: row.completed,
    QC_Completed: row.qc_completed,
    ProgressPct: row.percentage
  })).sort((a, b) => b.Completed - a.Completed);

  // Booth insights
  const booths = data.booths || [];
  const activeSurveyors = new Set(booths.map(b => b.surveyor).filter(Boolean)).size;
  const worstBooths = [...booths].sort((a, b) => a.percentage - b.percentage).filter(b => b.target > 0).slice(0, 5);
  const topBooths = [...booths].sort((a, b) => b.percentage - a.percentage).filter(b => b.target > 0).slice(0, 5);

  return (
    <div className="space-y-6 w-full">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-md">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Users className="w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Total Target</h3>
          </div>
          <div className="text-3xl font-black">{totalTarget.toLocaleString()}</div>
          <div className="text-sm mt-1 opacity-90">households mapped</div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-md">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <CheckCircle className="w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Surveys Done</h3>
          </div>
          <div className="text-3xl font-black">{totalCompleted.toLocaleString()}</div>
          <div className="text-sm mt-1 opacity-90">{overallPct}% of total target</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-md">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Activity className="w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">QC Progress</h3>
          </div>
          <div className="text-3xl font-black">{totalQCCompleted.toLocaleString()}</div>
          <div className="text-sm mt-1 opacity-90">{overallQCPct}% QC completion</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Pending</h3>
          </div>
          <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{totalPending.toLocaleString()}</div>
          <div className="text-sm mt-1 text-slate-500">surveys left to complete</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Assembly-wise Survey Progress</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string) => [name.includes('Pct') ? `${value}%` : value.toLocaleString(), name.replace('_', ' ')]}
                />
                <Legend iconType="circle" />
                <Bar yAxisId="left" dataKey="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="left" dataKey="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="ProgressPct" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booth Insights */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Booth & Surveyor Insights</h3>
          <p className="text-xs text-slate-500 mb-6">Tracking {booths.length} booths and {activeSurveyors} active surveyors.</p>
          
          <div className="flex-1 space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4" /> Needs Attention (Lowest %)
              </h4>
              <div className="space-y-3">
                {worstBooths.map((b, i) => (
                  <div key={i} className="flex flex-col gap-1 text-sm border-l-2 border-red-500 pl-3">
                    <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span className="truncate pr-2" title={b.booth_name}>{b.booth_name} ({b.assembly})</span>
                      <span className="text-red-600">{b.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{b.surveyor || 'Unknown Surveyor'}</span>
                      <span>{b.completed} / {b.target} done</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle className="w-4 h-4" /> Top Performers (Highest %)
              </h4>
              <div className="space-y-3">
                {topBooths.map((b, i) => (
                  <div key={i} className="flex flex-col gap-1 text-sm border-l-2 border-emerald-500 pl-3">
                    <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span className="truncate pr-2" title={b.booth_name}>{b.booth_name} ({b.assembly})</span>
                      <span className="text-emerald-600">{b.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{b.surveyor || 'Unknown Surveyor'}</span>
                      <span>{b.completed} / {b.target} done</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
