'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  lastSyncAt?: string;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchIntegrations = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/integrations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setIntegrations(response.data);
      } catch (err) {
        setError('Failed to load integrations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600 mt-1">Configure data source integrations</p>
          </div>
        </div>
        {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading integrations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Wazuh Integration Card */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Wazuh</h3>
              <p className="text-gray-600 text-sm mb-4">Security event monitoring and threat detection</p>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">Configure</button>
              </div>
            </div>

            {/* Deep Security Card */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Trend Micro Deep Security</h3>
              <p className="text-gray-600 text-sm mb-4">Malware, IPS, and application control events</p>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">Configure</button>
              </div>
            </div>

            {/* Firewall Card */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Firewall</h3>
              <p className="text-gray-600 text-sm mb-4">Network traffic and threat intelligence</p>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">Configure</button>
              </div>
            </div>

            {/* Email Security Card */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email Security</h3>
              <p className="text-gray-600 text-sm mb-4">Phishing, malware, and DLP events</p>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">Configure</button>
              </div>
            </div>

            {/* EDR/XDR Card */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
              <h3 className="text-lg font-bold text-gray-900 mb-2">EDR / XDR</h3>
              <p className="text-gray-600 text-sm mb-4">Endpoint detection and response events</p>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">Configure</button>
              </div>
            </div>

            {/* Windows/Linux Logs Card */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-600">
              <h3 className="text-lg font-bold text-gray-900 mb-2">System Logs</h3>
              <p className="text-gray-600 text-sm mb-4">Windows and Linux system event logs</p>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">Configure</button>
              </div>
            </div>
          </div>
        )}

        {integrations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Configured Integrations</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {integrations.map((integration) => (
                    <tr key={integration.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{integration.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{integration.type}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
