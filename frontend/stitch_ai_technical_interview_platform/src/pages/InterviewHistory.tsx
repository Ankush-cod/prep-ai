// src/pages/InterviewHistory.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Bot,
  Flag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';
import {
  BackendInterviewSession,
  interviewService,
} from '../services/interviewService';

const ROUND_TYPES = ['All', 'TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'HR'] as const;

export const InterviewHistory: React.FC = () => {
  const { showToast, setActiveInterviewConfig } = useApp();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<BackendInterviewSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoundType, setSelectedRoundType] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await interviewService.listSessions();
      setSessions(list);
      if (list.length > 0) {
        setExpandedSessionId((prev) =>
          prev && list.some((s) => s.id === prev) ? prev : list[0].id
        );
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load interview history.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const companies = useMemo(() => {
    const names = Array.from(
      new Set(sessions.map((s) => s.companyName).filter(Boolean) as string[])
    ).sort();
    return ['All', ...names];
  }, [sessions]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sessions.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        (item.companyName || '').toLowerCase().includes(q);
      const matchesRound =
        selectedRoundType === 'All' || item.interviewType === selectedRoundType;
      const matchesCompany =
        selectedCompany === 'All' || item.companyName === selectedCompany;
      return matchesSearch && matchesRound && matchesCompany;
    });
  }, [sessions, searchQuery, selectedRoundType, selectedCompany]);

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === 'COMPLETED');
    const scored = completed.filter((s) => s.overallScore != null);
    const avgScore =
      scored.length > 0
        ? Math.round(
            (scored.reduce((sum, s) => sum + (s.overallScore || 0), 0) /
              scored.length) *
              10
          ) / 10
        : 0;
    const totalMinutes = completed.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    );
    const totalQuestions = sessions.reduce(
      (sum, s) => sum + (s.questions?.length || 0),
      0
    );
    return {
      total: sessions.length,
      completedCount: completed.length,
      avgScore,
      totalMinutes,
      totalQuestions,
    };
  }, [sessions]);

  const handleExportPDF = async (session: BackendInterviewSession) => {
    setDownloadingId(session.id);
    try {
      await interviewService.downloadPdfReport(session.id);
      showToast(`Downloaded PDF report for ${session.title}`);
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : 'Failed to export interview PDF report.',
        'warning'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleFlagReview = async (sessionId: string) => {
    try {
      await interviewService.flagSession(
        sessionId,
        'Candidate requested rubric verification'
      );
      showToast('Session flagged for admin review');
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to flag session.',
        'warning'
      );
    }
  };

  const handleRetakeRound = (session: BackendInterviewSession) => {
    if (session.status === 'IN_PROGRESS') {
      navigate(`/mock-interviews/live?sessionId=${session.id}`);
      return;
    }

    const mappedType =
      session.interviewType === 'HR'
        ? 'hr'
        : session.interviewType === 'BEHAVIORAL'
        ? 'behavioral'
        : session.interviewType === 'SYSTEM_DESIGN'
        ? 'system_design'
        : 'technical';

    setActiveInterviewConfig((prev) => ({
      ...prev,
      type: mappedType,
      company: session.companyName || prev.company,
      branch: session.branch?.code || prev.branch,
      difficulty:
        session.difficulty === 'Hard' || session.difficulty === 'Easy'
          ? session.difficulty
          : 'Medium',
      duration: session.durationMinutes || prev.duration,
      questionCount: session.questionCount || prev.questionCount,
      topic: session.topic,
    }));
    navigate('/mock-interviews');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>Interview Archive</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Interview History
            </h1>
            <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
              Review past AI technical mock interviews, per-answer rubric scores, Q&A transcripts, and downloadable PDF evaluation reports.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#242731] border border-[#353946] px-4 py-2.5 rounded-2xl shadow-sm self-start lg:self-center">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-gray-400 block tracking-wider">
                Completed Rounds
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {stats.completedCount} / {stats.total} Sessions
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 4 Real Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#242731] border border-[#353946] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-gray-400">
              Total Completed
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-bold font-mono text-white">
                {stats.completedCount}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                / {stats.total} total
              </span>
            </div>
            <div className="w-full bg-[#20232C] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{
                  width:
                    stats.total > 0
                      ? `${Math.round((stats.completedCount / stats.total) * 100)}%`
                      : '0%',
                }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#242731] border border-[#353946] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-gray-400">
              Avg Overall Score
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-bold font-mono text-white">
                {stats.avgScore}
              </span>
              <span className="text-xs text-gray-500 font-mono">/ 100</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Rubric evaluated
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#242731] border border-[#353946] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-gray-400">
              Planned Duration
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-bold font-mono text-white">
                {stats.totalMinutes}m
              </span>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">
              Across completed rounds
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#242731] border border-[#353946] flex flex-col justify-between">
            <span className="text-[11px] font-mono uppercase text-gray-400">
              Questions Prompted
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-bold font-mono text-emerald-400">
                {stats.totalQuestions}
              </span>
            </div>
            <span className="text-[11px] text-purple-300 font-mono">
              Persisted in transcript archive
            </span>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 bg-[#242731] border border-[#353946] rounded-2xl shadow-md space-y-3">
          <div className="flex items-center gap-3 px-3.5 py-2 bg-[#20232C] rounded-xl border border-[#353946] focus-within:border-purple-500 transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search interviews by company, title, or topic..."
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
              <span className="text-gray-500 text-[11px] font-mono uppercase">
                Round Type:
              </span>
              {ROUND_TYPES.map((rt) => (
                <button
                  key={rt}
                  onClick={() => setSelectedRoundType(rt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    selectedRoundType === rt
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                      : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {rt}
                </button>
              ))}
            </div>

            {companies.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-500 text-[11px] font-mono uppercase">
                  Company:
                </span>
                {companies.map((cp) => (
                  <button
                    key={cp}
                    onClick={() => setSelectedCompany(cp)}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
                      selectedCompany === cp
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                        : 'text-gray-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {cp}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interview History Cards List */}
      <section className="space-y-4">
        {error ? (
          <div className="bg-[#242731] border border-red-500/30 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to load interview sessions</span>
            </div>
            <p className="text-xs text-gray-400">{error}</p>
            <button
              onClick={loadSessions}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-[#242731] border border-[#353946]"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-10 text-center space-y-3">
            <Bot className="w-8 h-8 text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Interview Sessions Found</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Start an AI mock interview session to generate evaluated transcripts and diagnostic PDF dossiers.
            </p>
            <NavLink
              to="/mock-interviews"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              Start AI Mock Interview
            </NavLink>
          </div>
        ) : (
          filtered.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const techScore = Math.round(session.technicalScore ?? 0);
            const concScore = Math.round(session.conceptualScore ?? 0);
            const compScore = Math.round(session.completenessScore ?? 0);
            const clarScore = Math.round(session.clarityScore ?? 0);

            return (
              <div
                key={session.id}
                className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4 hover:border-white/20 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {session.companyName && (
                        <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-xs font-semibold border border-purple-500/30">
                          {session.companyName}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-mono">
                        {session.interviewType}
                      </span>
                      <span className="text-xs text-cyan-400 font-mono">
                        • {session.difficulty}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        • {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        ({session.durationMinutes} min)
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {session.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-lg font-bold font-mono text-emerald-400">
                        {session.overallScore != null
                          ? `${Math.round(session.overallScore)}%`
                          : session.status}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono uppercase">
                        {session.overallScore != null ? 'Overall Score' : 'Session Status'}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedSessionId(isExpanded ? null : session.id)
                      }
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand Details'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Rubric Score Breakdown Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#20232C] rounded-xl border border-white/5 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-gray-400 text-[11px] mb-1">
                      <span>Technical</span>
                      <span className="text-purple-300 font-bold">{techScore}%</span>
                    </div>
                    <div className="w-full bg-[#242731] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full"
                        style={{ width: `${techScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 text-[11px] mb-1">
                      <span>Conceptual</span>
                      <span className="text-cyan-300 font-bold">{concScore}%</span>
                    </div>
                    <div className="w-full bg-[#242731] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full"
                        style={{ width: `${concScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 text-[11px] mb-1">
                      <span>Completeness</span>
                      <span className="text-emerald-300 font-bold">{compScore}%</span>
                    </div>
                    <div className="w-full bg-[#242731] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${compScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 text-[11px] mb-1">
                      <span>Clarity</span>
                      <span className="text-amber-300 font-bold">{clarScore}%</span>
                    </div>
                    <div className="w-full bg-[#242731] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${clarScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {session.feedback?.summary && (
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <span className="text-gray-500 font-semibold font-mono text-[11px] uppercase mr-1">
                      Examiner Summary:
                    </span>
                    {session.feedback.summary}
                  </p>
                )}

                {/* Expandable Q&A Transcript */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#353946] space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-purple-300 font-bold uppercase">
                        Q&A Transcript & Evaluator Notes
                      </span>
                      <span className="text-gray-500">
                        {session.questions?.length || 0} questions recorded
                      </span>
                    </div>

                    {(session.questions || []).map((q, qIndex) => (
                      <div
                        key={q.id || qIndex}
                        className="p-4 rounded-xl bg-[#20232C] border border-white/5 space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-white leading-snug">
                            Q{qIndex + 1}. {q.prompt}
                          </h4>
                          {q.answer && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold shrink-0">
                              {Math.round(q.answer.overallQuestionScore)}%
                            </span>
                          )}
                        </div>

                        {q.answer ? (
                          <>
                            <div className="p-3 rounded-lg bg-[#191B22] font-mono text-[11px] text-gray-300 whitespace-pre-wrap leading-relaxed">
                              <span className="text-gray-500 block mb-1">
                                Candidate Answer:
                              </span>
                              {q.answer.answerText}
                            </div>
                            <div className="text-[11px] text-purple-300 font-mono">
                              <span className="text-gray-500">Evaluator Note:</span>{' '}
                              {q.answer.examinerFeedback}
                            </div>
                          </>
                        ) : (
                          <div className="text-[11px] text-gray-500 font-mono italic">
                            Not answered yet.
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => void handleFlagReview(session.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-[#353946] text-xs font-medium text-gray-400 hover:text-amber-300 flex items-center gap-1.5 transition-all"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>Flag AI Evaluation</span>
                      </button>

                      <div className="flex flex-wrap items-center gap-3">
                        {session.status === 'COMPLETED' && (
                          <button
                            onClick={() => void handleExportPDF(session)}
                            disabled={downloadingId === session.id}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#353946] text-xs font-medium text-gray-300 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>
                              {downloadingId === session.id
                                ? 'Generating PDF...'
                                : 'Export Verified PDF Dossier'}
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => handleRetakeRound(session)}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_16px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>
                            {session.status === 'IN_PROGRESS'
                              ? 'Resume Session'
                              : 'Retake Similar Round'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
