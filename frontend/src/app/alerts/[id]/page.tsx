'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

interface AlertDetail {
  id: string;
  alertCode: string;
  name: string;
  severity: string;
  status: string;
  verdict: string;
  alertTime: string;
  eventTime: string;
  source: string;
  sourceIp?: string;
  destinationIp?: string;
  mitreTactic?: string;
  mitreTechnique?: string;
  ruleId?: string;
  comments?: any[];
  asset?: any;
  assignedTo?: any[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    name: string;
  };
}

export default function AlertDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [assignees, setAssignees] = useState<User[]>([]);
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchAlert = async () => {
      try {
        const [alertRes, assigneesRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts/${id}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts/users/assignees/list`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);
        setAlert(alertRes.data);
        setAssignees(assigneesRes.data);
      } catch (err) {
        setError('Failed to load alert');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlert();
  }, [id, router]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    const token = localStorage.getItem('access_token');
    setSubmittingComment(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts/${id}/comments`,
        { content: comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setComment('');
      // Reload alert to show new comment
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAlert(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const token = localStorage.getItem('access_token');

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Reload alert
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAlert(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (userId: string) => {
    const token = localStorage.getItem('access_token');
    setAssigningTo(userId);

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts/${id}/assign`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Reload alert
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAlert(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningTo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600">Loading alert details...</p>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg">Alert not found</p>
          <a href="/alerts" className="text-indigo-600 mt-4 inline-block">
            Back to Alerts
          </a>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alert Triage</h1>
            <p className="text-gray-600 mt-1">{alert.alertCode}</p>
          </div>
          <a
            href="/alerts"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
          >
            Back to Alerts
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Alert Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{alert.name}</h2>
                  <p className="text-gray-600 mt-1">Rule ID: {alert.ruleId || 'N/A'}</p>
                </div>
                <span className={`px-4 py-2 rounded-lg font-semibold border-2 ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>

              {/* Alert Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Alert Time</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date(alert.alertTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Event Time</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date(alert.eventTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-sm font-semibold text-gray-900">{alert.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verdict</p>
                  <p className="text-sm font-semibold text-gray-900">{alert.verdict}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Source</p>
                  <p className="text-sm font-semibold text-gray-900">{alert.source}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Asset</p>
                  <p className="text-sm font-semibold text-gray-900">{alert.asset?.hostname || 'N/A'}</p>
                </div>
              </div>

              {/* Network Info */}
              {(alert.sourceIp || alert.destinationIp) && (
                <div className="border-t pt-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Network Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {alert.sourceIp && (
                      <div>
                        <p className="text-sm text-gray-600">Source IP</p>
                        <p className="text-sm font-semibold text-gray-900">{alert.sourceIp}</p>
                      </div>
                    )}
                    {alert.destinationIp && (
                      <div>
                        <p className="text-sm text-gray-600">Destination IP</p>
                        <p className="text-sm font-semibold text-gray-900">{alert.destinationIp}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MITRE ATT&CK */}
              {(alert.mitreTactic || alert.mitreTechnique) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">MITRE ATT&CK</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {alert.mitreTactic && (
                      <div>
                        <p className="text-sm text-gray-600">Tactic</p>
                        <p className="text-sm font-semibold text-gray-900">{alert.mitreTactic}</p>
                      </div>
                    )}
                    {alert.mitreTechnique && (
                      <div>
                        <p className="text-sm text-gray-600">Technique</p>
                        <p className="text-sm font-semibold text-gray-900">{alert.mitreTechnique}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Comments & Investigation</h3>

              {/* Add Comment */}
              <div className="mb-6 pb-6 border-b">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add an investigation note or comment..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {submittingComment ? 'Adding...' : 'Add Comment'}
                </button>
              </div>

              {/* Comments List */}
              {alert.comments && alert.comments.length > 0 ? (
                <div className="space-y-4">
                  {alert.comments.map((c, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{c.user?.firstName || 'Unknown'}</p>
                        <p className="text-xs text-gray-600">{new Date(c.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="text-gray-700">{c.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No comments yet</p>
              )}
            </div>
          </div>

          {/* Triage Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Triage Actions</h3>

              <div className="space-y-2 mb-6">
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition text-sm"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleStatusChange('escalated')}
                  className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition text-sm"
                >
                  Escalate to L2
                </button>
              </div>

              <div className="border-t pt-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Assign To</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {assignees.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAssign(user.id)}
                      disabled={assigningTo === user.id}
                      className="w-full px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-sm border border-indigo-300 transition disabled:opacity-50"
                    >
                      {assigningTo === user.id ? 'Assigning...' : `${user.firstName} ${user.lastName}`}
                      <span className="text-xs block">{user.role.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Set Verdict</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleStatusChange('true_positive')}
                    className="w-full px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition text-sm border border-green-300"
                  >
                    True Positive
                  </button>
                  <button
                    onClick={() => handleStatusChange('false_positive')}
                    className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition text-sm border border-gray-300"
                  >
                    False Positive
                  </button>
                  <button
                    onClick={() => handleStatusChange('benign')}
                    className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition text-sm border border-blue-300"
                  >
                    Benign
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={() => handleStatusChange('closed')}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition text-sm"
                >
                  Close Alert
                </button>
              </div>

              {/* Triage Checklist */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Triage Checklist</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700">Is the alert a duplicate?</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700">Is the asset critical?</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700">Is the user behavior expected?</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700">Known maintenance activity?</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-700">Check IP/domain reputation</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
