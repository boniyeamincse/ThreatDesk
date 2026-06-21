'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Plus,
  Settings,
  Activity,
  Zap,
} from 'lucide-react';

interface LogSource {
  id: string;
  name: string;
  type: string;
  status: string;
  lastSyncAt?: string;
  lastError?: string;
  config?: any;
}

const SOURCE_TYPES = ['wazuh', 'deep-security', 'firewall', 'windows-logs', 'syslog'];

export default function LogSourcesPage() {
  const router = useRouter();
  const [sources, setSources] = useState<LogSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchSources = async (pageNum = 0) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/log-sources?skip=${
          pageNum * limit
        }&take=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSources(response.data.sources || []);
      setTotal(response.data.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load log sources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources(0);
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">Active</span>
        </div>
      );
    } else if (status === 'error') {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">Error</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-yellow-700">Inactive</span>
        </div>
      );
    }
  };

  const testConnection = async (sourceId: string) => {
    setTestingId(sourceId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/log-sources/${sourceId}/test-connection`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert(`Test result: ${response.data.message}`);
    } catch (err: any) {
      alert(`Test failed: ${err.response?.data?.message || 'Connection error'}`);
    } finally {
      setTestingId(null);
    }
  };

  const syncSource = async (sourceId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/log-sources/${sourceId}/sync`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert('Sync job queued');
      fetchSources(page);
    } catch (err: any) {
      alert(`Sync failed: ${err.response?.data?.message || 'Error'}`);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Log Sources</h1>
          <p className="text-gray-600 mt-1">Total: {total} sources</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchSources(page)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add Source
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <div className="text-gray-500">Loading sources...</div>
          </div>
        ) : sources.length === 0 ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <div className="text-gray-500">No log sources configured</div>
          </div>
        ) : (
          sources.map((source) => (
            <div key={source.id} className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{source.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
                  </p>
                </div>
                {getStatusBadge(source.status)}
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {source.lastSyncAt && (
                  <div>
                    <p className="text-xs text-gray-600">Last Sync</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(source.lastSyncAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {source.lastError && (
                  <div>
                    <p className="text-xs text-gray-600">Last Error</p>
                    <p className="text-sm text-red-600">{source.lastError}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => testConnection(source.id)}
                  disabled={testingId === source.id}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {testingId === source.id ? 'Testing...' : 'Test'}
                </button>
                <button
                  onClick={() => syncSource(source.id)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sync
                </button>
                <Link
                  href={`/log-sources/${source.id}`}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 text-center"
                >
                  Config
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchSources(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => fetchSources(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
