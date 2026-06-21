'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShieldAlert, Ticket, Network, Settings, LogOut } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Alerts', href: '/alerts', icon: ShieldAlert },
  { name: 'Tickets', href: '/tickets', icon: Ticket },
  { name: 'Integrations', href: '/integrations', icon: Network },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-950 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wider text-white">
          THREAT<span className="text-neon-cyan">DESK</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-neon-cyan'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-red-400" aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
