// src/pages/CompanyQuestions.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  Search,
  Bookmark,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';
import {
  BackendCompany,
  BackendCompanyQuestion,
  resourceService,
} from '../services/resourceService';

function difficultyBadge(diff: string): string {
  switch (diff.toUpperCase()) {
    case 'EASY':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'HARD':
    default:
      return 'bg-red-500/10 text-red-400 border-red-500/20';
  }
}

export const CompanyQuestions: React.FC = () => {
  const { toggleBookmark, isBookmarked } = useApp();

  const [companies, setCompanies] = useState<BackendCompany[]>([]);
  const [questions, setQuestions] = useState<BackendCompanyQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [companyList, questionList] = await Promise.all([
        resourceService.listCompanies(),
        resourceService.listCompanyQuestions({
          company: selectedCompany,
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          search: searchQuery.trim() || undefined,
        }),
      ]);
      setCompanies(companyList);
      setQuestions(questionList);
      if (questionList.length > 0) {
        setExpandedId((prev) =>
          prev && questionList.some((q) => q.id === prev) ? prev : questionList[0].id
        );
      } else {
        setExpandedId(null);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load company question bank.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompany, selectedTopic, selectedDifficulty, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadData]);

  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.topic) set.add(q.topic);
    });
    return ['All', ...Array.from(set).sort()];
  }, [questions]);

  const totalQuestionCount = useMemo(
    () => companies.reduce((sum, c) => sum + c.questionCount, 0),
    [companies]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Command Center & Header */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-purple-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                Placement Question Bank
              </span>
              <span>•</span>
              <span>Calibrated Evaluation Rubrics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Company Interview Preparation
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              Explore company-specific interview questions, evaluation rubrics, and technical problem archives curated from placement drives.
            </p>
          </div>

          {/* Real Database Metrics Strip */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#242731] border border-[#353946] shadow-sm">
              <Layers className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="block text-[10px] font-mono text-gray-500">
                  INDEXED QUESTIONS
                </span>
                <span className="text-xs font-bold text-white">
                  {totalQuestionCount} Curated
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#242731] border border-[#353946] shadow-sm">
              <Building2 className="w-4 h-4 text-purple-400" />
              <div>
                <span className="block text-[10px] font-mono text-gray-500">
                  TARGET ORGS
                </span>
                <span className="text-xs font-bold text-white">
                  {companies.length} Companies
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#242731] border border-[#353946] shadow-sm">
              <Award className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="block text-[10px] font-mono text-gray-500">
                  ACTIVE FILTER
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {questions.length} Matches
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar & Provenance Meta */}
        <div className="p-3 bg-[#242731] border border-[#353946] rounded-2xl shadow-md space-y-2.5">
          <div className="flex items-center gap-3 px-3 py-2 bg-[#20232C] rounded-xl border border-[#353946] focus-within:border-purple-500 transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies, roles, interview questions, or topic keywords..."
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

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 px-1 pt-1">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="text-gray-500">Topic:</span>
              {availableTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    selectedTopic === topic
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                      : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified Historical
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Rubric Indexed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Company Carousel Filter Strip */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
            Target Company Filters
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Difficulty:</span>
            {['All', 'EASY', 'MEDIUM', 'HARD'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  selectedDifficulty === d
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                {d === 'All' ? 'All' : d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <button
            onClick={() => setSelectedCompany('All')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedCompany === 'All'
                ? 'bg-purple-600/15 border-purple-500 text-white shadow-sm'
                : 'bg-[#242731] border-white/5 hover:border-[#353946] text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">All</span>
              <Building2
                className={`w-3.5 h-3.5 ${
                  selectedCompany === 'All' ? 'text-purple-400' : 'text-gray-500'
                }`}
              />
            </div>
            <span className="text-[10px] font-mono text-gray-400 block">
              {totalQuestionCount} Qs
            </span>
          </button>

          {companies.map((c) => {
            const isSelected = selectedCompany === c.name;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCompany(c.name)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-600/15 border-purple-500 text-white shadow-sm'
                    : 'bg-[#242731] border-white/5 hover:border-[#353946] text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate">
                    {c.name}
                  </span>
                  <Building2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-purple-400' : 'text-gray-500'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-gray-400 block">
                  {c.questionCount} Qs
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Question Cards Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            {isLoading
              ? 'Loading calibrated interview questions...'
              : `Showing ${questions.length} interview question${
                  questions.length === 1 ? '' : 's'
                }`}
          </span>
        </div>

        {error ? (
          <div className="bg-[#242731] border border-red-500/30 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to load questions</span>
            </div>
            <p className="text-xs text-gray-400">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-32 bg-[#242731] border border-[#353946] rounded-2xl"
              />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-white">No matching questions</p>
            <p className="text-xs text-gray-400">
              Try clearing your search filter or choosing another company/difficulty.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => {
              const isExpanded = expandedId === q.id;
              const bookmarked = isBookmarked(q.id);

              return (
                <div
                  key={q.id}
                  className="bg-[#242731] border border-[#353946] rounded-2xl p-5 shadow-md space-y-3 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 font-mono text-xs font-semibold border border-purple-500/20">
                        {q.company.name}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{q.role}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${difficultyBadge(
                          q.difficulty
                        )}`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono hidden md:inline">
                        • {q.frequency} Frequency
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() =>
                          void toggleBookmark({
                            id: q.id,
                            title: q.title,
                            category: 'Company Questions',
                            branch: 'CSE',
                            difficulty:
                              q.difficulty === 'EASY'
                                ? 'Easy'
                                : q.difficulty === 'MEDIUM'
                                ? 'Medium'
                                : 'Hard',
                            tags: q.tags,
                            targetCompany: q.company.name,
                            type: 'doc',
                            targetType: 'COMPANY_QUESTION',
                          })
                        }
                        className={`p-1.5 rounded-lg border transition-all ${
                          bookmarked
                            ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                            : 'bg-white/5 text-gray-400 hover:text-white border-[#353946]'
                        }`}
                        title="Bookmark Question"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand Solution'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {q.title}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      {q.questionText}
                    </p>
                    <span className="text-[11px] text-gray-500 font-mono block mt-1">
                      {q.topic} {q.lastAsked ? `• ${q.lastAsked}` : ''} •{' '}
                      {q.provenance}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {q.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-[#20232C] text-[10px] font-mono text-gray-300 border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#353946] space-y-3">
                      <div className="p-4 rounded-xl bg-[#20232C] border border-white/5 space-y-2">
                        <span className="font-mono text-[10px] text-purple-400 uppercase font-semibold block">
                          Calibrated Solution Approach & Key Tradeoffs
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                          {q.solutionSummary}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-gray-500 text-[11px] uppercase font-mono">
                            Rubric Keys:
                          </span>
                          {q.keyConcepts.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono text-[10px]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        <NavLink
                          to="/mock-interviews"
                          className="px-3.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-all flex items-center gap-1"
                        >
                          <span>Start Mock on this Topic</span>
                          <ExternalLink className="w-3 h-3" />
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
