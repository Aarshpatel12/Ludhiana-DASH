"use client";

import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar
} from 'recharts';

interface OfficerChartsProps {
  schemes: any[];
  tasks: any[];
}

const COLORS = {
  completed: '#10b981', // emerald-500
  inProgress: '#3b82f6', // blue-500
  atRisk: '#ef4444', // red-500
};

export default function OfficerCharts({ schemes, tasks }: OfficerChartsProps) {
  // Calculate Task Status Mix
  let completed = 0;
  let inProgress = 0;
  let atRisk = 0;

  const allItems = [...schemes, ...tasks];

  allItems.forEach(row => {
    const status = (row['Status'] || '').toLowerCase();
    const hasFlag = row['Auto-Flag'] && row['Auto-Flag'].trim() !== '';
    const isPending = status.includes('pending') || status.includes('blocked');
    const isCompleted = status.includes('completed');
    
    // Check Achieved % for schemes if status is empty
    const pctRaw = parseFloat(row['Achieved %']);
    const isPctCompleted = !isNaN(pctRaw) && pctRaw >= 100;

    if (hasFlag || isPending) {
      atRisk++;
    } else if (isCompleted || isPctCompleted) {
      completed++;
    } else {
      inProgress++;
    }
  });

  const pieData = [
    { name: 'Completed', value: completed, color: COLORS.completed },
    { name: 'In Progress', value: inProgress, color: COLORS.inProgress },
    { name: 'Pending / Blocked', value: atRisk, color: COLORS.atRisk },
  ].filter(d => d.value > 0);

  // Calculate Scheme Progress (only take schemes that have numeric targets/percents)
  const barData = schemes.map(s => {
    const pct = parseFloat(s['Achieved %']);
    return {
      name: s['KPI / Metric']?.length > 15 ? s['KPI / Metric'].substring(0, 15) + '...' : s['KPI / Metric'],
      fullName: s['KPI / Metric'],
      Progress: isNaN(pct) ? 0 : pct,
    };
  }).filter(s => s.name).sort((a, b) => b.Progress - a.Progress);

  // Radar Data (Priority Footprint)
  const categoryCounts: Record<string, { total: number, completed: number }> = {};
  allItems.forEach(row => {
    const cat = row['Priority Agenda'] || 'Other';
    if (!categoryCounts[cat]) categoryCounts[cat] = { total: 0, completed: 0 };
    categoryCounts[cat].total++;
    const st = (row['Status'] || '').toLowerCase();
    const pctRaw = parseFloat(row['Achieved %']);
    if (st.includes('completed') || (!isNaN(pctRaw) && pctRaw >= 100)) {
      categoryCounts[cat].completed++;
    }
  });

  const radarData = Object.keys(categoryCounts).map(cat => ({
    subject: cat.length > 15 ? cat.substring(0, 15) + '...' : cat,
    fullSubject: cat,
    Total: categoryCounts[cat].total,
    Completed: categoryCounts[cat].completed,
  }));

  // Top 3 KPI Gauges
  const topKpis = schemes.filter(s => !isNaN(parseFloat(s['Achieved %']))).slice(0, 3).map((s, idx) => {
    const pct = Math.min(100, Math.max(0, parseFloat(s['Achieved %'])));
    return {
      name: s['KPI / Metric'],
      value: pct,
      fill: pct >= 100 ? COLORS.completed : pct < 50 ? COLORS.atRisk : COLORS.inProgress
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Task Status Mix Donut */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors flex flex-col">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-center lg:text-left">Overall Status Mix</h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scheme Progress Horizontal Bar */}
      {barData.length > 0 && (
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Scheme Completion Overview</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={barData}
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis type="number" domain={[0, 'dataMax']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value}%`, 'Progress']}
                  labelFormatter={(label: any, payload: any) => payload[0]?.payload?.fullName || label}
                />
                <Bar dataKey="Progress" fill={COLORS.inProgress} radius={[0, 4, 4, 0]}>
                  {
                    barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Progress >= 100 ? COLORS.completed : COLORS.inProgress} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Radar Chart (Performance Footprint) */}
      {radarData.length > 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Agenda Footprint</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                <Radar name="Total Tasks" dataKey="Total" stroke={COLORS.atRisk} fill={COLORS.atRisk} fillOpacity={0.2} />
                <Radar name="Completed" dataKey="Completed" stroke={COLORS.completed} fill={COLORS.completed} fillOpacity={0.6} />
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top KPIs Radial */}
      {topKpis.length > 0 && (
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Top KPIs Progress</h3>
          <div className="flex-1 min-h-[300px] flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={20} data={topKpis}>
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 11, fontWeight: 'bold' }}
                  background
                  dataKey="value"
                />
                <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" wrapperStyle={{ top: 0, left: 0, lineHeight: '24px', fontSize: '11px' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Progress']} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
