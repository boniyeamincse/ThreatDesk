'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  count: number;
}

export default function SeverityChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl p-6 h-80 flex items-center justify-center">
        <p className="text-slate-500">No data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    count: item.count,
  }));

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl p-6 hover:border-slate-700 transition duration-300">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
        Alerts by Severity
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} tickLine={{stroke: '#334155'}} axisLine={{stroke: '#334155'}} />
          <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} tickLine={{stroke: '#334155'}} axisLine={{stroke: '#334155'}} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
            itemStyle={{ color: '#06b6d4' }}
          />
          <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
