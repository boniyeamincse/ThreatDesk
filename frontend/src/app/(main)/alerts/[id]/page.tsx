'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Activity, Clock, ShieldAlert, Network, Target, MessageSquare, ListTodo, AlertTriangle, FileJson, X } from 'lucide-react';

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

interface TimelineEvent {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

interface RelatedAlert {
  id: string;
  name: string;
  severity: string;
  status: string;
  alertTime: string;
  asset?: { id: string; hostname: string };
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
  const [actionError, setActionError] = useState('');

  // New Data States
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [rawEvent, setRawEvent] = useState<any | null>(null);
  const [relatedAlerts, setRelatedAlerts] = useState<RelatedAlert[]>([]);
  const [showRawEventModal, setShowRawEventModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchAllData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const headers = { Authorization: `Bearer ${token}` };

        const [alertRes, assigneesRes, timelineRes, rawEventRes, relatedRes] = await Promise.allSettled([
          axios.get(`${baseUrl}/api/alerts/${id}`, { headers }),
          axios.get(`${baseUrl}/api/alerts/users/assignees/list`, { headers }),
          axios.get(`${baseUrl}/api/alerts/${id}/timeline`, { headers }),
          axios.get(`${baseUrl}/api/alerts/${id}/raw-event`, { headers }),
          axios.get(`${baseUrl}/api/alerts/${id}/related-alerts`, { headers })
        ]);

        if (alertRes.status === 'fulfilled') setAlert(alertRes.value.data);
        else throw new Error('Failed to load alert');

        if (assigneesRes.status === 'fulfilled') setAssignees(assigneesRes.value.data);
        if (timelineRes.status === 'fulfilled') setTimeline(timelineRes.value.data);
        if (rawEventRes.status === 'fulfilled') setRawEvent(rawEventRes.value.data.rawEvent);
        if (relatedRes.status === 'fulfilled') setRelatedAlerts(relatedRes.value.data);

      } catch (err) {
        setError('Failed to load alert');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id, router]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    const token = localStorage.getItem('access_token');
    setSubmittingComment(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts/${id}/comments`,
        { content: comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setComment('');
      
      // Reload timeline and alert to reflect comment addition
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const [alertRes, timelineRes] = await Promise.all([
        axios.get(`${baseUrl}/api/alerts/${id}`, { headers }),
        axios.get(`${baseUrl}/api/alerts/${id}/timeline`, { headers })
      ]);
      setAlert(alertRes.data);
      setTimeline(timelineRes.data);
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const [alertRes, timelineRes] = await Promise.all([
        axios.get(`${baseUrl}/api/alerts/${id}`, { headers }),
        axios.get(`${baseUrl}/api/alerts/${id}/timeline`, { headers })
      ]);
      setAlert(alertRes.data);
      setTimeline(timelineRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerdictChange = async (newVerdict: string) => {
    const token = localStorage.getItem('access_token');
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/alerts/${id}/verdict`,
        { verdict: newVerdict },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const [alertRes, timelineRes] = await Promise.all([
        axios.get(`${baseUrl}/api/alerts/${id}`, { headers }),
        axios.get(`${baseUrl}/api/alerts/${id}/timeline`, { headers })
      ]);
      setAlert(alertRes.data);
      setTimeline(timelineRes.data);
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
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const [alertRes, timelineRes] = await Promise.all([
        axios.get(`${baseUrl}/api/alerts/${id}`, { headers }),
        axios.get(`${baseUrl}/api/alerts/${id}/timeline`, { headers })
      ]);
      setAlert(alertRes.data);
      setTimeline(timelineRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningTo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <p className="text-slate-400 animate-pulse text-lg">Loading alert details...</p>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <p className="text-red-400 text-lg font-bold">Alert not found</p>
          <a href="/alerts" className="text-cyan-400 mt-4 inline-block hover:underline">
            Back to Alerts
          </a>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getTimelineIcon = (action: string) => {
    switch(action) {
      case 'escalated': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'assigned': return <ShieldAlert className="w-4 h-4 text-cyan-400" />;
      case 'status_changed': return <Activity className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
              Alert Triage
            </h1>
            <p className="text-cyan-400 mt-1 ml-4 font-mono">{alert.alertCode}</p>
          </div>
          <div className="flex gap-4">
            {rawEvent && (
              <button
                onClick={() => setShowRawEventModal(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium transition flex items-center gap-2"
              >
                <FileJson className="w-4 h-4" />
                Raw Event
              </button>
            )}
            <a
              href="/alerts"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium transition"
            >
              Back to Alerts
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Alert Info (Col Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Alert Summary Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-800 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{alert.name}</h2>
                  <p className="text-slate-400 mt-1 font-mono text-sm">Rule ID: {alert.ruleId || 'N/A'}</p>
                </div>
                <span className={`px-4 py-2 rounded-lg font-semibold border ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>

              {/* Grid Data */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-4 h-4"/> Alert Time</p>
                  <p className="text-sm font-semibold text-white">{new Date(alert.alertTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-4 h-4"/> Event Time</p>
                  <p className="text-sm font-semibold text-white">{new Date(alert.eventTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><Activity className="w-4 h-4"/> Status</p>
                  <p className="text-sm font-semibold text-white capitalize">{alert.status.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><ShieldAlert className="w-4 h-4"/> Verdict</p>
                  <p className="text-sm font-semibold text-white capitalize">{alert.verdict.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><Target className="w-4 h-4"/> Source</p>
                  <p className="text-sm font-semibold text-white">{alert.source}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><Network className="w-4 h-4"/> Asset</p>
                  <p className="text-sm font-semibold text-white">{alert.asset?.hostname || 'N/A'}</p>
                </div>
              </div>

              {/* Network Info */}
              {(alert.sourceIp || alert.destinationIp) && (
                <div className="border-t border-slate-800/50 pt-4 mb-6">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                     Network Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {alert.sourceIp && (
                      <div>
                        <p className="text-sm text-slate-500">Source IP</p>
                        <p className="text-sm font-semibold text-cyan-400 font-mono">{alert.sourceIp}</p>
                      </div>
                    )}
                    {alert.destinationIp && (
                      <div>
                        <p className="text-sm text-slate-500">Destination IP</p>
                        <p className="text-sm font-semibold text-cyan-400 font-mono">{alert.destinationIp}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MITRE ATT&CK */}
              {(alert.mitreTactic || alert.mitreTechnique) && (
                <div className="border-t border-slate-800/50 pt-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    MITRE ATT&CK
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {alert.mitreTactic && (
                      <div>
                        <p className="text-sm text-slate-500">Tactic</p>
                        <p className="text-sm font-semibold text-slate-200">{alert.mitreTactic}</p>
                      </div>
                    )}
                    {alert.mitreTechnique && (
                      <div>
                        <p className="text-sm text-slate-500">Technique</p>
                        <p className="text-sm font-semibold text-slate-200">{alert.mitreTechnique}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Related Alerts */}
            {relatedAlerts.length > 0 && (
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Network className="w-5 h-5 text-cyan-500" />
                  Related Alerts (Same Asset)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold">Severity</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {relatedAlerts.map(related => (
                        <tr key={related.id} className="text-sm hover:bg-slate-800/30 transition">
                          <td className="py-3 text-slate-200">
                            <a href={`/alerts/${related.id}`} className="hover:text-cyan-400 transition">{related.name}</a>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(related.severity)}`}>
                              {related.severity.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400 capitalize">{related.status.replace(/_/g, ' ')}</td>
                          <td className="py-3 text-slate-500">{new Date(related.alertTime).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-500" />
                Comments & Investigation
              </h3>

              <div className="mb-6 pb-6 border-b border-slate-800">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add an investigation note or comment... (Mandatory for Triage Actions)"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-200 placeholder-slate-600 mb-3 transition"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !comment.trim()}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium shadow-[0_0_15px_rgba(6,182,212,0.4)] transition disabled:opacity-50 disabled:shadow-none"
                >
                  {submittingComment ? 'Adding...' : 'Add Comment'}
                </button>
              </div>

              {alert.comments && alert.comments.length > 0 ? (
                <div className="space-y-4">
                  {alert.comments.map((c, idx) => (
                    <div key={idx} className="bg-slate-950/50 border border-slate-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-200 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-cyan-900 text-cyan-400 flex items-center justify-center text-xs">
                            {c.user?.firstName?.charAt(0) || 'U'}
                          </span>
                          {c.user?.firstName || 'Unknown'} {c.user?.lastName || ''}
                        </p>
                        <p className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="text-slate-300 ml-8">{c.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">No comments yet</p>
              )}
            </div>

          </div>

          {/* Right Sidebar (Col Span 1) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Triage Actions */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-800 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-cyan-500" />
                Triage Actions
              </h3>

              {actionError && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-sm text-red-400 flex items-start gap-2 shadow-lg">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{actionError}</p>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Change Status</label>
                  <select
                    onChange={(e) => {
                      if (!alert?.comments || alert.comments.length === 0) {
                        setActionError('A comment is mandatory before updating the alert status.');
                        e.target.value = alert.status;
                        return;
                      }
                      setActionError('');
                      if (e.target.value !== alert.status) handleStatusChange(e.target.value);
                    }}
                    value={alert.status}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-200 text-sm transition"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="escalated">Escalated to L2</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Assign To</label>
                  <select
                    onChange={(e) => {
                      if (!alert?.comments || alert.comments.length === 0) {
                        setActionError('A comment is mandatory before assigning the alert.');
                        e.target.value = '';
                        return;
                      }
                      setActionError('');
                      if (e.target.value) handleAssign(e.target.value);
                    }}
                    value={alert.assignedTo && alert.assignedTo.length > 0 ? alert.assignedTo[0].userId : ''}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-200 text-sm transition"
                  >
                    <option value="" disabled>Select User...</option>
                    {assignees.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.role.name})
                      </option>
                    ))}
                  </select>
                  {assigningTo && <p className="text-xs text-cyan-500 mt-2 animate-pulse">Assigning...</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Set Verdict</label>
                  <select
                    onChange={(e) => {
                      if (!alert?.comments || alert.comments.length === 0) {
                        setActionError('A comment is mandatory before setting a verdict.');
                        e.target.value = alert.verdict || '';
                        return;
                      }
                      setActionError('');
                      if (e.target.value !== alert.verdict) handleVerdictChange(e.target.value);
                    }}
                    value={alert.verdict || ''}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-200 text-sm transition"
                  >
                    <option value="" disabled>Select Verdict...</option>
                    <option value="true_positive">True Positive</option>
                    <option value="false_positive">False Positive</option>
                    <option value="benign">Benign</option>
                    <option value="unclassified">Unclassified</option>
                  </select>
                </div>
              </div>

              {/* Triage Checklist */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="font-semibold text-slate-300 mb-3 text-sm flex items-center gap-2">
                  <ListTodo className="w-4 h-4" /> Triage Checklist
                </h4>
                <div className="space-y-3 text-sm">
                  {[
                    "Is the alert a duplicate?",
                    "Is the asset critical?",
                    "Is the user behavior expected?",
                    "Known maintenance activity?",
                    "Check IP/domain reputation"
                  ].map((task, i) => (
                    <label key={i} className="flex items-center group cursor-pointer">
                      <input type="checkbox" className="mr-3 w-4 h-4 rounded border-slate-600 text-cyan-600 focus:ring-cyan-500 bg-slate-900 cursor-pointer" />
                      <span className="text-slate-400 group-hover:text-slate-200 transition">{task}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-800 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-500" />
                Activity Timeline
              </h3>
              
              {timeline.length > 0 ? (
                <div className="relative border-l border-slate-800 ml-3 space-y-6">
                  {timeline.map((event, idx) => (
                    <div key={event.id || idx} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 bg-slate-950 border border-slate-700 rounded-full p-0.5">
                        {getTimelineIcon(event.action)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200 capitalize">{event.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-400 mt-1">{event.details}</p>
                        <p className="text-xs text-slate-500 mt-2 font-mono">{new Date(event.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">No activity recorded yet.</p>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Raw Event Modal */}
      {showRawEventModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileJson className="w-5 h-5 text-cyan-500" />
                Raw Event Data
              </h2>
              <button
                onClick={() => setShowRawEventModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto bg-[#0d1117]">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(rawEvent, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
               <button
                  onClick={() => setShowRawEventModal(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition">
                  Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
