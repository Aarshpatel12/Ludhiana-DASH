import React, { useState, useEffect } from 'react';
import { Loader2, Users, TrendingUp, CalendarDays, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ComposedChart, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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

  // Pie Chart: AC Share of Total Registrations
  const pieData = acRows.map((r: any) => ({
    name: r.Constituency.replace('Ludhiana ', 'L-'),
    value: r.Reg_W4,
  })).sort((a, b) => b.value - a.value);
  
  const COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308'];

  // Line Chart: Phase 4 Growth Rate (%)
  const growthRateData = acRows.map((r: any) => {
    const prev = r.Reg_W3;
    const current = r.Reg_W4;
    const rate = prev > 0 ? ((current - prev) / prev) * 100 : 0;
    return {
      name: r.Constituency.replace('Ludhiana ', 'L-'),
      rate: parseFloat(rate.toFixed(2))
    };
  }).sort((a, b) => b.rate - a.rate);

  // Horizontal Bar: Phase 4 Best Performers (Absolute Progress)
  const p4Performers = acRows.map((r: any) => ({
    name: r.Constituency.replace('Ludhiana ', 'L-'),
    progress: r.Prog_W4
  })).sort((a, b) => b.progress - a.progress);

  // Area Chart: Momentum (Phase 4 vs Phase 3)
  const momentumData = acRows.map((r: any) => ({
    name: r.Constituency.replace('Ludhiana ', 'L-'),
    momentum: r.Prog_W4 - r.Prog_W3
  }));

  // Radar Chart: Early vs Late (W1 vs W4-W1)
  const earlyLateData = acRows.map((r: any) => ({
    name: r.Constituency.replace('Ludhiana ', 'L-'),
    early: r.Reg_W1,
    late: r.Reg_W4 - r.Reg_W1
  }));

  // Line Chart: Top 5 ACs Trajectory
  const top5ACs = [...acRows].sort((a, b) => b.Reg_W4 - a.Reg_W4).slice(0, 5);
  const trajectoryData = [
    { phase: 'Phase 1', ...Object.fromEntries(top5ACs.map(r => [r.Constituency, r.Reg_W1])) },
    { phase: 'Phase 2', ...Object.fromEntries(top5ACs.map(r => [r.Constituency, r.Reg_W2])) },
    { phase: 'Phase 3', ...Object.fromEntries(top5ACs.map(r => [r.Constituency, r.Reg_W3])) },
    { phase: 'Phase 4', ...Object.fromEntries(top5ACs.map(r => [r.Constituency, r.Reg_W4])) }
  ];

  // Bar Chart: Total New Signups Since W1
  const netSignupsData = acRows.map((r: any) => ({
    name: r.Constituency.replace('Ludhiana ', 'L-'),
    signups: r.Reg_W4 - r.Reg_W1
  })).sort((a, b) => b.signups - a.signups);

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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Total Current Registrations by AC</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={acProgressData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="total" fill="#f43f5e" name="Total Registrations" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="total" stroke="#fda4af" strokeWidth={2} dot={{ r: 4, fill: '#e11d48' }} name="Trend" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: AC Share of Total Registrations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Constituency Share (Total Registrations)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Phase 4 Growth Rate (%) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Phase 4 Growth Rate (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={growthRateData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#6d28d9' }} name="Growth Rate" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Phase 4 Best Performers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Phase 4 Best Performers (Absolute Progress)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={p4Performers} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="progress" fill="#10b981" name="Phase 4 Progress" radius={[0, 4, 4, 0]}>
                  {p4Performers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#059669' : '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 7: Registration Momentum */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Registration Momentum (Phase 4 vs Phase 3 Progress)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={momentumData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="momentum" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorMomentum)" name="Momentum (Net Gain/Loss)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 8: Top 5 ACs Multi-Line Trajectory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Top 5 ACs Growth Trajectory</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="phase" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                {top5ACs.map((ac, idx) => (
                  <Line key={ac.Constituency} type="monotone" dataKey={ac.Constituency} stroke={COLORS[idx]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 9: Early vs Late Adopters (Radar) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Initial Setup vs Recent Signups</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={earlyLateData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar name="Phase 1 Registrations" dataKey="early" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                <Radar name="New Signups (P2-P4)" dataKey="late" stroke="#ec4899" fill="#ec4899" fillOpacity={0.4} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 10: Total Net Signups */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Total Net Signups Since Phase 1</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={netSignupsData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="signups" fill="#3b82f6" name="Total New Signups" radius={[4, 4, 0, 0]}>
                  {netSignupsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#2563eb' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
