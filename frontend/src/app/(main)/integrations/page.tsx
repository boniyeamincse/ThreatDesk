'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { X, Check, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  lastSyncAt?: string;
}

interface WazuhConfig {
  apiUrl: string;
  user: string;
  password: string;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWazuhModal, setShowWazuhModal] = useState(false);
  const [wazuhConfig, setWazuhConfig] = useState<WazuhConfig>({
    apiUrl: '',
    user: '',
    password: '',
  });
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchIntegrations();
  }, [router, token]);

  const fetchIntegrations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/integrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIntegrations(response.data);
    } catch (err) {
      setError('Failed to load integrations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWazuhConfig = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/integrations/wazuh/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setWazuhConfig(response.data);
      }
    } catch (err) {
      console.log('No existing Wazuh config');
    }
    setShowWazuhModal(true);
  };

  const testWazuhConnection = async () => {
    try {
      setTestLoading(true);
      setTestResult(null);
      const response = await axios.post(
        `${apiUrl}/api/integrations/wazuh/test`,
        wazuhConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestResult(response.data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Connection test failed',
      });
    } finally {
      setTestLoading(false);
    }
  };

  const saveWazuhConfig = async () => {
    try {
      setSaveLoading(true);
      await axios.post(
        `${apiUrl}/api/integrations/wazuh/config`,
        wazuhConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setError('');
      setShowWazuhModal(false);
      await fetchIntegrations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save config');
    } finally {
      setSaveLoading(false);
    }
  };

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
                <button
                  onClick={loadWazuhConfig}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">
                  Configure
                </button>
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

        {/* Wazuh Config Modal */}
        {showWazuhModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Wazuh Configuration</h2>
                <button
                  onClick={() => setShowWazuhModal(false)}
                  className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                )}

                {testResult && (
                  <div
                    className={`p-3 border rounded flex gap-2 ${
                      testResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                    {testResult.success ? (
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                      {testResult.message}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://wazuh-manager.example.com"
                    value={wazuhConfig.apiUrl}
                    onChange={(e) => setWazuhConfig({...wazuhConfig, apiUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="admin"
                    value={wazuhConfig.user}
                    onChange={(e) => setWazuhConfig({...wazuhConfig, user: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={wazuhConfig.password}
                    onChange={(e) => setWazuhConfig({...wazuhConfig, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowWazuhModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition">
                  Cancel
                </button>
                <button
                  onClick={testWazuhConnection}
                  disabled={testLoading || !wazuhConfig.apiUrl}
                  className="flex-1 px-4 py-2 border border-indigo-300 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium transition disabled:opacity-50">
                  {testLoading ? 'Testing...' : 'Test'}
                </button>
                <button
                  onClick={saveWazuhConfig}
                  disabled={saveLoading || !wazuhConfig.apiUrl || !wazuhConfig.user || !wazuhConfig.password}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition disabled:opacity-50">
                  {saveLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
