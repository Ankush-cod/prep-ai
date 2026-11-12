// src/pages/Bookmarks.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bookmark,
  Search,
  Trash2,
  ExternalLink,
  Code2,
  Building2,
  FolderGit2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Bookmarks: React.FC = () => {
  const { bookmarks, removeBookmark, refreshBookmarks, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const categories = ['All', 'Coding Practice', 'Company Questions', 'Preparation Resources'];

  const filtered = bookmarks.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchRemove = async () => {
    const count = selectedIds.length;
    if (count === 0) return;
    setIsSyncing(true);
    try {
      await Promise.all(selectedIds.map((id) => removeBookmark(id)));
      setSelectedIds([]);
      showToast(`Removed ${count} item${count === 1 ? '' : 's'} from Bookmarks`);
    } catch {
      showToast('Some bookmarks could not be removed', 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    await refreshBookmarks();
    setIsSyncing(false);
  };

  const getCategoryIcon = (cat: string) => {
    if (cat === 'Coding Practice') return <Code2 className="w-4 h-4 text-purple-400" />;
    if (cat === 'Company Questions') return <Building2 className="w-4 h-4 text-cyan-400" />;
    return <FolderGit2 className="w-4 h-4 text-emerald-400" />;
  };

  const getTargetLink = (item: typeof bookmarks[0]) => {
    if (item.category === 'Coding Practice') return '/coding-practice';
    if (item.category === 'Company Questions') return '/company-questions';
    return '/resources';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-widest">
              <Bookmark className="w-4 h-4 text-purple-400" />
              <span>Repository Node // 07 • Saved Playlists & Archives</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Bookmarks & Playlists
            </h1>
            <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
              Manage saved coding problems, high-frequency company interview questions, and textbook lecture compendiums.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 font-mono text-xs border border-purple-500/20">
              {bookmarks.length} Total Saved
            </span>
            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-[#353946] transition-colors disabled:opacity-50"
              title="Sync Bookmarks"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="p-4 bg-[#242731] border border-[#353946] rounded-2xl shadow-md space-y-3">
          <div className="flex items-center gap-3 px-3.5 py-2 bg-[#20232C] rounded-xl border border-[#353946] focus-within:border-purple-500 transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks by title or tag keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-gray-500 text-[11px] font-mono uppercase">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    selectedCategory === cat
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                      : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Batch actions */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 animate-in fade-in">
                <span className="text-xs font-mono text-purple-300">
                  {selectedIds.length} Selected
                </span>
                <button
                  onClick={handleBatchRemove}
                  className="px-3 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-1 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Selected</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bookmarked Items Table / List */}
      <section className="space-y-3">
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 px-2 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={selectedIds.length === filtered.length && filtered.length > 0}
              onChange={handleSelectAll}
              className="rounded bg-[#20232C] border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
            />
            <span>Select all ({filtered.length})</span>
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#242731] border border-[#353946] space-y-3">
            <Bookmark className="w-8 h-8 text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Bookmarks in this view</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Save high-impact coding problems, company questions, or compendiums while studying to access them here.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-purple-950/20 border-purple-500/40 shadow-sm'
                    : 'bg-[#242731] border-[#353946] hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(item.id)}
                    className="mt-1 rounded bg-[#20232C] border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
                  />

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-[#353946] text-xs font-mono">
                        {getCategoryIcon(item.category)}
                        <span className="text-gray-300 text-[11px]">{item.category}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-[10px] font-semibold">
                        {item.branch}
                      </span>
                      {item.difficulty && (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-mono text-[10px]">
                          {item.difficulty}
                        </span>
                      )}
                      {item.targetCompany && (
                        <span className="text-xs text-cyan-400 font-mono font-medium">
                          • {item.targetCompany}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-400 font-mono">
                      <span>Saved: {item.savedDate}</span>
                      <span>•</span>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((t) => (
                          <span key={t} className="px-1.5 py-0.2 rounded bg-[#20232C] text-gray-400 border border-white/5">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <NavLink
                    to={getTargetLink(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </NavLink>
                  <button
                    onClick={() => removeBookmark(item.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remove from Bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
