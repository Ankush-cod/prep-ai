// src/pages/PreparationResources.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Bookmark,
  Download,
  CheckCircle2,
  PlusCircle,
  X,
  Send,
  ThumbsUp,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';
import { BackendResource, resourceService } from '../services/resourceService';
import { Branch } from '../types/prepai';

const BRANCH_TRACKS: { code: Branch; name: string; desc: string }[] = [
  { code: 'CSE', name: 'Computer Science (CSE)', desc: 'Core Software & Systems' },
  { code: 'ECE', name: 'Electronics & Comm (ECE)', desc: 'Digital VLSI & Architecture' },
  { code: 'EE', name: 'Electrical Eng (EE)', desc: 'Power Systems & Drives' },
  { code: 'ME', name: 'Mechanical Eng (ME)', desc: 'Thermal & Machine Design' },
];

type FormatShortcut =
  | 'All Formats'
  | 'PDFs Only'
  | 'GATE PYQs'
  | 'Compendiums'
  | 'Notes'
  | 'Cheatsheets';

const FORMAT_SHORTCUTS: FormatShortcut[] = [
  'All Formats',
  'PDFs Only',
  'GATE PYQs',
  'Compendiums',
  'Notes',
  'Cheatsheets',
];

export const PreparationResources: React.FC = () => {
  const { profile, toggleBookmark, isBookmarked, showToast } = useApp();

  const [resources, setResources] = useState<BackendResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch>(profile.branch || 'CSE');
  const [selectedFormat, setSelectedFormat] = useState<FormatShortcut>('All Formats');
  const [selectedSemester, setSelectedSemester] = useState<number | 'All'>('All');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewResource, setPreviewResource] = useState<BackendResource | null>(null);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqBranch, setReqBranch] = useState<Branch>(profile.branch || 'CSE');
  const [reqSubject, setReqSubject] = useState('');
  const [reqTopic, setReqTopic] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  const loadResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formatParam =
        selectedFormat === 'PDFs Only'
          ? 'PDF'
          : selectedFormat === 'Compendiums'
          ? 'COMPENDIUM'
          : selectedFormat === 'Notes'
          ? 'NOTES'
          : selectedFormat === 'Cheatsheets'
          ? 'CHEATSHEET'
          : undefined;

      const list = await resourceService.listResources({
        branch: selectedBranch,
        semester: selectedSemester,
        format: formatParam,
        isGatePyq: selectedFormat === 'GATE PYQs' ? true : undefined,
        search: searchQuery.trim() || undefined,
      });
      setResources(list);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load preparation resources.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranch, selectedSemester, selectedFormat, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadResources();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadResources]);

  const handleUpvote = async (res: BackendResource) => {
    try {
      const updated = await resourceService.upvoteResource(res.id);
      setResources((prev) =>
        prev.map((item) =>
          item.id === res.id ? { ...item, upvotes: updated.upvotes } : item
        )
      );
      showToast('Upvoted resource');
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to upvote resource',
        'warning'
      );
    }
  };

  const handleDownload = async (res: BackendResource) => {
    try {
      const updated = await resourceService.trackDownload(res.id);
      setResources((prev) =>
        prev.map((item) =>
          item.id === res.id ? { ...item, downloads: updated.downloads } : item
        )
      );
    } catch {
      // Download still proceeds if external URL/body exists
    }

    if (res.contentUrl) {
      window.open(res.contentUrl, '_blank', 'noopener,noreferrer');
      showToast(`Opened ${res.title}`);
      return;
    }

    if (res.contentBody) {
      const blob = new Blob([`${res.title}\n\n${res.contentBody}`], {
        type: 'text/plain;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${res.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast(`Downloaded notes for ${res.title}`);
      return;
    }

    setPreviewResource(res);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqSubject.trim()) {
      showToast('Please enter both a resource title and subject area.', 'warning');
      return;
    }

    setIsSubmittingReq(true);
    try {
      await resourceService.submitResourceRequest({
        branch: reqBranch,
        title: reqTitle.trim(),
        subject: reqSubject.trim(),
        topic: reqTopic.trim() || undefined,
        notes: reqNotes.trim() || undefined,
      });
      setRequestModalOpen(false);
      showToast('Resource request saved and queued for admin review');
      setReqTitle('');
      setReqSubject('');
      setReqTopic('');
      setReqNotes('');
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to submit resource request',
        'warning'
      );
    } finally {
      setIsSubmittingReq(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. PAGE HEADER & TELEMETRY ROW */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-gray-500 uppercase tracking-wider">
              <span className="text-purple-400 font-semibold">Curriculum Repository</span>
              <span>•</span>
              <span className="text-gray-300">Branch & Semester Study Material</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Preparation Resources Library
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              Curated, syllabus-calibrated courseware, branch GATE PYQ sets, and systems lecture compendiums for CSE, ECE, EE, and ME.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Branch: {selectedBranch}
            </span>
            <button
              onClick={() => setRequestModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-[0_0_16px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Request Resource</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Filter Shortcuts */}
        <div className="p-3 bg-[#242731] border border-[#353946] rounded-2xl shadow-md space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-[#20232C] rounded-xl border border-[#353946] focus-within:border-purple-500 transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search subjects, textbook titles, GATE PYQs, or author..."
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

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-gray-500 text-[11px] font-mono uppercase">
                Format:
              </span>
              {FORMAT_SHORTCUTS.map((sc) => (
                <button
                  key={sc}
                  onClick={() => setSelectedFormat(sc)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                    selectedFormat === sc
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                      : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-gray-500 text-[11px] font-mono uppercase">
                Semester:
              </span>
              {(['All', 1, 2, 3, 4, 5, 6, 7, 8] as const).map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                    selectedSemester === sem
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {sem === 'All' ? 'All' : `S${sem}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRANCH SELECTION STRIP */}
      <section className="space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 block">
          Select Department Track (includes branch GATE PYQ archives)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BRANCH_TRACKS.map((b) => {
            const isSelected = selectedBranch === b.code;
            return (
              <button
                key={b.code}
                onClick={() => setSelectedBranch(b.code)}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-purple-600/15 border-purple-500 text-white shadow-md'
                    : 'bg-[#242731] border-white/5 hover:border-[#353946] text-gray-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-white block">{b.name}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    {b.desc}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-[10px] font-semibold border border-purple-500/20">
                  {b.code}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. RESOURCE CARDS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            {isLoading
              ? 'Loading engineering resources...'
              : `Showing ${resources.length} resource${
                  resources.length === 1 ? '' : 's'
                } for ${selectedBranch}`}
          </span>
        </div>

        {error ? (
          <div className="bg-[#242731] border border-red-500/30 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to load resources</span>
            </div>
            <p className="text-xs text-gray-400">{error}</p>
            <button
              onClick={loadResources}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-44 bg-[#242731] border border-[#353946] rounded-2xl"
              />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-white">
              No resources match these filters
            </p>
            <p className="text-xs text-gray-400">
              Try selecting another semester or format, or submit a request for new courseware.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res) => {
              const bookmarked = isBookmarked(res.id);

              return (
                <div
                  key={res.id}
                  className="bg-[#242731] border border-[#353946] rounded-2xl p-5 shadow-md flex flex-col justify-between hover:border-white/20 transition-all space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-mono text-[10px] font-semibold">
                          {res.branch.code} • Sem {res.semester.number}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[10px]">
                          {res.format}
                        </span>
                        {res.isGatePyq && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[10px]">
                            GATE PYQ
                          </span>
                        )}
                        {res.isVerified && (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          void toggleBookmark({
                            id: res.id,
                            title: res.title,
                            category: 'Preparation Resources',
                            branch: res.branch.code,
                            tags: [res.subject, res.format],
                            type: 'compendium',
                            targetType: 'PREPARATION_RESOURCE',
                          })
                        }
                        className={`p-1.5 rounded-lg border transition-all ${
                          bookmarked
                            ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                            : 'bg-white/5 text-gray-400 hover:text-white border-[#353946]'
                        }`}
                        title="Bookmark resource"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                      {res.title}
                    </h3>

                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {res.description}
                    </p>

                    <div className="text-[11px] text-gray-500 font-mono pt-1">
                      {res.subject} ({res.topic}) • Source: {res.author}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-3 text-gray-400 font-mono text-[11px]">
                      {res.pages && <span>{res.pages}p</span>}
                      {res.fileSize && <span>{res.fileSize}</span>}
                      <button
                        onClick={() => void handleUpvote(res)}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        title="Upvote resource"
                      >
                        <ThumbsUp className="w-3 h-3" /> {res.upvotes}
                      </button>
                      <span className="text-gray-500">{res.downloads} dl</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {res.contentBody && (
                        <button
                          onClick={() => setPreviewResource(res)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-[#353946] font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read</span>
                        </button>
                      )}
                      <button
                        onClick={() => void handleDownload(res)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{res.contentUrl ? 'Open' : 'Download'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* RESOURCE NOTES PREVIEW MODAL */}
      {previewResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setPreviewResource(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#20232C] border border-[#353946] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#353946] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {previewResource.title}
                </h3>
                <p className="text-[11px] font-mono text-gray-400">
                  {previewResource.branch.code} • Sem {previewResource.semester.number} •{' '}
                  {previewResource.subject}
                </p>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line font-mono bg-[#242731] p-4 rounded-xl border border-white/5">
              {previewResource.contentBody || previewResource.description}
            </div>
          </div>
        </div>
      )}

      {/* 4. REQUEST RESOURCE MODAL */}
      {requestModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setRequestModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#20232C] border border-[#353946] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#353946] pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  Request Courseware / Material
                </h3>
              </div>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Operating Systems Deadlock & Semaphore PYQ Notes"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full bg-[#242731] border border-[#353946] rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                    Branch Department
                  </label>
                  <select
                    value={reqBranch}
                    onChange={(e) => setReqBranch(e.target.value as Branch)}
                    className="w-full bg-[#242731] border border-[#353946] rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="EE">Electrical (EE)</option>
                    <option value="ME">Mechanical (ME)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                    Subject Area *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Operating Systems"
                    value={reqSubject}
                    onChange={(e) => setReqSubject(e.target.value)}
                    className="w-full bg-[#242731] border border-[#353946] rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                  Topic (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Process Synchronization"
                  value={reqTopic}
                  onChange={(e) => setReqTopic(e.target.value)}
                  className="w-full bg-[#242731] border border-[#353946] rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                  Additional Notes & Syllabus Reference
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide reference chapters or specific GATE/semester exam sets..."
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  className="w-full bg-[#242731] border border-[#353946] rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReq}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5 shadow-[0_0_16px_rgba(139,92,246,0.3)] disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReq ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
