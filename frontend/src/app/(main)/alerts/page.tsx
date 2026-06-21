'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Alert {
  id: string;
  alertCode: string;
  name: string;
  severity: string;
  status: string;
  verdict: string;
  alertTime: string;
  source: string;
}

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchAlerts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setAlerts(response.data.alerts);
      } catch (err) {
        setError('Failed to load alerts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [router]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'text-blue-600 font-semibold';
      case 'in_progress':
        return 'text-yellow-600 font-semibold';
      case 'escalated':
        return 'text-orange-600 font-semibold';
      case 'closed':
        return 'text-green-600 font-semibold';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
            <p className="text-gray-600 mt-1">Review and triage security alerts</p>
          </div>
        </div>
        {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No alerts found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Alert Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Severity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Verdict</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Source</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{alert.alertCode}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{alert.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${getStatusColor(alert.status)}`}>{alert.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{alert.verdict}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{alert.source}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(alert.alertTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a
                        href={`/alerts/${alert.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
