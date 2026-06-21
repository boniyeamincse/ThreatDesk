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
        return 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
      case 'inactive':
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/50';
      case 'error':
        return 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      default:
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="h-8 w-1.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
              Integrations
            </h1>
            <p className="text-slate-400 mt-2 text-sm ml-4">Configure data source integrations</p>
          </div>
        </div>
        {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg shadow-lg flex items-center"><span className="mr-2">⚠</span> {error}</div>}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400 animate-pulse">Loading integrations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Wazuh Integration Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 border-l-4 !border-l-blue-600 hover:bg-slate-800/50 transition duration-300">
              <h3 className="text-lg font-bold text-white mb-2">Wazuh</h3>
              <p className="text-slate-400 text-sm mb-4">Security event monitoring and threat detection</p>
              <div className="flex items-center justify-between mt-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button
                  onClick={loadWazuhConfig}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition"
                >
                  Configure
                </button>
              </div>
            </div>

            {/* Deep Security Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 border-l-4 !border-l-orange-600 hover:bg-slate-800/50 transition duration-300">
              <h3 className="text-lg font-bold text-white mb-2">Trend Micro Deep Security</h3>
              <p className="text-slate-400 text-sm mb-4">Malware, IPS, and application control events</p>
              <div className="flex items-center justify-between mt-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition">Configure</button>
              </div>
            </div>

            {/* Firewall Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 border-l-4 !border-l-green-600 hover:bg-slate-800/50 transition duration-300">
              <h3 className="text-lg font-bold text-white mb-2">Firewall</h3>
              <p className="text-slate-400 text-sm mb-4">Network traffic and threat intelligence</p>
              <div className="flex items-center justify-between mt-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition">Configure</button>
              </div>
            </div>

            {/* Email Security Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 border-l-4 !border-l-red-600 hover:bg-slate-800/50 transition duration-300">
              <h3 className="text-lg font-bold text-white mb-2">Email Security</h3>
              <p className="text-slate-400 text-sm mb-4">Phishing, malware, and DLP events</p>
              <div className="flex items-center justify-between mt-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition">Configure</button>
              </div>
            </div>

            {/* EDR/XDR Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 border-l-4 !border-l-purple-600 hover:bg-slate-800/50 transition duration-300">
              <h3 className="text-lg font-bold text-white mb-2">EDR / XDR</h3>
              <p className="text-slate-400 text-sm mb-4">Endpoint detection and response events</p>
              <div className="flex items-center justify-between mt-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition">Configure</button>
              </div>
            </div>

            {/* Windows/Linux Logs Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-6 border-l-4 !border-l-slate-500 hover:bg-slate-800/50 transition duration-300">
              <h3 className="text-lg font-bold text-white mb-2">System Logs</h3>
              <p className="text-slate-400 text-sm mb-4">Windows and Linux system event logs</p>
              <div className="flex items-center justify-between mt-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor('inactive')}`}>
                  Inactive
                </span>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition">Configure</button>
              </div>
            </div>
          </div>
        )}

        {integrations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]"></span>
              Configured Integrations
            </h2>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {integrations.map((integration) => (
                    <tr key={integration.id} className="hover:bg-slate-800/50 transition duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-slate-200">{integration.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{integration.type}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  Wazuh Configuration
                </h2>
                <button
                  onClick={() => setShowWazuhModal(false)}
                  className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-500/50 rounded flex gap-2 shadow-lg">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-300">{error}</span>
                  </div>
                )}

                {testResult && (
                  <div
                    className={`p-3 border rounded-lg shadow-lg flex gap-2 ${
                      testResult.success
                        ? 'bg-green-900/30 border-green-500/50'
                        : 'bg-red-900/30 border-red-500/50'
                    }`}>
                    {testResult.success ? (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm ${
                        testResult.success ? 'text-green-300' : 'text-red-300'
                      }`}>
                      {testResult.message}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    API URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://wazuh-manager.example.com"
                    value={wazuhConfig.apiUrl}
                    onChange={(e) => setWazuhConfig({...wazuhConfig, apiUrl: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="admin"
                    value={wazuhConfig.user}
                    onChange={(e) => setWazuhConfig({...wazuhConfig, user: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={wazuhConfig.password}
                    onChange={(e) => setWazuhConfig({...wazuhConfig, password: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-900/80">
                <button
                  onClick={() => setShowWazuhModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition">
                  Cancel
                </button>
                <button
                  onClick={testWazuhConnection}
                  disabled={testLoading || !wazuhConfig.apiUrl}
                  className="flex-1 px-4 py-2.5 border border-slate-700 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium transition disabled:opacity-50">
                  {testLoading ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  onClick={saveWazuhConfig}
                  disabled={saveLoading || !wazuhConfig.apiUrl || !wazuhConfig.user || !wazuhConfig.password}
                  className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 font-medium shadow-[0_0_15px_rgba(6,182,212,0.4)] transition disabled:opacity-50 disabled:shadow-none">
                  {saveLoading ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
