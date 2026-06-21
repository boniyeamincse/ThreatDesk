'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ShieldAlert, Lock, User, TerminalSquare, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/login`,
        {
          email,
          password,
        },
      );

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Unauthorized access detected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 relative overflow-hidden font-sans text-slate-300">
      
      {/* Background Grid Pattern & Glow */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-neon-cyan/20 blur-[120px] rounded-full z-0 pointer-events-none"></div>

      <div className="w-full max-w-md z-10 px-4">
        
        {/* Glassmorphic Container */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 relative overflow-hidden animate-glow">
          
          {/* Top glowing edge */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-70"></div>

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <ShieldAlert className="w-8 h-8 text-neon-cyan animate-pulse-slow" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold tracking-wider text-white">
              THREAT<span className="text-neon-cyan">DESK</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2 font-mono tracking-widest uppercase">
              Secure Operations Center
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm animate-pulse">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Operator ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-cyan transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Access Code
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-cyan transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-lg p-[1px] group disabled:opacity-50 mt-4"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-indigo opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
              <div className="relative w-full bg-slate-900 px-4 py-3 rounded-[7px] flex items-center justify-center gap-2 group-hover:bg-slate-800 transition-colors duration-300">
                <span className="font-semibold text-white tracking-wide uppercase text-sm">
                  {loading ? 'Authenticating...' : 'Initialize Session'}
                </span>
              </div>
            </button>
          </form>

          {/* Terminal-style Demo Credentials */}
          <div className="mt-8 border border-slate-700/50 bg-slate-950/80 rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800 text-slate-500">
              <TerminalSquare className="w-4 h-4" />
              <span>system_override.sh</span>
            </div>
            <div className="space-y-1">
              <p><span className="text-neon-emerald">~</span> <span className="text-slate-400">auth level 5 required</span></p>
              <p><span className="text-neon-emerald">~</span> <span className="text-slate-400">demo_id:</span> <span className="text-neon-cyan">admin@example.com</span></p>
              <p><span className="text-neon-emerald">~</span> <span className="text-slate-400">passkey:</span> <span className="text-neon-cyan">admin123</span></p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
