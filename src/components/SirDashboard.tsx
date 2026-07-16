import React, { useState, useEffect } from 'react';
import { Loader2, Users, FileText, AlertTriangle, FileWarning, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function SirDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/data/sir_data.json?v=${Date.now()}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load SIR data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading SIR Data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <p>No SIR Data available.</p>
      </div>
    );
  }

  // Safe str helper
  const str = (val: any) => (val === undefined || val === null ? '' : String(val));
  const parseNum = (val: any) => {
    const s = str(val).split('(')[0].replace(/,/g, '').replace(/\n/g, '').replace(/\s/g, '');
    return parseFloat(s) || 0;
  };

  // Filter out the 'Total' row at the bottom
  const acRows = data.filter(r => str(r['AC No. & Name']).toLowerCase() !== 'nan' && r['AC No. & Name'] !== '');
  const totalRow = data.find(r => str(r['S. No.']).toLowerCase() === 'total') || {};

  // Metrics
  const totalElectors = parseNum(totalRow['Total El ectors']);
  const totalDistributed = parseNum(totalRow['EFs Distri buted']);
  const totalDigitized = parseNum(totalRow['EFs Digi tized']);
  const totalAnomalies = parseNum(totalRow['Total Ano malies']);

  // Chart Data: Progress by AC
  const progressChartData = acRows.map((r: any) => ({
    name: str(r['AC No. & Name']).replace(/^[0-9]+-/, ''), // Strip prefix
    electors: parseNum(r['Total El ectors']),
    distributed: parseNum(r['EFs Distri buted']),
    digitized: parseNum(r['EFs Digi tized']),
  }));

  // Chart Data: Issues by AC
  const issuesChartData = acRows.map((r: any) => ({
    name: str(r['AC No. & Name']).replace(/^[0-9]+-/, ''),
    asd: parseNum(r['Electors with ASD Discrep ancies']),
    uncollectable: parseNum(r['Total Uncolle ctable Forms']),
    anomalies: parseNum(r['Total Ano malies']),
  }));

  // Chart Data: BLO vs Electors
  const bloData = acRows.map((r: any) => ({
    name: str(r['AC No. & Name']).replace(/^[0-9]+-/, ''),
    blo: parseNum(r['Tota l BLO']),
    electors: parseNum(r['Total El ectors']),
  }));

  // Chart Data: Pending Verifications
  const verificationData = acRows.map((r: any) => ({
    name: str(r['AC No. & Name']).replace(/^[0-9]+-/, ''),
    submitted: parseNum(r['EFs Sub mitted by Elector']),
    unverified: parseNum(r['EFs Sub mitted by Elector (Not Verified by BLO)']),
  }));

  // Chart Data: Digitization Rate
  const digitRateData = acRows.map((r: any) => {
    const printed = parseNum(r['EFs Printed']);
    const digitized = parseNum(r['EFs Digi tized']);
    const rate = printed > 0 ? (digitized / printed) * 100 : 0;
    return {
      name: str(r['AC No. & Name']).replace(/^[0-9]+-/, ''),
      rate: parseFloat(rate.toFixed(1)),
    };
  });

  // Pie Chart: Overall Digitization
  const totalNotDigitized = parseNum(totalRow['EFs Not Digitize d']);
  const pieData = [
    { name: 'Digitized', value: totalDigitized, color: '#8b5cf6' },
    { name: 'Not Digitized', value: totalNotDigitized, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <a 
          href="https://docs.google.com/spreadsheets/d/1RB8UrAh1kzGJOAG-ayU-6NrfgQJPSLupFp6owpzzQmA/edit" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-md font-bold transition-colors shadow-sm print:hidden text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
          Edit Excel Data
        </a>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Electors</h3>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalElectors.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">EFs Distributed</h3>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalDistributed.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">EFs Digitized</h3>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalDigitized.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Anomalies</h3>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalAnomalies.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Distribution vs Digitization */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Distribution & Digitization by AC</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="distributed" fill="#10b981" name="Distributed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="digitized" fill="#8b5cf6" name="Digitized" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Issues and Anomalies */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Anomalies & Discrepancies by AC</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuesChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="asd" stackId="a" fill="#f59e0b" name="ASD Discrepancies" />
                <Bar dataKey="uncollectable" stackId="a" fill="#3b82f6" name="Uncollectable" />
                <Bar dataKey="anomalies" stackId="a" fill="#ef4444" name="Anomalies" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: BLO vs Electors */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Workforce (BLO) vs Electors Load</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={bloData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="blo" fill="#0ea5e9" name="Total BLOs" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="electors" stroke="#64748b" strokeWidth={2} dot={{ r: 3 }} name="Total Electors" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Pending Verifications */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Pending Elector Verifications</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={verificationData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="submitted" fill="#14b8a6" name="Submitted by Elector" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unverified" fill="#f43f5e" name="Not Verified by BLO" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Digitization Pace Area */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Digitization Completion (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={digitRateData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="rate" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRate)" name="% Digitized" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Overall Status Pie */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Overall District Digitization</h3>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <PieChartIcon className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
