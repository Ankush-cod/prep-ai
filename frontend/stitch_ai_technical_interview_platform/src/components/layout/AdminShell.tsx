// src/components/layout/AdminShell.tsx
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderArchive,
  HelpCircle,
  Inbox,
  ShieldCheck,
  LineChart,
  Settings,
  Terminal,
  LogOut,
  Bell,
  Search,
  CheckCircle2,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { Toast } from '../common/Toast';
import { QuickFindModal } from '../common/QuickFindModal';
import { useAuth } from '../../context/AuthContext';

interface AdminShellProps {
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminNav = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/resources', label: 'Resource Management', icon: FolderArchive },
    { to: '/admin/question-bank', label: 'Question Bank', icon: HelpCircle },
    { to: '/admin/requests', label: 'Resource Requests', icon: Inbox },
    { to: '/admin/ai-review', label: 'AI Review & Flags', icon: ShieldCheck },
    { to: '/admin/analytics', label: 'Platform Analytics', icon: LineChart },
    { to: '/admin/settings', label: 'Ops Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-[#191B22] text-gray-200 overflow-hidden font-sans">
      <QuickFindModal />
      <Toast />

      {/* MOBILE BACKDROP */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ADMIN PERSISTENT SIDEBAR */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#1E2028] border-r border-[#353946] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#353946]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Terminal className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-white text-base">PrepAI</span>
                <span className="block text-[9px] text-purple-400 font-mono tracking-wider">ADMIN CONSOLE</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
              <button
                className="lg:hidden p-1 text-gray-400 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 py-4 overflow-y-auto max-h-[calc(100vh-220px)]">
            <p className="px-3 text-[10px] font-semibold tracking-wider text-gray-500 uppercase mb-2">
              PLATFORM OPS
            </p>
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to));
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Telemetry pulse footer */}
        <div className="p-4 border-t border-[#353946] space-y-2 bg-[#1E2028]">
          <div className="flex justify-between items-center text-[11px] text-gray-400 font-mono">
            <span>TELEMETRY PULSE</span>
            <span className="text-emerald-400 font-semibold">99.98%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[99.98%]"></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>12ms RTT</span>
            <span>us-east-1</span>
          </div>
          <NavLink
            to="/dashboard"
            className="flex items-center justify-center gap-1.5 w-full py-1.5 mt-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-medium transition-all"
          >
            <span>Exit to User View</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs text-red-400 font-medium transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP ADMIN HEADER */}
        <header className="h-16 flex-shrink-0 bg-[#1E2028]/90 backdrop-blur border-b border-[#353946] flex items-center justify-between px-4 lg:px-6 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">PrepAI Admin Console</span>
              <span className="hidden sm:inline-flex text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded uppercase">
                ADMIN / PRODUCTION MODERATION
              </span>
              <span className="hidden xl:inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Node cluster: 8/8 Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/dashboard"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-medium transition-all"
            >
              <span>Student Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </NavLink>
            <div className="flex items-center gap-2 pl-2 border-l border-[#353946]">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white leading-tight">
                  {user?.fullName || 'Administrator'}
                </span>
                <span className="text-[10px] text-purple-400 font-mono leading-tight">
                  {user?.email || 'ADMIN'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                {(user?.fullName || 'AD').slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE VIEWPORT CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#191B22]">
          {children}
        </main>
      </div>
    </div>
  );
};
