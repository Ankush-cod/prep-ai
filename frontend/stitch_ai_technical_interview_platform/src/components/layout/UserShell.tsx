// src/components/layout/UserShell.tsx
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Code2,
  Building2,
  FolderGit2,
  FileSearch,
  Bookmark,
  History,
  LineChart,
  Settings,
  LogOut,
  Zap,
  Search,
  Flame,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { QuickFindModal } from '../common/QuickFindModal';
import { Toast } from '../common/Toast';

interface UserShellProps {
  children: React.ReactNode;
}

export const UserShell: React.FC<UserShellProps> = ({ children }) => {
  const { profile, setQuickFindOpen } = useApp();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/mock-interviews', label: 'AI Mock Interviews', icon: Bot },
    { to: '/coding-practice', label: 'Coding Practice', icon: Code2 },
    { to: '/company-questions', label: 'Company Questions', icon: Building2 },
    { to: '/resources', label: 'Preparation Resources', icon: FolderGit2 },
    { to: '/resume-analyzer', label: 'Resume Analyzer', icon: FileSearch },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { to: '/interview-history', label: 'Interview History', icon: History },
    { to: '/analytics', label: 'Analytics', icon: LineChart },
  ];

  const currentModuleTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Engineering Dashboard';
    if (path.startsWith('/mock-interviews')) return 'AI Mock Interviews';
    if (path.startsWith('/coding-practice')) return 'Coding Practice Workspace';
    if (path.startsWith('/company-questions')) return 'Company Questions & Rubrics';
    if (path.startsWith('/resources')) return 'Preparation Resources Library';
    if (path.startsWith('/resume-analyzer')) return 'Resume Analyzer OCR';
    if (path.startsWith('/bookmarks')) return 'Bookmarks & Playlists';
    if (path.startsWith('/interview-history')) return 'Interview History';
    if (path.startsWith('/analytics')) return 'Performance Analytics';
    if (path.startsWith('/profile')) return 'Candidate Profile & Dossier';
    if (path.startsWith('/settings')) return 'Settings & Preferences';
    return 'Workspace';
  };

  return (
    <div className="flex h-screen w-full bg-[#F7F7FC] text-[#17182B] overflow-hidden font-sans">
      <QuickFindModal />
      <Toast />

      {/* MOBILE BACKDROP */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* PERSISTENT LEFT SIDEBAR */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E2E4EB] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#E2E4EB]">
            <NavLink
              to="/"
              className="flex items-center gap-2.5 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-xl bg-[#5145E5] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 text-white fill-current" />
              </div>
              <span className="font-bold tracking-tight text-[#17182B] text-lg">
                Prep<span className="text-[#5145E5]">AI</span>
              </span>
            </NavLink>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                v2.4 LIVE
              </span>
              <button
                className="lg:hidden p-1 text-[#77788B] hover:text-[#17182B]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Module Nav Links */}
          <div className="px-3 py-4 overflow-y-auto max-h-[calc(100vh-180px)]">
            <p className="px-3 text-[10px] font-bold tracking-wider text-[#77788B] uppercase mb-2">
              Platform Modules
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#EEF0FF] text-[#5145E5] font-semibold border-l-[3px] border-[#5145E5] shadow-xs'
                        : 'text-[#77788B] hover:text-[#17182B] hover:bg-[#F4F5FB]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#5145E5]' : 'text-[#77788B]'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer User Block */}
        <div className="p-3 border-t border-[#E2E4EB] space-y-1 bg-white">
          <NavLink
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F4F5FB] transition-all text-left w-full group"
          >
            <div className="w-8 h-8 rounded-full bg-[#EEF0FF] text-[#5145E5] font-bold text-xs flex items-center justify-center border border-[#D6D9FB]">
              {profile.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#17182B] truncate group-hover:text-[#5145E5]">
                {profile.fullName}
              </p>
              <p className="text-[11px] text-[#77788B] truncate">
                B.Tech {profile.branch} '{profile.graduationYear.toString().slice(-2)}
              </p>
            </div>
          </NavLink>
          <div className="flex items-center justify-between pt-1 px-1">
            <NavLink
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-[#77788B] hover:text-[#17182B] flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-[#F4F5FB]"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-[#77788B] hover:text-red-500 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP TELEMETRY BAR */}
        <header className="h-16 flex-shrink-0 bg-white/95 backdrop-blur border-b border-[#E2E4EB] flex items-center justify-between px-4 lg:px-6 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#77788B] hover:text-[#17182B] rounded-lg hover:bg-[#F4F5FB]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Pill Badges Inspired by Stitch & Reference Screenshot */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EEF0FF] text-[#5145E5] border border-[#D6D9FB]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5145E5]" />
                <span>{profile.branch === 'CSE' ? 'Software Eng.' : profile.branch + ' Eng.'}</span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                v2.4 Live
              </span>
              <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono text-[#5145E5] bg-[#F1F3FB] border border-[#E2E4EB]">
                MODE: Adaptive Verbal & Coding • 4 Disciplines Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Find Trigger */}
            <button
              onClick={() => setQuickFindOpen(true)}
              className="flex items-center gap-2 bg-[#F4F5FB] hover:bg-[#EEF0FF] border border-[#E2E4EB] rounded-xl px-3 py-1.5 text-xs text-[#77788B] transition-all cursor-pointer"
              title="Quick Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-[#77788B]" />
              <span className="hidden sm:inline text-[#77788B]">Quick Find</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] text-[#77788B] font-mono border border-[#E2E4EB] shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span className="hidden sm:inline">{profile.streakDays}-Day</span>
              <span>Streak</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setQuickFindOpen(true)}
              className="p-2 rounded-xl text-[#77788B] hover:text-[#17182B] hover:bg-[#F4F5FB] relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#5145E5] absolute top-2 right-2 animate-pulse"></span>
            </button>

            {/* User Avatar */}
            <NavLink to="/profile" title="Candidate Profile">
              <div className="w-8 h-8 rounded-full bg-[#EEF0FF] border border-[#D6D9FB] flex items-center justify-center text-[#5145E5] text-xs font-bold hover:scale-105 transition-transform shadow-xs">
                {profile.initials}
              </div>
            </NavLink>
          </div>
        </header>

        {/* SCROLLABLE VIEWPORT CONTENT WITH SUBTLE DOTTED GRID */}
        <main className="flex-1 overflow-y-auto bg-[#F7F7FC] dotted-grid">
          {children}
        </main>
      </div>
    </div>
  );
};
