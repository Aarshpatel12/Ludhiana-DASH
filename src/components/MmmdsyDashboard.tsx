import React, { useState, useEffect } from 'react';
import { Loader2, Users, TrendingUp, CalendarDays, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, AreaChart, Area } from 'recharts';

export default function MmmdsyDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/mmmdsy_data.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load MMMDSY data', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl">
        No MMMDSY data available.
      </div>
    );
  }

  const acRows = data.filter(r => r.Constituency !== 'TOTAL');
  const totalRow = data.find(r => r.Constituency === 'TOTAL') || {};

  // Aggregate Metrics
  const initialReg = totalRow.Reg_W1 || 0;
  const currentReg = totalRow.Reg_W4 || 0;
  const totalProgress = (totalRow.Prog_W2 || 0) + (totalRow.Prog_W3 || 0) + (totalRow.Prog_W4 || 0);

  // Time Series Growth
  const growthData = [
    { period: 'Phase 1', registrations: totalRow.Reg_W1 },
    { period: 'Phase 2', registrations: totalRow.Reg_W2 },
    { period: 'Phase 3', registrations: totalRow.Reg_W3 },
    { period: 'Phase 4', registrations: totalRow.Reg_W4 },
  ];

  // AC specific growth (stack progress)
  const acProgressData = acRows.map((r: any) => ({
    name: r.Constituency.replace('Ludhiana ', 'L-'),
    w2: r.Prog_W2,
    w3: r.Prog_W3,
    w4: r.Prog_W4,
    total: r.Reg_W4,
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-pink-500" />
            MMMDSY Registration Analytics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tracking cumulative registrations and phase-wise progress across all constituencies.
          </p>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-pink-100">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold">Current Registrations</h3>
          </div>
          <div className="text-3xl font-bold">
            {currentReg.toLocaleString()}
          </div>
          <p className="text-sm text-pink-100 mt-1 opacity-80">
            Total as of latest phase
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-indigo-100">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold">Total Growth</h3>
          </div>
          <div className="text-3xl font-bold">
            +{totalProgress.toLocaleString()}
          </div>
          <p className="text-sm text-indigo-100 mt-1 opacity-80">
            New registrations since Phase 1
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-slate-500 dark:text-slate-400">
            <CalendarDays className="w-5 h-5" />
            <h3 className="font-semibold">Avg Weekly Progress</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {Math.round(totalProgress / 3).toLocaleString()}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            New registrations per phase
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: District Growth Trajectory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">District Growth Trajectory</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} domain={['dataMin - 10000', 'dataMax + 10000']} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="registrations" stroke="#ec4899" fillOpacity={1} fill="url(#colorReg)" name="Total Registrations" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Phase-wise Progress by AC */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">New Registrations by Phase (per AC)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={acProgressData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="w2" stackId="a" fill="#6366f1" name="Phase 2 Progress" />
                <Bar dataKey="w3" stackId="a" fill="#a855f7" name="Phase 3 Progress" />
                <Bar dataKey="w4" stackId="a" fill="#ec4899" name="Phase 4 Progress" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Total Registrations by AC */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5 lg:col-span-2">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Total Current Registrations by AC</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={acProgressData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="total" fill="#f43f5e" name="Total Registrations" radius={[4, 4, 0, 0]} barSize={30} />
                <Line type="monotone" dataKey="total" stroke="#fda4af" strokeWidth={2} dot={{ r: 4, fill: '#e11d48' }} name="Trend" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
