'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  count: number;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function StatusChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl p-6 h-80 flex items-center justify-center">
        <p className="text-slate-500">No data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.name.replace(/_/g, ' ').toUpperCase(),
    value: item.count,
  }));

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl p-6 hover:border-slate-700 transition duration-300">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
        Alerts by Status
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
            itemStyle={{ color: '#f8fafc' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
