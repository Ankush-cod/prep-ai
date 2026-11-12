// src/components/common/QuickFindModal.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Bot,
  Code2,
  Building2,
  FolderGit2,
  FileSearch,
  Bookmark,
  History,
  LineChart,
  User,
  Settings,
  Shield,
  X,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickFindModal: React.FC = () => {
  const { quickFindOpen, setQuickFindOpen } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickFindOpen(!quickFindOpen);
      }
      if (e.key === 'Escape' && quickFindOpen) {
        setQuickFindOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickFindOpen, setQuickFindOpen]);

  if (!quickFindOpen) return null;

  const quickNav = [
    { label: 'Engineering Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Core Modules' },
    { label: 'AI Mock Interview Setup', path: '/mock-interviews', icon: Bot, category: 'Simulations' },
    { label: 'Live AI Interview Room', path: '/mock-interviews/live', icon: Bot, category: 'Simulations' },
    { label: 'Coding Practice Workspace', path: '/coding-practice', icon: Code2, category: 'Drills' },
    { label: 'Company Questions & Rubrics', path: '/company-questions', icon: Building2, category: 'Curated' },
    { label: 'Preparation Resources Library', path: '/resources', icon: FolderGit2, category: 'Curated' },
    { label: 'Resume Analyzer OCR', path: '/resume-analyzer', icon: FileSearch, category: 'AI Tools' },
    { label: 'Saved Bookmarks', path: '/bookmarks', icon: Bookmark, category: 'Saved' },
    { label: 'Interview History & Dossiers', path: '/interview-history', icon: History, category: 'Telemetry' },
    { label: 'Performance Analytics', path: '/analytics', icon: LineChart, category: 'Telemetry' },
    { label: 'Candidate Profile', path: '/profile', icon: User, category: 'Account' },
    { label: 'Settings & Preferences', path: '/settings', icon: Settings, category: 'Account' },
    { label: 'Admin Ops Console', path: '/admin', icon: Shield, category: 'Operations' },
  ];

  const filtered = quickNav.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    setQuickFindOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-[#20232C] border border-[#353946] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#353946] bg-[#242731]">
          <Search className="w-5 h-5 text-purple-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, search modules, or jump to view..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-500 hover:text-gray-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-white/5 border border-[#353946] text-[10px] text-gray-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No matching modules or actions found for "{query}".
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-left group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-200 group-hover:text-white">
                        {item.label}
                      </span>
                      <span className="block text-[10px] text-gray-500">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#191B22] border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span>Navigation Shortcuts</span>
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={() => setQuickFindOpen(false)}></div>
    </div>
  );
};
