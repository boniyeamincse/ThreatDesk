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
          axios.get(`${baseUrl}/api/dashboard/severity-count`, { headers }),
          axios.get(`${baseUrl}/api/dashboard/status-count`, { headers }),
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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ThreatDesk Dashboard</h1>
            <p className="text-gray-600 mt-1">SOC Alert Management & Triage</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* New Alerts Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">New Alerts</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{summary.newAlerts}</p>
                </div>
                <div className="text-blue-600 text-3xl">📋</div>
              </div>
            </div>

            {/* In Progress Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{summary.inProgress}</p>
                </div>
                <div className="text-yellow-600 text-3xl">⏳</div>
              </div>
            </div>

            {/* Escalated Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Escalated to L2</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{summary.escalated}</p>
                </div>
                <div className="text-orange-600 text-3xl">🚀</div>
              </div>
            </div>

            {/* Critical Alerts Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Critical Alerts</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{summary.criticalAlerts}</p>
                </div>
                <div className="text-red-600 text-3xl">🚨</div>
              </div>
            </div>

            {/* True Positive Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">True Positive</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{summary.truePositive}</p>
                </div>
                <div className="text-green-600 text-3xl">✓</div>
              </div>
            </div>

            {/* False Positive Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">False Positive</p>
                  <p className="text-3xl font-bold text-gray-600 mt-2">{summary.falsePositive}</p>
                </div>
                <div className="text-gray-600 text-3xl">✗</div>
              </div>
            </div>

            {/* Closed Today Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Closed Today</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{summary.closedToday}</p>
                </div>
                <div className="text-indigo-600 text-3xl">📦</div>
              </div>
            </div>

            {/* SLA Breached Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">SLA Breached</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{summary.slaBreached}</p>
                </div>
                <div className="text-red-600 text-3xl">⏰</div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Alert Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SeverityChart data={severityData} />
            <StatusChart data={statusData} />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/alerts"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-blue-600"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">View Alerts</h3>
            <p className="text-gray-600">Browse and triage all security alerts</p>
          </a>

          <a
            href="/tickets"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-orange-600"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">View Tickets</h3>
            <p className="text-gray-600">Track created incidents and tickets</p>
          </a>

          <a
            href="/integrations"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-green-600"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Integrations</h3>
            <p className="text-gray-600">Configure data source integrations</p>
          </a>
        </div>
      </main>
    </div>
  );
}
