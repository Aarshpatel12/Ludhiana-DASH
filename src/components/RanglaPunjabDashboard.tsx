import React, { useState, useEffect } from 'react';
import { Loader2, Activity, ExternalLink, ShieldCheck, MapPin, Building2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';

export default function RanglaPunjabDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/rangla_punjab.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load Rangla Punjab data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl m-2 bg-slate-50 dark:bg-black">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="text-slate-500 font-medium">Loading Rangla Punjab Data...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const phase1 = data['Phase I'] || [];
  const phase2 = data['Phase II'] || [];
  const phase3 = data['Phase III'] || [];

  // Metrics
  const p1Total = phase1.reduce((sum: number, r: any) => sum + r.Total, 0);
  const p1Completed = phase1.reduce((sum: number, r: any) => sum + r.Completed, 0);
  
  const p2Total = phase2.reduce((sum: number, r: any) => sum + r.Total, 0);
  const p2Completed = phase2.reduce((sum: number, r: any) => sum + r.Completed, 0);

  const p3TotalConst = phase3.length;
  const p3Approved = phase3.filter((r: any) => r.Approved_DLC.toLowerCase() === 'yes').length;

  // Chart 1: Phase I vs Phase II Progress Comparison (Composed)
  // Merge Phase I and II data by agency for comparison
  const agencyMap: Record<string, any> = {};
  phase1.forEach((r: any) => {
    agencyMap[r.Agency] = { name: r.Agency.replace('BDPO ', '').replace('EONC ', ''), p1Total: r.Total, p1Comp: r.Completed };
  });
  phase2.forEach((r: any) => {
    if (!agencyMap[r.Agency]) {
      agencyMap[r.Agency] = { name: r.Agency.replace('BDPO ', '').replace('EONC ', ''), p1Total: 0, p1Comp: 0 };
    }
    agencyMap[r.Agency].p2Total = r.Total;
    agencyMap[r.Agency].p2Comp = r.Completed;
  });
  
  const comparisonData = Object.values(agencyMap)
    .filter(a => (a.p1Total || 0) > 0 || (a.p2Total || 0) > 0)
    .sort((a, b) => ((b.p1Total || 0) + (b.p2Total || 0)) - ((a.p1Total || 0) + (a.p2Total || 0)));

  // Chart 2: Phase I Completion Rate (Bar)
  const p1CompletionData = phase1.map((r: any) => ({
    name: r.Agency.replace('BDPO ', '').replace('EONC ', ''),
    rate: r.Total > 0 ? (r.Completed / r.Total) * 100 : 0,
    total: r.Total
  })).sort((a: any, b: any) => b.rate - a.rate);

  // Chart 3: Phase II Pending Volume (Area)
  const p2PendingData = phase2.map((r: any) => ({
    name: r.Agency.replace('BDPO ', '').replace('EONC ', ''),
    pending: r.Total - r.Completed
  })).sort((a: any, b: any) => b.pending - a.pending);

  // Chart 4: Phase III Approval Pipeline (Pie)
  const p3PieData = [
    { name: 'Approved by DLC', value: p3Approved },
    { name: 'Pending DLC Approval', value: p3TotalConst - p3Approved }
  ];
  const PIE_COLORS = ['#10b981', '#f43f5e'];

  // Chart 5: Overall Status Distribution (Stacked Bar)
  const statusData = [
    {
      phase: 'Phase I',
      Completed: p1Completed,
      InProgress: phase1.reduce((sum: number, r: any) => sum + r.InProgress, 0),
      NotStarted: phase1.reduce((sum: number, r: any) => sum + r.NotStarted, 0)
    },
    {
      phase: 'Phase II',
      Completed: p2Completed,
      InProgress: phase2.reduce((sum: number, r: any) => sum + r.InProgress, 0),
      NotStarted: phase2.reduce((sum: number, r: any) => sum + r.NotStarted, 0)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            Rangla Punjab Vikas Scheme
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Phase I, II, and III implementation and execution tracking across Ludhiana district.
          </p>
        </div>
        <a 
          href="https://docs.google.com/spreadsheets/d/1BQKR9bPEhn_CQJyGeLOKIWtqhKzP9c-gdztmvF2Huaw/edit"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg shadow-sm transition-all text-sm whitespace-nowrap"
        >
          <ExternalLink className="w-4 h-4" />
          Edit Google Sheet
        </a>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Phase I Completed</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{p1Completed}</h3>
              <span className="text-xs font-semibold text-emerald-500">of {p1Total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Phase II Completed</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{p2Completed}</h3>
              <span className="text-xs font-semibold text-emerald-500">of {p2Total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Phase III DLC Approved</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{p3Approved}</h3>
              <span className="text-xs font-semibold text-slate-400">Constituencies</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Overlaid Phase Total Comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5 lg:col-span-2">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Proposals Volume: Phase I vs Phase II</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="p1Total" fill="#a855f7" name="Phase I Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="p2Total" fill="#ec4899" name="Phase II Total" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Phase I Completion Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Phase I Completion Rate (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={p1CompletionData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                <Bar dataKey="rate" fill="#10b981" name="Completion %" radius={[0, 4, 4, 0]}>
                  {p1CompletionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.rate > 80 ? '#059669' : entry.rate > 40 ? '#34d399' : '#a7f3d0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Phase II Pending Volume */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Phase II Pending Backlog Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={p2PendingData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="pending" stroke="#f43f5e" fillOpacity={1} fill="url(#colorPending)" name="Pending Proposals" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Phase III Approval Pipeline (Pie) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Phase III DLC Approvals (Constituencies)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={p3PieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none" label>
                  {p3PieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Overall Status Stack */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Overall Execution Status (All Agencies)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="phase" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Completed" stackId="a" fill="#10b981" />
                <Bar dataKey="InProgress" stackId="a" fill="#f59e0b" />
                <Bar dataKey="NotStarted" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
