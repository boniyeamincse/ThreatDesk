'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Clock, Plus, Search, RefreshCw, Shield } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  assignedTo?: string;
  alertCount?: number;
  createdAt: string;
  updatedAt: string;
}

const STATUSES = [
  'open',
  'investigating',
  'contained',
  'remediated',
  'recovered',
  'closed',
  'reopened',
];
const SEVERITIES = ['critical', 'high', 'medium', 'low'];

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');

  const fetchIncidents = async (pageNum = 0) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams();
      params.append('skip', (pageNum * limit).toString());
      params.append('take', limit.toString());
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedSeverity) params.append('severity', selectedSeverity);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/incidents?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setIncidents(response.data.incidents || []);
      setTotal(response.data.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load incidents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents(0);
  }, [selectedStatus, selectedSeverity, searchTerm]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'investigating':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'contained':
        return <Shield className="w-4 h-4 text-orange-500" />;
      case 'recovered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      open: 'Open',
      investigating: 'Investigating',
      contained: 'Contained',
      remediated: 'Remediated',
      recovered: 'Recovered',
      closed: 'Closed',
      reopened: 'Reopened',
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-600 mt-1">Total: {total} incidents</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchIncidents(page)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            New Incident
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((stat) => (
              <option key={stat} value={stat}>
                {stat.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => {
              setSelectedSeverity(e.target.value);
              setPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Incidents Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading incidents...</div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">No incidents found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Alerts
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {incident.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(
                          incident.severity,
                        )}`}
                      >
                        {incident.severity?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(incident.status)}
                        <span className="text-sm text-gray-600">
                          {getStatusText(incident.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {incident.alertCount || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {incident.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              onClick={() => fetchIncidents(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => fetchIncidents(Math.min(totalPages - 1, page + 1))}
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
