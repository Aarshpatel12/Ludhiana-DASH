import React, { useState, useEffect } from 'react';
import { Loader2, Briefcase, FileWarning, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';

export default function PstcDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/pstc_data.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load PSTC data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl m-2 bg-slate-50 dark:bg-black">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-slate-500 font-medium">Loading PSTC Data...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { pendency_5_days, department_status } = data;

  // Global Metrics
  const totalGrievances = department_status.reduce((sum: number, r: any) => sum + r.active + r.resolved, 0);
  const totalActive = department_status.reduce((sum: number, r: any) => sum + r.active, 0);
  const totalResolved = department_status.reduce((sum: number, r: any) => sum + r.resolved, 0);
  const totalStale = department_status.reduce((sum: number, r: any) => sum + r.stale, 0);

  // Chart 1: Over 5 days pendency volume (Bar)
  const pendency5DaysData = [...pendency_5_days].sort((a, b) => b.count - a.count);

  // Chart 2: Resolution Rate by Dept (Composed)
  const resolutionData = [...department_status]
    .filter(r => (r.active + r.resolved) > 0)
    .map(r => ({
      name: r.department.replace('Rural Dev & Panchayat', 'Rural Dev').replace('District Food and Supply', 'DFSO').replace('Law & Order (Police)', 'Police'),
      active: r.active,
      resolved: r.resolved,
      donePct: r.donePct
    }))
    .sort((a, b) => (b.active + b.resolved) - (a.active + a.resolved));

  // Chart 3: Stale Grievances (> 4 days) (Area)
  const staleData = [...department_status]
    .filter(r => r.stale > 0)
    .map(r => ({
      name: r.department.replace('Rural Dev & Panchayat', 'Rural Dev').replace('District Food and Supply', 'DFSO').replace('Law & Order (Police)', 'Police'),
      stale: r.stale
    }))
    .sort((a, b) => b.stale - a.stale);

  // Chart 4: Department Pipeline Breakdown (Stacked Bar)
  const pipelineData = [...department_status]
    .filter(r => (r.active + r.resolved) > 0)
    .map(r => ({
      name: r.department.replace('Rural Dev & Panchayat', 'Rural Dev').replace('District Food and Supply', 'DFSO').replace('Law & Order (Police)', 'Police'),
      open: r.open,
      underProcess: r.underProcess,
      resolved: r.resolved
    }))
    .sort((a, b) => (b.open + b.underProcess + b.resolved) - (a.open + a.underProcess + a.resolved));

  // Chart 5: Global Status Distribution (Pie)
  const globalPieData = [
    { name: 'Resolved', value: totalResolved },
    { name: 'Under Process', value: department_status.reduce((sum: number, r: any) => sum + r.underProcess, 0) },
    { name: 'Open (Pending Action)', value: department_status.reduce((sum: number, r: any) => sum + r.open, 0) }
  ];
  const PIE_COLORS = ['#10b981', '#3b82f6', '#cbd5e1'];

  // Chart 6: Workload vs Efficiency (Scatter)
  const scatterData = [...department_status]
    .filter(r => (r.active + r.resolved) > 0)
    .map(r => ({
      name: r.department.replace('Rural Dev & Panchayat', 'Rural Dev').replace('District Food and Supply', 'DFSO').replace('Law & Order (Police)', 'Police'),
      workload: r.active + r.resolved,
      efficiency: r.donePct
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-500" />
            PSTC Grievance Supervision
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitoring public service issues, pendency, and resolution rates across all departments.
          </p>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Grievances</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalGrievances}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolved</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalResolved}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Pendency</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalActive}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
            <FileWarning className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stale (&gt;4 Days)</p>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">{totalStale}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Resolution Rate by Dept */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5 lg:col-span-2">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Department Resolution Trajectory</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={resolutionData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="active" fill="#f43f5e" name="Active Grievances" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar yAxisId="left" dataKey="resolved" fill="#10b981" name="Resolved Grievances" radius={[4, 4, 0, 0]} stackId="a" />
                <Line yAxisId="right" type="monotone" dataKey="donePct" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Resolution Rate (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pendency > 5 Days */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Critical Pendency (&gt;5 Days) Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pendency5DaysData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="department" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#f59e0b" name="Grievances" radius={[0, 4, 4, 0]}>
                  {pendency5DaysData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#d97706' : '#fbbf24'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Stale Grievances (>4 days no update) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Stale Grievances (&gt;4 days without update)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={staleData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorStale" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="stale" stroke="#e11d48" fillOpacity={1} fill="url(#colorStale)" name="Stale Grievances" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Detailed Pipeline Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5 lg:col-span-2">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Detailed Process Pipeline Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="resolved" stackId="a" fill="#10b981" name="Resolved" />
                <Bar dataKey="underProcess" stackId="a" fill="#3b82f6" name="Under Process" />
                <Bar dataKey="open" stackId="a" fill="#cbd5e1" name="Open (Pending Action)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Global Status Distribution (Pie) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Overall District Status Pipeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={globalPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none" label>
                  {globalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Workload vs Efficiency (Scatter) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Total Workload vs Resolution Rate</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 25, left: 10 }}>
                <XAxis type="number" dataKey="workload" name="Total Grievances" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="efficiency" name="Resolution Rate (%)" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Scatter name="Departments" data={scatterData} fill="#8b5cf6">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.efficiency > 80 ? '#10b981' : entry.efficiency < 40 ? '#f43f5e' : '#8b5cf6'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
