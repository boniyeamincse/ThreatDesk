'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

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
  value?: number;
}

interface TrendData {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

export default function DashboardPage() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [severityData, setSeverityData] = useState<ChartData[]>([]);
  const [statusData, setStatusData] = useState<ChartData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [analystWorkload, setAnalystWorkload] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');

    if (!token) {
      router.push('/login');
      return;
    }

    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      query: { userId },
      auth: { token },
    });

    socketRef.current.on('alert.created', (data) => {
      setLastUpdate(new Date());
      // Update dashboard metrics
      setSummary((prev) => (prev ? { ...prev, newAlerts: prev.newAlerts + 1 } : prev));
    });

    socketRef.current.on('alert.escalated', (data) => {
      setLastUpdate(new Date());
      setSummary((prev) => (prev ? { ...prev, escalated: prev.escalated + 1 } : prev));
    });

    socketRef.current.on('sla.breached', (data) => {
      setLastUpdate(new Date());
      setSummary((prev) => (prev ? { ...prev, slaBreached: prev.slaBreached + 1 } : prev));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [router]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const headers = { Authorization: `Bearer ${token}` };

      const [
        summaryRes,
        severityRes,
        statusRes,
        trendsRes,
        workloadRes,
      ] = await Promise.all([
        axios.get(`${baseUrl}/api/dashboard/summary`, { headers }),
        axios.get(`${baseUrl}/api/dashboard/severity-count`, { headers }),
        axios.get(`${baseUrl}/api/dashboard/status-count`, { headers }),
        axios.get(`${baseUrl}/api/dashboard/alert-trends?days=7`, { headers }),
        axios.get(`${baseUrl}/api/dashboard/analyst-workload`, { headers }),
      ]);

      setSummary(summaryRes.data);
      setSeverityData(severityRes.data || []);
      setStatusData(statusRes.data || []);
      setTrendData(trendsRes.data || []);
      setAnalystWorkload(workloadRes.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !summary) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Alerts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.newAlerts}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.inProgress}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Escalated</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.escalated}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SLA Breached</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summary.slaBreached}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Distribution</h3>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={severityData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {severityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 h-64 flex items-center justify-center">
              No data
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 h-64 flex items-center justify-center">
              No data
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
          {summary && (
            <>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Critical Alerts</span>
                <span className="text-lg font-semibold text-red-600">
                  {summary.criticalAlerts}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">True Positives</span>
                <span className="text-lg font-semibold text-green-600">
                  {summary.truePositive}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">False Positives</span>
                <span className="text-lg font-semibold text-yellow-600">
                  {summary.falsePositive}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Closed Today</span>
                <span className="text-lg font-semibold text-blue-600">
                  {summary.closedToday}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Trends (7 Days)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" />
                <Line type="monotone" dataKey="high" stroke="#f97316" />
                <Line type="monotone" dataKey="medium" stroke="#eab308" />
                <Line type="monotone" dataKey="low" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 h-80 flex items-center justify-center">
              No data
            </div>
          )}
        </div>

        {/* Analyst Workload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyst Workload</h3>
          {analystWorkload.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analystWorkload.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 h-80 flex items-center justify-center">
              No data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
