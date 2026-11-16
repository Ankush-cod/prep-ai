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
  Layers,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';
import { BackendResource, resourceService } from '../services/resourceService';
import { Branch } from '../types/prepai';

const BRANCH_TRACKS: { code: Branch; name: string; desc: string; icon: string }[] = [
  { code: 'CSE', name: 'Computer Science', desc: 'Core CS, DSA, OS, DBMS & AI', icon: '💻' },
  { code: 'ECE', name: 'Electronics & Comm', desc: 'VLSI, Signals & Microprocessors', icon: '⚡' },
  { code: 'EE', name: 'Electrical Eng', desc: 'Power Systems, Machines & Control', icon: '🔋' },
  { code: 'ME', name: 'Mechanical Eng', desc: 'Thermodynamics, CAD & Mechanics', icon: '⚙️' },
];

const SUBJECTS_BY_BRANCH: Record<Branch, string[]> = {
  CSE: [
    'All Subjects',
    'Data Structures & Algorithms',
    'Operating Systems',
    'Database Management Systems',
    'Computer Networks',
    'Object-Oriented Programming',
    'Software Engineering',
    'Theory of Computation',
    'Compiler Design',
    'Computer Organization & Architecture',
    'Artificial Intelligence',
    'Machine Learning',
  ],
  ECE: [
    'All Subjects',
    'Digital Electronics & VLSI',
    'Signals & Systems',
    'Microprocessors & Microcontrollers',
    'Analog Circuits',
    'Communication Systems',
  ],
  EE: [
    'All Subjects',
    'Electric Circuits & Networks',
    'Power Systems',
    'Control Systems',
    'Electrical Machines',
    'Power Electronics',
  ],
  ME: [
    'All Subjects',
    'Thermodynamics & Heat Transfer',
    'Fluid Mechanics',
    'Strength of Materials & Mechanics',
    'Theory of Machines & Machine Design',
    'Manufacturing Technology',
  ],
};

