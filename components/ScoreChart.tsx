import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Player } from '../types';

interface ScoreChartProps {
  players: Player[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ players }) => {
  // Sort by lapTime ascending for the chart to show leaders first
  const data = players.slice(0, 10).map((p) => ({
    name: p.name.length > 8 ? p.name.substring(0, 8) + '...' : p.name,
    lapTime: p.lapTime,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 border border-slate-600 rounded shadow-xl">
          <p className="text-slate-200 font-bold">{label}</p>
          <p className="text-indigo-400">Time: {Number(payload[0].value).toFixed(3)}s</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <h3 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Top 10 Lap Times (Lower is Better)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={false} 
            axisLine={false}
            domain={['auto', 'auto']} // Adapts to time range
            tickFormatter={(value) => `${value}s`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="lapTime" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              // Highlight top 3 (lowest times)
              <Cell key={`cell-${index}`} fill={index < 3 ? '#6366f1' : '#475569'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;