import React, { useState, useEffect } from 'react';
import { Loader2, Users, FileText, AlertTriangle, FileWarning, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

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

  // Radar Chart Data: District Overview
  const radarData = [
    { subject: 'Electors', A: parseNum(totalRow['Total El ectors']), fullMark: 3000000 },
    { subject: 'EFs Printed', A: parseNum(totalRow['EFs Printed']), fullMark: 3000000 },
    { subject: 'Distributed', A: parseNum(totalRow['EFs Distri buted']), fullMark: 3000000 },
    { subject: 'Digitized', A: parseNum(totalRow['EFs Digi tized']), fullMark: 3000000 },
  ];

  // Chart Data: Printed vs Distributed Gap
  const gapData = acRows.map((r: any) => ({
    name: str(r['AC No. & Name']).replace(/^[0-9]+-/, ''),
    printed: parseNum(r['EFs Printed']),
    distributed: parseNum(r['EFs Distri buted']),
  }));

  // Pie Chart: Anomalies Breakdown
  const anomaliesBreakdown = [
    { name: 'Anomalies', value: totalAnomalies, color: '#ef4444' },
    { name: 'Uncollectable', value: parseNum(totalRow['Total Uncolle ctable Forms']), color: '#f59e0b' },
    { name: 'ASD', value: parseNum(totalRow['Electors with ASD Discrep ancies']), color: '#8b5cf6' },
  ];

  // Chart Data: Anomalies Rate per Elector
  const anomaliesRateData = acRows.map((r: any) => {
    const electors = parseNum(r['Total El ectors']);
    const anomalies = parseNum(r['Total Ano malies']);
    const rate = electors > 0 ? (anomalies / electors) * 100 : 0;
    return {
      name: str(r['AC No. & Name']).replace(/^[0-9]+-/, ''),
      rate: parseFloat(rate.toFixed(2)),
    };
  });

  // Chart Data: Top Offenders for Not Digitized
  const notDigitizedOffenders = acRows.map((r: any) => ({
    name: str(r['AC No. & Name']).replace(/^[0-9]+-/, ''),
    value: parseNum(r['EFs Not Digitize d']),
  })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5
  
  // Chart Data: BLO Workload
  const bloWorkloadData = acRows.map((r: any) => {
    const blo = parseNum(r['Tota l BLO']);
    const electors = parseNum(r['Total El ectors']);
    const workload = blo > 0 ? (electors / blo) : 0;
    return {
      name: str(r['AC No. & Name']).replace(/^[0-9]+-/, ''),
      workload: parseFloat(workload.toFixed(0)),
    };
  });

  // Chart Data: Distributed vs Digitized Gap
  const distDigiGapData = acRows.map((r: any) => ({
    name: str(r['AC No. & Name']).replace(/^[0-9]+-/, ''),
    distributed: parseNum(r['EFs Distri buted']),
    digitized: parseNum(r['EFs Digi tized']),
  }));

  // Chart Data: Unverified Ratio (%)
  const unverifiedRatioData = acRows.map((r: any) => {
    const submitted = parseNum(r['EFs Sub mitted by Elector']);
    const unverified = parseNum(r['EFs Sub mitted by Elector (Not Verified by BLO)']);
    const ratio = submitted > 0 ? (unverified / submitted) * 100 : 0;
    return {
      name: str(r['AC No. & Name']).replace(/^[0-9]+-/, ''),
      ratio: parseFloat(ratio.toFixed(1)),
    };
  });

  // Chart Data: Overall District Drop-off Funnel
  const funnelData = [
    { stage: 'Total Electors', count: parseNum(totalRow['Total El ectors']) },
    { stage: 'Printed EFs', count: parseNum(totalRow['EFs Printed']) },
    { stage: 'Distributed EFs', count: parseNum(totalRow['EFs Distri buted']) },
    { stage: 'Digitized EFs', count: parseNum(totalRow['EFs Digi tized']) },
  ];

  const pieColors = ['#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308'];

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

        {/* Chart 7: District Pipeline (Radar) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">District Conversion Pipeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar name="Count" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 8: Printed vs Distributed Line */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Printed vs Distributed EFs Gap</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={gapData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="printed" fill="#94a3b8" name="Printed" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="distributed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Distributed" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 9: Anomalies Breakdown Pie */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Issues Breakdown (District Level)</h3>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={anomaliesBreakdown} cx="50%" cy="45%" innerRadius={0} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {anomaliesBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 10: Anomalies Rate per Elector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Anomalies per Elector (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomaliesRateData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="rate" fill="#ef4444" name="Anomalies %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 11: Top 5 Not Digitized */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Top 5 ACs: Pending Digitization</h3>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={notDigitizedOffenders} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {notDigitizedOffenders.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 12: Submitted vs Unverified Area */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Verified vs Unverified Submissions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={verificationData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUnv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="submitted" stroke="#14b8a6" fillOpacity={1} fill="url(#colorSub)" name="Total Submitted" strokeWidth={2} />
                <Area type="monotone" dataKey="unverified" stroke="#f43f5e" fillOpacity={1} fill="url(#colorUnv)" name="Not Verified" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 13: BLO Workload (Electors per BLO) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">BLO Workload (Electors per BLO)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloWorkloadData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="workload" fill="#8b5cf6" name="Electors per BLO" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 14: Distributed vs Digitized Line */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Distributed vs Digitized Gap</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={distDigiGapData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="distributed" fill="#cbd5e1" name="Distributed" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="digitized" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Digitized" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 15: Unverified Ratio (%) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Unverified Ratio (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={unverifiedRatioData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="ratio" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRatio)" name="Unverified %" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 16: Overall District Drop-off Funnel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Overall District Drop-off Funnel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000000}M`} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#14b8a6" name="Total Count" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#64748b', '#94a3b8', '#cbd5e1', '#8b5cf6'][index]} />
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
