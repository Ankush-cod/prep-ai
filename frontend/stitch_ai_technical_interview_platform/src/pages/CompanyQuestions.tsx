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
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'HARD':
    default:
      return 'bg-rose-50 text-rose-700 border-rose-200';
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
      {/* 1. TOP HEADER & METRICS */}
      <section className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#77788B]">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#5145E5] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5145E5] animate-pulse" />
                Placement Question Archive
              </span>
              <span>•</span>
              <span>Company Calibrated Hiring Bars</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17182B]">
              Company Interview Question Bank
            </h1>
            <p className="text-sm text-[#77788B] max-w-2xl leading-relaxed">
              Explore real company-specific interview questions, evaluation rubrics, and technical problem archives curated from recent campus placement drives.
            </p>
          </div>

          {/* Database Metrics Strip */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB]">
              <Layers className="w-4 h-4 text-[#5145E5]" />
              <div>
                <span className="block text-[10px] font-semibold text-[#77788B] uppercase">
                  INDEXED QUESTIONS
                </span>
                <span className="text-xs font-bold text-[#17182B] font-mono">
                  {totalQuestionCount} Curated
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB]">
              <Building2 className="w-4 h-4 text-[#5145E5]" />
              <div>
                <span className="block text-[10px] font-semibold text-[#77788B] uppercase">
                  TARGET FIRMS
                </span>
                <span className="text-xs font-bold text-[#17182B] font-mono">
                  {companies.length} Companies
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB]">
              <Award className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="block text-[10px] font-semibold text-[#77788B] uppercase">
                  ACTIVE FILTER
                </span>
                <span className="text-xs font-bold text-emerald-600 font-mono">
                  {questions.length} Matches
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-2">
          <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#F7F7FC] rounded-xl border border-[#E2E4EB] focus-within:border-[#5145E5] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-[#77788B]" />
            <input
              type="text"
              placeholder="Search companies, roles, interview questions, or topic keywords..."
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

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#77788B] pt-2.5">
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span className="text-[#77788B] font-sans font-semibold">Topic:</span>
              {availableTopics.slice(0, 7).map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    selectedTopic === topic
                      ? 'bg-[#5145E5] text-white font-bold shadow-2xs'
                      : 'text-[#77788B] hover:text-[#17182B] bg-[#F4F4FA]'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Verified Historical
              </span>
              <span className="px-2 py-0.5 rounded bg-[#EEF2FF] text-[#5145E5] border border-[#E0E7FF] font-semibold">
                Rubrics Indexed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMPANY CAROUSEL FILTER STRIP */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#77788B]">
            Target Company
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#77788B] font-semibold">Difficulty:</span>
            {['All', 'EASY', 'MEDIUM', 'HARD'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedDifficulty === d
                    ? 'bg-[#5145E5] text-white font-bold shadow-2xs'
                    : 'text-[#77788B] hover:text-[#17182B] bg-white border border-[#E2E4EB]'
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
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedCompany === 'All'
                ? 'bg-[#EEF2FF] border-[#5145E5] shadow-xs ring-1 ring-[#5145E5]'
                : 'bg-white border-[#E2E4EB] hover:border-[#D3D5E6] hover:bg-[#FAFAFC]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#17182B]">All Orgs</span>
              <Building2
                className={`w-3.5 h-3.5 ${
                  selectedCompany === 'All' ? 'text-[#5145E5]' : 'text-[#77788B]'
                }`}
              />
            </div>
            <span className="text-[10px] font-mono text-[#77788B] block">
              {totalQuestionCount} Qs
            </span>
          </button>

          {companies.map((c) => {
            const isSelected = selectedCompany === c.name;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCompany(c.name)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EEF2FF] border-[#5145E5] shadow-xs ring-1 ring-[#5145E5]'
                    : 'bg-white border-[#E2E4EB] hover:border-[#D3D5E6] hover:bg-[#FAFAFC]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#17182B] truncate">
                    {c.name}
                  </span>
                  <Building2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-[#5145E5]' : 'text-[#77788B]'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-[#77788B] block">
                  {c.questionCount} Qs
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. QUESTION CARDS FEED */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#77788B] px-1">
          <span className="font-medium">
            {isLoading
              ? 'Loading calibrated interview questions...'
              : `Showing ${questions.length} interview question${
                  questions.length === 1 ? '' : 's'
                }`}
          </span>
        </div>

        {error ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to load questions</span>
            </div>
            <p className="text-xs text-[#77788B]">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
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
                className="h-32 bg-white border border-[#E2E4EB] rounded-2xl shadow-sm"
              />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white border border-[#E2E4EB] rounded-2xl p-8 text-center space-y-2 shadow-sm">
            <p className="text-sm font-semibold text-[#17182B]">No matching questions found</p>
            <p className="text-xs text-[#77788B]">
              Try clearing your search filter or selecting another company or difficulty level.
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
                  className="bg-white border border-[#E2E4EB] rounded-2xl p-5 shadow-sm space-y-3 hover:border-[#5145E5]/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#EEF2FF] text-[#5145E5] font-mono text-xs font-bold border border-[#E0E7FF]">
                        {q.company.name}
                      </span>
                      <span className="text-xs text-[#77788B] font-mono">{q.role}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${difficultyBadge(
                          q.difficulty
                        )}`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="text-[11px] text-[#77788B] font-mono hidden md:inline">
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
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          bookmarked
                            ? 'bg-[#EEF2FF] text-[#5145E5] border-[#5145E5]/30'
                            : 'bg-[#F7F7FC] text-[#77788B] hover:text-[#17182B] border-[#E2E4EB]'
                        }`}
                        title="Bookmark Question"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        className="p-1.5 rounded-lg bg-[#F7F7FC] hover:bg-[#EAEAF4] text-[#17182B] transition-colors cursor-pointer border border-[#E2E4EB]"
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
                    <h3 className="text-sm sm:text-base font-bold text-[#17182B] tracking-tight">
                      {q.title}
                    </h3>
                    <p className="text-xs text-[#77788B] mt-1 leading-relaxed">
                      {q.questionText}
                    </p>
                    <span className="text-[11px] text-[#77788B] font-mono block mt-1">
                      {q.topic} {q.lastAsked ? `• ${q.lastAsked}` : ''} •{' '}
                      {q.provenance}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {q.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-[#F7F7FC] text-[10px] font-mono text-[#77788B] border border-[#E2E4EB]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#F0F1F5] space-y-3">
                      <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-2">
                        <span className="font-mono text-[10px] text-[#5145E5] uppercase font-bold block">
                          Calibrated Solution Approach & Key Tradeoffs
                        </span>
                        <p className="text-xs text-[#17182B] leading-relaxed whitespace-pre-line font-mono">
                          {q.solutionSummary}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[#77788B] text-[11px] uppercase font-mono font-semibold">
                            Rubric Keys:
                          </span>
                          {q.keyConcepts.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-medium"
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        <NavLink
                          to="/mock-interviews"
                          className="px-3.5 py-1.5 rounded-lg bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold text-xs transition-all flex items-center gap-1 shadow-xs"
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