const FORMAT_OPTIONS = [
  { label: 'All Formats', value: 'All' },
  { label: 'Notes', value: 'NOTES' },
  { label: 'Cheatsheets', value: 'CHEATSHEET' },
  { label: 'GATE PYQs', value: 'GATE_PYQS' },
  { label: 'Compendiums', value: 'COMPENDIUM' },
  { label: 'Concepts', value: 'CONCEPT' },
  { label: 'Interview Q&A', value: 'INTERVIEW_QA' },
  { label: 'MCQs', value: 'MCQ' },
  { label: 'Tutorials', value: 'TUTORIAL' },
  { label: 'Formulas', value: 'FORMULAS' },
  { label: 'Revision', value: 'REVISION' },
];

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  EASY: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  HARD: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export const PreparationResources: React.FC = () => {
  const { profile, toggleBookmark, isBookmarked, showToast } = useApp();

  const [resources, setResources] = useState<BackendResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch>(profile.branch || 'CSE');
  const [selectedSemester, setSelectedSemester] = useState<number | 'All'>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewResource, setPreviewResource] = useState<BackendResource | null>(null);

  // Request modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqBranch, setReqBranch] = useState<Branch>(profile.branch || 'CSE');
  const [reqSubject, setReqSubject] = useState('');
  const [reqTopic, setReqTopic] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // Duplicate warning state
  const [duplicateMatches, setDuplicateMatches] = useState<Array<{ id: string; title: string; subject: string; topic: string }>>([]);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [forceSubmit, setForceSubmit] = useState(false);

  // Load resources
  const loadResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await resourceService.listResources({
        branch: selectedBranch,
        semester: selectedSemester,
        subject: selectedSubject !== 'All Subjects' ? selectedSubject : undefined,
        format: selectedFormat !== 'All' ? selectedFormat : undefined,
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
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
  }, [selectedBranch, selectedSemester, selectedSubject, selectedFormat, selectedDifficulty, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadResources();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadResources]);

  // When branch changes, reset subject to 'All Subjects'
  const handleBranchChange = (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedSubject('All Subjects');
  };

  // Check duplicate during request creation (debounced)
  useEffect(() => {
    if (!requestModalOpen || (!reqTitle.trim() && !reqSubject.trim())) {
      setDuplicateMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingDuplicate(true);
      try {
        const res = await resourceService.checkDuplicate({
          title: reqTitle.trim(),
          subject: reqSubject.trim(),
          topic: reqTopic.trim() || undefined,
        });
        setDuplicateMatches(res.matches || []);
      } catch {
        // ignore duplicate check failures
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [reqTitle, reqSubject, reqTopic, requestModalOpen]);

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
      // Proceed
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

    if (duplicateMatches.length > 0 && !forceSubmit) {
      showToast('A similar resource already exists! Check matches or tick "Submit Anyway".', 'warning');
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
        force: forceSubmit,
      });
      setRequestModalOpen(false);
      showToast('Resource request submitted for admin review!');
      setReqTitle('');
      setReqSubject('');
      setReqTopic('');
      setReqNotes('');
      setDuplicateMatches([]);
      setForceSubmit(false);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to submit resource request',
        'warning'
      );
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const subjectsList = SUBJECTS_BY_BRANCH[selectedBranch] || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. HEADER SECTION */}
      <section className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#77788B]">
              <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#5145E5] font-mono font-medium">
                Academic Curriculum
              </span>
              <span>•</span>
              <span>Branch & Semester Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17182B]">
              Preparation Resources & Study Material
            </h1>
            <p className="text-sm text-[#77788B] max-w-3xl leading-relaxed">
              Curated syllabus-calibrated courseware, comprehensive revision notes, core textbooks, GATE PYQs, and quick cheatsheets for CSE, ECE, EE, and ME disciplines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setReqBranch(selectedBranch);
                setRequestModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Request Material</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. BRANCH TRACK SELECTION CARDS */}
      <section className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#77788B] flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-[#5145E5]" />
          Select Engineering Discipline
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BRANCH_TRACKS.map((b) => {
            const isSelected = selectedBranch === b.code;
            return (
              <button
                key={b.code}
                onClick={() => handleBranchChange(b.code)}
                className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EEF2FF] border-[#5145E5] shadow-sm ring-1 ring-[#5145E5]'
                    : 'bg-white border-[#E2E4EB] hover:border-[#D3D5E6] hover:bg-[#FAFAFC]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{b.icon}</span>
                    <span className={`text-sm font-bold ${isSelected ? 'text-[#5145E5]' : 'text-[#17182B]'}`}>
                      {b.name}
                    </span>
                  </div>
                  <p className="text-xs text-[#77788B] leading-relaxed">
                    {b.desc}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isSelected
                      ? 'bg-[#5145E5] text-white'
                      : 'bg-[#F4F4FA] text-[#77788B] border border-[#E2E4EB]'
                  }`}
                >
                  {b.code}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. MULTI-LEVEL FILTERING BAR */}
      <section className="bg-white border border-[#E2E4EB] rounded-2xl p-4 shadow-sm space-y-4">
        {/* Search row */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#F7F7FC] rounded-xl border border-[#E2E4EB] focus-within:border-[#5145E5] focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-[#77788B]" />
          <input
            type="text"
            placeholder="Search resources by title, topic, subject, or author..."
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

        {/* Dropdowns & Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Semester Selector */}
          <div>
            <label className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-xs text-[#17182B] font-medium focus:outline-none focus:border-[#5145E5]"
            >
              <option value="All">All Semesters (1–8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block mb-1">
              Subject Area
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-xs text-[#17182B] font-medium focus:outline-none focus:border-[#5145E5]"
            >
              {subjectsList.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Format */}
          <div>
            <label className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block mb-1">
              Resource Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-xs text-[#17182B] font-medium focus:outline-none focus:border-[#5145E5]"
            >
              {FORMAT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block mb-1">
              Difficulty Level
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-xs text-[#17182B] font-medium focus:outline-none focus:border-[#5145E5]"
            >
              <option value="All">All Difficulties</option>
              <option value="EASY">Easy / Fundamentals</option>
              <option value="MEDIUM">Medium / Core</option>
              <option value="HARD">Hard / Advanced</option>
            </select>
          </div>
        </div>

        {/* Quick Format Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
          <span className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#5145E5]" /> Quick:
          </span>
          {['All', 'NOTES', 'CHEATSHEET', 'GATE_PYQS', 'COMPENDIUM', 'INTERVIEW_QA'].map((fmt) => {
            const isFmtActive = selectedFormat === fmt;
            return (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isFmtActive
                    ? 'bg-[#5145E5] text-white shadow-xs'
                    : 'bg-[#F4F4FA] text-[#77788B] hover:text-[#17182B] hover:bg-[#EAEAF4]'
                }`}
              >
                {fmt === 'All' ? 'All' : fmt.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. RESOURCE CARDS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#77788B] px-1">
          <span className="font-medium">
            {isLoading
              ? 'Loading courseware...'
              : `Showing ${resources.length} resource${resources.length === 1 ? '' : 's'} in ${selectedBranch} ${
                  selectedSemester !== 'All' ? `(Semester ${selectedSemester})` : ''
                }`}
          </span>
          {(selectedSubject !== 'All Subjects' || selectedFormat !== 'All' || selectedDifficulty !== 'All') && (
            <button
              onClick={() => {
                setSelectedSubject('All Subjects');
                setSelectedFormat('All');
                setSelectedDifficulty('All');
              }}
              className="text-[#5145E5] hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {error ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Failed to load resources</span>
            </div>
            <p className="text-xs text-[#77788B]">{error}</p>
            <button
              onClick={loadResources}
              className="px-4 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-56 bg-white border border-[#E2E4EB] rounded-2xl animate-pulse p-5 shadow-sm"
              />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white border border-[#E2E4EB] rounded-2xl p-10 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#5145E5] flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#17182B]">
              No resources found for the current filters
            </h3>
            <p className="text-xs text-[#77788B] max-w-md mx-auto">
              Try adjusting your branch, semester, or subject selection. You can also request a new resource and our admin team will add it.
            </p>
            <button
              onClick={() => {
                setReqBranch(selectedBranch);
                setRequestModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#5145E5] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Request This Resource
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((res) => {
              const bookmarked = isBookmarked(res.id);
              const diff = res.difficulty || 'EASY';
              const diffStyle = DIFFICULTY_COLORS[diff] || DIFFICULTY_COLORS.EASY;

              return (
                <div
                  key={res.id}
                  className="bg-white border border-[#E2E4EB] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#5145E5]/40 hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Top badges row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#5145E5] font-mono text-[10px] font-bold border border-[#E0E7FF]">
                          {res.branch.code} • Sem {res.semester.number}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#F4F4FA] text-[#17182B] font-mono text-[10px] font-semibold border border-[#E2E4EB]">
                          {res.format.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}>
                          {diff}
                        </span>
                        {res.isGatePyq && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-mono text-[10px] font-bold border border-amber-200">
                            GATE
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
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          bookmarked
                            ? 'bg-[#EEF2FF] text-[#5145E5] border-[#5145E5]/30'
                            : 'bg-[#F7F7FC] text-[#77788B] hover:text-[#17182B] border-[#E2E4EB]'
                        }`}
                        title="Bookmark resource"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-[#17182B] tracking-tight leading-snug line-clamp-2">
                      {res.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#77788B] leading-relaxed line-clamp-2">
                      {res.description}
                    </p>

                    {/* Subject & Author */}
                    <div className="text-[11px] text-[#77788B] font-mono pt-1 border-t border-[#F0F1F5] flex items-center justify-between">
                      <span className="truncate">{res.subject} ({res.topic})</span>
                      {res.isVerified && (
                        <span className="text-[10px] font-sans font-medium text-emerald-600 flex items-center gap-0.5 shrink-0 ml-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom action row */}
                  <div className="pt-3 border-t border-[#F0F1F5] flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2.5 text-[#77788B] font-mono text-[11px]">
                      {res.pages && <span>{res.pages}p</span>}
                      {res.fileSize && <span>{res.fileSize}</span>}
                      <button
                        onClick={() => void handleUpvote(res)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors cursor-pointer"
                        title="Upvote resource"
                      >
                        <ThumbsUp className="w-3 h-3" /> {res.upvotes}
                      </button>
                      <span>{res.downloads} dl</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {res.contentBody && (
                        <button
                          onClick={() => setPreviewResource(res)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F4F4FA] hover:bg-[#EAEAF4] text-[#17182B] border border-[#E2E4EB] font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#5145E5]" />
                          <span>Read</span>
                        </button>
                      )}
                      <button
                        onClick={() => void handleDownload(res)}
                        className="px-3 py-1.5 rounded-lg bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        {res.contentUrl ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
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

      {/* 5. NOTES READING MODAL */}
      {previewResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setPreviewResource(null)}
        >
          <div
            className="w-full max-w-2xl bg-white border border-[#E2E4EB] rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#EEF2FF] text-[#5145E5] text-[10px] font-mono font-bold">
                    {previewResource.branch.code} • Sem {previewResource.semester.number}
                  </span>
                  <span className="text-xs font-semibold text-[#77788B]">
                    {previewResource.subject}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#17182B]">
                  {previewResource.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="text-[#77788B] hover:text-[#17182B] p-1.5 rounded-lg hover:bg-[#F4F4FA] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-[#17182B] leading-relaxed whitespace-pre-line font-mono bg-[#F7F7FC] p-4 rounded-xl border border-[#E2E4EB] max-h-96 overflow-y-auto">
              {previewResource.contentBody || previewResource.description}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#E2E4EB]">
              <span className="text-xs text-[#77788B]">Source: {previewResource.author}</span>
              <button
                onClick={() => void handleDownload(previewResource)}
                className="px-4 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. REQUEST RESOURCE MODAL WITH DUPLICATE CHECK */}
      {requestModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setRequestModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white border border-[#E2E4EB] rounded-2xl shadow-xl overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#5145E5]" />
                <h3 className="text-base font-bold text-[#17182B]">
                  Request Engineering Courseware
                </h3>
              </div>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="text-[#77788B] hover:text-[#17182B] p-1.5 rounded-lg hover:bg-[#F4F4FA] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#17182B] font-semibold block mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Computer Networks IP Addressing & Subnetting Guide"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3.5 py-2 text-xs text-[#17182B] placeholder-[#77788B] focus:outline-none focus:border-[#5145E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#17182B] font-semibold block mb-1">
                    Discipline
                  </label>
                  <select
                    value={reqBranch}
                    onChange={(e) => setReqBranch(e.target.value as Branch)}
                    className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-xs text-[#17182B] focus:outline-none focus:border-[#5145E5]"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="EE">Electrical (EE)</option>
                    <option value="ME">Mechanical (ME)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#17182B] font-semibold block mb-1">
                    Subject Area *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Computer Networks"
                    value={reqSubject}
                    onChange={(e) => setReqSubject(e.target.value)}
                    className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-xs text-[#17182B] placeholder-[#77788B] focus:outline-none focus:border-[#5145E5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#17182B] font-semibold block mb-1">
                  Topic or Chapter
                </label>
                <input
                  type="text"
                  placeholder="e.g., Subnetting & CIDR"
                  value={reqTopic}
                  onChange={(e) => setReqTopic(e.target.value)}
                  className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3.5 py-2 text-xs text-[#17182B] placeholder-[#77788B] focus:outline-none focus:border-[#5145E5]"
                />
              </div>

              <div>
                <label className="text-[#17182B] font-semibold block mb-1">
                  Additional Notes & Syllabus Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide textbook chapters, syllabus references or GATE exam years..."
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-3 text-xs text-[#17182B] placeholder-[#77788B] focus:outline-none focus:border-[#5145E5]"
                />
              </div>

              {/* DUPLICATE WARNING BANNER */}
              {duplicateMatches.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Similar Resource Already Exists in Library:</span>
                  </div>
                  <ul className="text-[11px] text-amber-900 list-disc list-inside space-y-0.5">
                    {duplicateMatches.slice(0, 2).map((m) => (
                      <li key={m.id} className="truncate">
                        <strong>{m.title}</strong> ({m.subject})
                      </li>
                    ))}
                  </ul>
                  <label className="flex items-center gap-2 pt-1 text-xs text-amber-950 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceSubmit}
                      onChange={(e) => setForceSubmit(e.target.checked)}
                      className="rounded text-[#5145E5] focus:ring-[#5145E5]"
                    />
                    <span>Yes, submit request anyway (distinct syllabus need)</span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F4F4FA] hover:bg-[#EAEAF4] text-[#17182B] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReq || (duplicateMatches.length > 0 && !forceSubmit)}
                  className="px-5 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
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
