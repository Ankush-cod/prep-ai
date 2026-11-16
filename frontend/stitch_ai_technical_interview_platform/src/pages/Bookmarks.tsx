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
    if (cat === 'Coding Practice') return <Code2 className="w-4 h-4 text-[#5145E5]" />;
    if (cat === 'Company Questions') return <Building2 className="w-4 h-4 text-cyan-600" />;
    return <FolderGit2 className="w-4 h-4 text-emerald-600" />;
  };

  const getTargetLink = (item: typeof bookmarks[0]) => {
    if (item.category === 'Coding Practice') return '/coding-practice';
    if (item.category === 'Company Questions') return '/company-questions';
    return '/resources';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Section */}
      <section className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-[#77788B] uppercase tracking-wider">
              <Bookmark className="w-4 h-4 text-[#5145E5]" />
              <span className="text-[#5145E5] font-semibold">Saved Library &amp; Archives</span>
              <span>•</span>
              <span>Quick Revision Bookmarks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17182B]">
              Saved Bookmarks &amp; Study Playlists
            </h1>
            <p className="text-sm text-[#77788B] max-w-3xl leading-relaxed">
              Manage saved coding problems, high-frequency company interview questions, and textbook lecture compendiums.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-[#EEF2FF] text-[#5145E5] font-mono text-xs font-bold border border-[#E0E7FF]">
              {bookmarks.length} Total Saved
            </span>
            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-[#F7F7FC] hover:bg-[#EAEAF4] text-[#17182B] border border-[#E2E4EB] transition-colors disabled:opacity-50 cursor-pointer"
              title="Sync Bookmarks"
            >
              <RefreshCw className={`w-4 h-4 text-[#5145E5] ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#F7F7FC] rounded-xl border border-[#E2E4EB] focus-within:border-[#5145E5] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-[#77788B]" />
            <input
              type="text"
              placeholder="Search bookmarks by title or tag keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-[#17182B] placeholder-[#77788B] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#77788B] hover:text-[#17182B] font-medium"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[#77788B] text-[11px] font-semibold uppercase tracking-wider mr-1">
                Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#5145E5] text-white font-bold shadow-2xs'
                      : 'text-[#77788B] hover:text-[#17182B] bg-[#F7F7FC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Batch actions */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3 animate-in fade-in">
                <span className="text-xs font-mono font-semibold text-[#5145E5]">
                  {selectedIds.length} Selected
                </span>
                <button
                  onClick={handleBatchRemove}
                  className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Selected</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Bookmarked Items List */}
      <section className="space-y-3">
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 px-2 text-xs text-[#77788B] font-medium">
            <input
              type="checkbox"
              checked={selectedIds.length === filtered.length && filtered.length > 0}
              onChange={handleSelectAll}
              className="rounded border-[#E2E4EB] text-[#5145E5] focus:ring-[#5145E5] cursor-pointer"
            />
            <span>Select all ({filtered.length})</span>
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#E2E4EB] space-y-3 shadow-sm">
            <Bookmark className="w-8 h-8 text-[#5145E5] mx-auto" />
            <h3 className="text-base font-bold text-[#17182B]">No Bookmarks Found in this View</h3>
            <p className="text-xs text-[#77788B] max-w-md mx-auto">
              Save high-impact coding problems, company questions, or textbook notes while studying to access them here.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                  isSelected
                    ? 'bg-[#EEF2FF]/50 border-[#5145E5]'
                    : 'bg-white border-[#E2E4EB] hover:border-[#5145E5]/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(item.id)}
                    className="mt-1 rounded border-[#E2E4EB] text-[#5145E5] focus:ring-[#5145E5] cursor-pointer"
                  />

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F7F7FC] border border-[#E2E4EB] text-xs font-mono font-medium">
                        {getCategoryIcon(item.category)}
                        <span className="text-[#17182B] text-[11px]">{item.category}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#5145E5] font-mono text-[10px] font-bold">
                        {item.branch}
                      </span>
                      {item.difficulty && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[10px] font-bold">
                          {item.difficulty}
                        </span>
                      )}
                      {item.targetCompany && (
                        <span className="text-xs text-[#5145E5] font-mono font-semibold">
                          • {item.targetCompany}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[#17182B] tracking-tight">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#77788B] font-mono">
                      <span>Saved: {item.savedDate}</span>
                      <span>•</span>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((t) => (
                          <span key={t} className="px-1.5 py-0.2 rounded bg-[#F7F7FC] text-[#77788B] border border-[#E2E4EB]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <NavLink
                    to={getTargetLink(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </NavLink>
                  <button
                    onClick={() => removeBookmark(item.id)}
                    className="p-2 rounded-xl bg-[#F7F7FC] hover:bg-rose-50 text-[#77788B] hover:text-rose-600 border border-[#E2E4EB] transition-colors cursor-pointer"
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
