'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, RefreshCw, Calendar } from 'lucide-react';

interface ReportSummary {
  totalAlerts?: number;
  truePositives?: number;
  falsePositives?: number;
  avgResolutionTime?: number;
  slaCompliance?: number;
}

interface AnalystData {
  analyst?: string;
  alerts?: number;
  resolved?: number;
  closureRate?: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState('daily');
  const [summaryData, setSummaryData] = useState<ReportSummary | null>(null);
  const [analystData, setAnalystData] = useState<AnalystData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const endpoint =
        reportType === 'daily'
          ? '/api/reports/daily'
          : reportType === 'weekly'
            ? '/api/reports/weekly'
            : '/api/reports/monthly';

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${endpoint}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSummaryData(response.data.summary);
      setAnalystData(response.data.analystWorkload || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    setExporting(format);
    try {
      const token = localStorage.getItem('access_token');

      const endpoint =
        reportType === 'daily'
          ? `/api/reports/export/daily/${format}`
          : reportType === 'weekly'
            ? `/api/reports/export/weekly/${format}`
            : `/api/reports/export/monthly/${format}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportType}.${format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv'}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export report');
    } finally {
      setExporting(null);
    }
  };

  const chartData = analystData.slice(0, 10).map((item) => ({
    name: item.analyst || 'Unknown',
    Alerts: item.alerts || 0,
    Resolved: item.resolved || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Report Period:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading report...</div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summaryData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summaryData.totalAlerts || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">True Positives</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {summaryData.truePositives || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">False Positives</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {summaryData.falsePositives || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Avg Resolution</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {summaryData.avgResolutionTime || 0}h
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">SLA Compliance</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {summaryData.slaCompliance || 0}%
                </p>
              </div>
            </div>
          )}

          {/* Charts */}
          {analystData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analyst Workload Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Analyst Workload
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Alerts" fill="#3b82f6" />
                    <Bar dataKey="Resolved" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Closure Rate Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Analyst Closure Rate
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analystData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="analyst" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="closureRate"
                      stroke="#8b5cf6"
                      name="Closure Rate %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Export Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Report</h3>
            <div className="flex gap-4">
              <button
                onClick={() => exportReport('pdf')}
                disabled={exporting === 'pdf'}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting === 'pdf' ? 'Exporting...' : 'PDF'}
              </button>
              <button
                onClick={() => exportReport('excel')}
                disabled={exporting === 'excel'}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting === 'excel' ? 'Exporting...' : 'Excel'}
              </button>
              <button
                onClick={() => exportReport('csv')}
                disabled={exporting === 'csv'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting === 'csv' ? 'Exporting...' : 'CSV'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
