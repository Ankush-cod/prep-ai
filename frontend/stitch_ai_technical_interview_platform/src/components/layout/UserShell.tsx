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

      {/* PERSISTENT LEFT SIDEBAR */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#1E2028] border-r border-[#353946] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#353946]">
            <NavLink
              to="/"
              className="flex items-center gap-2.5 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:border-purple-400 transition-all">
                <Zap className="w-4 h-4 text-purple-400 fill-current" />
              </div>
              <span className="font-bold tracking-tight text-white text-lg">
                Prep<span className="text-purple-400">AI</span>
              </span>
            </NavLink>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase bg-white/5 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                v2.4 LIVE
              </span>
              <button
                className="lg:hidden p-1 text-gray-400 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Module Nav Links */}
          <div className="px-3 py-4 overflow-y-auto max-h-[calc(100vh-180px)]">
            <p className="px-3 text-[10px] font-semibold tracking-wider text-gray-500 uppercase mb-2">
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
                        ? 'bg-purple-600/15 text-purple-300 border-l-2 border-purple-500 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer User Block */}
        <div className="p-3 border-t border-[#353946] space-y-1 bg-[#1E2028]">
          <NavLink
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all text-left w-full group"
          >
            <div className="w-8 h-8 rounded-full bg-purple-700/30 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/40">
              {profile.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate group-hover:text-purple-300">
                {profile.fullName}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                B.Tech {profile.branch} '{profile.graduationYear.toString().slice(-2)}
              </p>
            </div>
          </NavLink>
          <div className="flex items-center justify-between pt-1 px-1">
            <NavLink
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-white/5"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-white/5 cursor-pointer"
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
        <header className="h-16 flex-shrink-0 bg-[#1E2028]/90 backdrop-blur border-b border-[#353946] flex items-center justify-between px-4 lg:px-6 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs truncate">
              <span className="text-gray-400 hidden sm:inline">Workspace</span>
              <span className="text-gray-600 hidden sm:inline">/</span>
              <span className="text-white font-medium truncate">
                {currentModuleTitle()}
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                • {profile.branch} Track • {profile.semester}th Sem
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Find Trigger */}
            <button
              onClick={() => setQuickFindOpen(true)}
              className="flex items-center gap-2 bg-[#242731] hover:bg-[#25262e] border border-[#353946] rounded-xl px-3 py-1.5 text-xs text-gray-400 transition-all cursor-pointer shadow-inner"
              title="Quick Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline text-gray-400">Quick Find</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 font-mono border border-[#353946]">
                ⌘K
              </kbd>
            </button>

            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span className="hidden sm:inline">{profile.streakDays}-Day</span>
              <span>Streak</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setQuickFindOpen(true)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 absolute top-2 right-2 animate-pulse"></span>
            </button>

            {/* User Avatar */}
            <NavLink to="/profile" title="Candidate Profile">
              <div className="w-8 h-8 rounded-full bg-purple-700/40 border border-purple-400/40 flex items-center justify-center text-purple-300 text-xs font-semibold hover:border-purple-300 transition-all">
                {profile.initials}
              </div>
            </NavLink>
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
