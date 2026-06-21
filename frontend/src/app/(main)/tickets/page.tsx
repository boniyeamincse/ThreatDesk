'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Ticket {
  id: string;
  ticketCode: string;
  title: string;
  severity: string;
  status: string;
  assignedTeam?: string;
  createdAt: string;
}

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tickets`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTickets(response.data.tickets);
      } catch (err) {
        setError('Failed to load tickets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [router]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
      case 'low':
        return 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
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
              Tickets
            </h1>
            <p className="text-slate-400 mt-2 text-sm ml-4">Track incidents and tickets</p>
          </div>
        </div>
        {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg shadow-lg flex items-center"><span className="mr-2">⚠</span> {error}</div>}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400 animate-pulse">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl p-8 text-center">
            <p className="text-slate-400 text-lg">No tickets found</p>
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Code</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Team</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-800/50 transition duration-150">
                    <td className="px-6 py-4 text-sm font-medium text-cyan-400">{ticket.ticketCode}</td>
                    <td className="px-6 py-4 text-sm text-slate-200">{ticket.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(ticket.severity)}`}>
                        {ticket.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-semibold">{ticket.status.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{ticket.assignedTeam || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
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
