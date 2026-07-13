"use client";

import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis, Treemap
} from 'recharts';

interface MasterChartsProps {
  completed: number;
  inProgress: number;
  atRisk: number;
  officerData: any[];
}

const COLORS = {
  completed: '#10b981', // emerald-500
  inProgress: '#3b82f6', // blue-500
  atRisk: '#ef4444', // red-500
  notStarted: '#94a3b8', // slate-400
};

export default function MasterCharts({ completed, inProgress, atRisk, officerData }: MasterChartsProps) {
  // We can compute Not Started if we pass it, but for simplicity let's just use what's passed for pie
  const pieData = [
    { name: 'Completed', value: completed, color: COLORS.completed },
    { name: 'In Progress', value: inProgress, color: COLORS.inProgress },
    { name: 'Pending / Blocked', value: atRisk, color: COLORS.atRisk },
  ].filter(d => d.value > 0);

  const barData = officerData.map(row => ({
    name: row['Officer / Tab'],
    Completed: parseInt(row['Completed']) || 0,
    InProgress: parseInt(row['In Progress']) || parseInt(row['On Track']) || 0,
    Pending: parseInt(row['Pending/Blocked']) || 0,
    NotStarted: parseInt(row['Not Started']) || 0,
  })).sort((a, b) => (b.Completed + b.InProgress + b.Pending + b.NotStarted) - (a.Completed + a.InProgress + a.Pending + a.NotStarted));

  const scatterData = officerData.map(row => {
    const kpis = parseInt(row['Total KPIs']) || 0;
    const flags = parseInt(row['Flags']) || 0;
    const pct = parseFloat(row['% Done']) * 100 || 0;
    return { name: row['Officer / Tab'], kpis, flags, pct };
  }).filter(d => d.kpis > 0);

  const treemapData = officerData.map(row => {
    const kpis = parseInt(row['Total KPIs']) || 0;
    return { name: row['Officer / Tab'], size: kpis };
  }).filter(d => d.size > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overall Status Donut */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors flex flex-col">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Overall District Status</h3>
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

      {/* Officer Performance Stacked Bar */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors flex flex-col">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Officer Bottleneck Analysis</h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Completed" stackId="a" fill={COLORS.completed} radius={[0, 0, 4, 4]} />
              <Bar dataKey="InProgress" stackId="a" fill={COLORS.inProgress} name="In Progress" />
              <Bar dataKey="NotStarted" stackId="a" fill={COLORS.notStarted} name="Not Started" />
              <Bar dataKey="Pending" stackId="a" fill={COLORS.atRisk} name="Pending / Blocked" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scatter Plot (Risk vs Workload) */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors flex flex-col">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Risk vs Workload Analysis</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 -mt-3">X-Axis: Total KPIs | Y-Axis: Red Flags | Bubble Size: % Done</p>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
              <XAxis type="number" dataKey="kpis" name="Total KPIs" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis type="number" dataKey="flags" name="Red Flags" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <ZAxis type="number" dataKey="pct" range={[60, 400]} name="% Done" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number, name: string) => name === '% Done' ? [`${value.toFixed(1)}%`, name] : [value, name]}
              />
              <Scatter name="Officers" data={scatterData} fill={COLORS.atRisk} fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Treemap (Resource Distribution) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors flex flex-col">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Resource Distribution</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 -mt-3">Total Tracking Items per Officer</p>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill={COLORS.inProgress}
            >
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [value, 'Total KPIs']}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
