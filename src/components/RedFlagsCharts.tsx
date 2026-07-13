"use client";

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface RedFlagsChartsProps {
  flagsData: any[];
}

export default function RedFlagsCharts({ flagsData }: RedFlagsChartsProps) {
  // Aggregate flags by officer
  const officerCounts: Record<string, number> = {};
  flagsData.forEach(flag => {
    const officer = flag._officerName;
    if (!officerCounts[officer]) officerCounts[officer] = 0;
    officerCounts[officer]++;
  });

  const chartData = Object.keys(officerCounts).map(name => ({
    name,
    flags: officerCounts[name]
  })).sort((a, b) => b.flags - a.flags);

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors mb-6">
      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Flag Distribution by Officer</h3>
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              angle={-45}
              textAnchor="end"
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip 
              cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(val: any) => [val, 'Red Flags']}
            />
            <Bar dataKey="flags" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#ef4444" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
