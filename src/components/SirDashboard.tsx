import React, { useState, useEffect } from 'react';
import { Loader2, Users, FileText, AlertTriangle, FileWarning } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line } from 'recharts';

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
      </div>
    </div>
  );
}
