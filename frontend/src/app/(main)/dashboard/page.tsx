'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import SeverityChart from '@/components/Charts/SeverityChart';
import StatusChart from '@/components/Charts/StatusChart';

interface DashboardSummary {
  newAlerts: number;
  inProgress: number;
  escalated: number;
  truePositive: number;
  falsePositive: number;
  closedToday: number;
  criticalAlerts: number;
  slaBreached: number;
}

interface ChartData {
  name: string;
  count: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [severityData, setSeverityData] = useState<ChartData[]>([]);
  const [statusData, setStatusData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const headers = { Authorization: `Bearer ${token}` };

        const [summaryRes, severityRes, statusRes] = await Promise.all([
          axios.get(`${baseUrl}/api/dashboard/summary`, { headers }),
          axios.get(`${baseUrl}/api/dashboard/severity-counts`, { headers }),
          axios.get(`${baseUrl}/api/dashboard/status-counts`, { headers }),
        ]);

        setSummary(summaryRes.data);
        setSeverityData(severityRes.data);
        setStatusData(statusRes.data);
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-300">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <div className="h-8 w-1.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
             Dashboard
          </h1>
          <p className="text-slate-400 mt-2 text-sm ml-4">SOC Alert Management & Triage Overview</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg shadow-lg flex items-center"><span className="mr-2">⚠</span> {error}</div>}

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* New Alerts Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 hover:border-cyan-500/50 transition duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">New Alerts</p>
                  <p className="text-3xl font-bold text-cyan-400 mt-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">{summary.newAlerts}</p>
                </div>
                <div className="text-cyan-500 text-3xl opacity-80 group-hover:opacity-100 transition">📋</div>
              </div>
            </div>

            {/* In Progress Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 hover:border-yellow-500/50 transition duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">{summary.inProgress}</p>
                </div>
                <div className="text-yellow-500 text-3xl opacity-80 group-hover:opacity-100 transition">⏳</div>
              </div>
            </div>

            {/* Escalated Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 hover:border-orange-500/50 transition duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Escalated to L2</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">{summary.escalated}</p>
                </div>
                <div className="text-orange-500 text-3xl opacity-80 group-hover:opacity-100 transition">🚀</div>
              </div>
            </div>

            {/* Critical Alerts Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 hover:border-red-500/50 transition duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Critical Alerts</p>
                  <p className="text-3xl font-bold text-red-400 mt-2 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">{summary.criticalAlerts}</p>
                </div>
                <div className="text-red-500 text-3xl opacity-80 group-hover:opacity-100 transition">🚨</div>
              </div>
            </div>

            {/* True Positive Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 hover:border-green-500/50 transition duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">True Positive</p>
                  <p className="text-3xl font-bold text-green-400 mt-2 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">{summary.truePositive}</p>
                </div>
                <div className="text-green-500 text-3xl opacity-80 group-hover:opacity-100 transition">✓</div>
              </div>
            </div>

            {/* False Positive Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 hover:border-slate-500/50 transition duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">False Positive</p>
                  <p className="text-3xl font-bold text-slate-400 mt-2">{summary.falsePositive}</p>
                </div>
                <div className="text-slate-500 text-3xl opacity-80 group-hover:opacity-100 transition">✗</div>
              </div>
            </div>

            {/* Closed Today Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 hover:border-purple-500/50 transition duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Closed Today</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">{summary.closedToday}</p>
                </div>
                <div className="text-purple-500 text-3xl opacity-80 group-hover:opacity-100 transition">📦</div>
              </div>
            </div>

            {/* SLA Breached Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 hover:border-red-500/50 transition duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">SLA Breached</p>
                  <p className="text-3xl font-bold text-red-500 mt-2 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">{summary.slaBreached}</p>
                </div>
                <div className="text-red-600 text-3xl opacity-80 group-hover:opacity-100 transition animate-pulse">⏰</div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="mt-8 bg-slate-900/30 backdrop-blur-sm border border-slate-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]"></span>
            Alert Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SeverityChart data={severityData} />
            <StatusChart data={statusData} />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/alerts"
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 hover:border-cyan-500/50 hover:bg-slate-800/80 transition duration-300 cursor-pointer border-l-4 border-l-cyan-600 group"
          >
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition">View Alerts</h3>
            <p className="text-slate-400">Browse and triage all security alerts</p>
          </a>

          <a
            href="/tickets"
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 hover:border-orange-500/50 hover:bg-slate-800/80 transition duration-300 cursor-pointer border-l-4 border-l-orange-600 group"
          >
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition">View Tickets</h3>
            <p className="text-slate-400">Track created incidents and tickets</p>
          </a>

          <a
            href="/integrations"
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 hover:border-green-500/50 hover:bg-slate-800/80 transition duration-300 cursor-pointer border-l-4 border-l-green-600 group"
          >
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition">Integrations</h3>
            <p className="text-slate-400">Configure data source integrations</p>
          </a>
        </div>
      </main>
    </div>
  );
}
