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
      {/* 1. Header Section */}
      <section className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-[#77788B] uppercase tracking-wider">
              <span className="text-[#5145E5] font-semibold">Diagnostic Evaluation Archive</span>
              <span>•</span>
              <span>Interactive Sessions &amp; Rubrics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17182B]">
              Mock Interview History &amp; Transcripts
            </h1>
            <p className="text-sm text-[#77788B] max-w-3xl leading-relaxed">
              Review past AI technical mock interviews, question-by-question scoring rubrics, written transcripts, and downloadable PDF evaluation reports.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#F7F7FC] border border-[#E2E4EB] px-4 py-2.5 rounded-2xl self-start lg:self-center">
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-[#77788B] block tracking-wider">
                Completed Sessions
              </span>
              <span className="text-xs font-bold text-emerald-600 font-mono">
                {stats.completedCount} / {stats.total} Sessions
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77788B]">
              Total Completed
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#17182B]">
                {stats.completedCount}
              </span>
              <span className="text-xs text-[#77788B] font-mono">
                / {stats.total} total
              </span>
            </div>
            <div className="w-full bg-[#E2E4EB] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#5145E5] h-full rounded-full"
                style={{
                  width:
                    stats.total > 0
                      ? `${Math.round((stats.completedCount / stats.total) * 100)}%`
                      : '0%',
                }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77788B]">
              Avg Overall Score
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#17182B]">
                {stats.avgScore}
              </span>
              <span className="text-xs text-[#77788B] font-mono">/ 100</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Rubric calibrated
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77788B]">
              Planned Duration
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#17182B]">
                {stats.totalMinutes}m
              </span>
            </div>
            <span className="text-[11px] text-[#5145E5] font-medium">
              Across finished rounds
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77788B]">
              Questions Answered
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#17182B]">
                {stats.totalQuestions}
              </span>
            </div>
            <span className="text-[11px] text-[#77788B]">
              Archived in database
            </span>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#F7F7FC] rounded-xl border border-[#E2E4EB] focus-within:border-[#5145E5] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-[#77788B]" />
            <input
              type="text"
              placeholder="Search interviews by company, title, or topic..."
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
              <span className="text-[#77788B] text-[11px] font-semibold uppercase tracking-wider">
                Type:
              </span>
              {ROUND_TYPES.map((rt) => (
                <button
                  key={rt}
                  onClick={() => setSelectedRoundType(rt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedRoundType === rt
                      ? 'bg-[#5145E5] text-white font-bold shadow-2xs'
                      : 'text-[#77788B] hover:text-[#17182B] bg-[#F7F7FC]'
                  }`}
                >
                  {rt}
                </button>
              ))}
            </div>

            {companies.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[#77788B] text-[11px] font-semibold uppercase tracking-wider">
                  Company:
                </span>
                {companies.map((cp) => (
                  <button
                    key={cp}
                    onClick={() => setSelectedCompany(cp)}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
                      selectedCompany === cp
                        ? 'bg-[#5145E5] text-white font-bold'
                        : 'text-[#77788B] hover:text-[#17182B] bg-[#F7F7FC]'
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

      {/* 2. Interview History Cards List */}
      <section className="space-y-4">
        {error ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to load interview sessions</span>
            </div>
            <p className="text-xs text-[#77788B]">{error}</p>
            <button
              onClick={loadSessions}
              className="px-4 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
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
                className="h-44 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#E2E4EB] rounded-2xl p-10 text-center space-y-3 shadow-sm">
            <Bot className="w-8 h-8 text-[#5145E5] mx-auto" />
            <h3 className="text-base font-bold text-[#17182B]">No Interview Sessions Found</h3>
            <p className="text-xs text-[#77788B] max-w-md mx-auto">
              Start an AI mock interview session to generate evaluated transcripts and diagnostic PDF dossiers.
            </p>
            <NavLink
              to="/mock-interviews"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-sm"
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
                className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4 hover:border-[#5145E5]/40 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {session.companyName && (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#EEF2FF] text-[#5145E5] font-mono text-xs font-bold border border-[#E0E7FF]">
                          {session.companyName}
                        </span>
                      )}
                      <span className="text-xs text-[#77788B] font-mono">
                        {session.interviewType}
                      </span>
                      <span className="text-xs text-[#5145E5] font-mono font-medium">
                        • {session.difficulty}
                      </span>
                      <span className="text-[11px] text-[#77788B] font-mono">
                        • {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[11px] text-[#77788B] font-mono">
                        ({session.durationMinutes} min)
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#17182B] tracking-tight">
                      {session.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-lg font-bold font-mono text-emerald-600">
                        {session.overallScore != null
                          ? `${Math.round(session.overallScore)}%`
                          : session.status}
                      </div>
                      <span className="text-[10px] text-[#77788B] font-semibold uppercase">
                        {session.overallScore != null ? 'Overall Score' : 'Session Status'}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedSessionId(isExpanded ? null : session.id)
                      }
                      className="p-2 rounded-xl bg-[#F7F7FC] hover:bg-[#EAEAF4] text-[#17182B] transition-colors border border-[#E2E4EB] cursor-pointer"
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F7F7FC] rounded-xl border border-[#E2E4EB] text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-[#77788B] text-[11px] mb-1">
                      <span>Technical</span>
                      <span className="text-[#5145E5] font-bold">{techScore}%</span>
                    </div>
                    <div className="w-full bg-[#E2E4EB] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#5145E5] h-full rounded-full"
                        style={{ width: `${techScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#77788B] text-[11px] mb-1">
                      <span>Conceptual</span>
                      <span className="text-cyan-700 font-bold">{concScore}%</span>
                    </div>
                    <div className="w-full bg-[#E2E4EB] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full"
                        style={{ width: `${concScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#77788B] text-[11px] mb-1">
                      <span>Completeness</span>
                      <span className="text-emerald-700 font-bold">{compScore}%</span>
                    </div>
                    <div className="w-full bg-[#E2E4EB] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${compScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#77788B] text-[11px] mb-1">
                      <span>Clarity</span>
                      <span className="text-amber-700 font-bold">{clarScore}%</span>
                    </div>
                    <div className="w-full bg-[#E2E4EB] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${clarScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {session.feedback?.summary && (
                  <p className="text-xs text-[#17182B] leading-relaxed">
                    <span className="text-[#77788B] font-semibold font-mono text-[11px] uppercase mr-1">
                      Examiner Summary:
                    </span>
                    {session.feedback.summary}
                  </p>
                )}

                {/* Expandable Q&A Transcript */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#E2E4EB] space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#5145E5] font-bold uppercase">
                        Q&amp;A Transcript &amp; Evaluator Notes
                      </span>
                      <span className="text-[#77788B]">
                        {session.questions?.length || 0} questions recorded
                      </span>
                    </div>

                    {(session.questions || []).map((q, qIndex) => (
                      <div
                        key={q.id || qIndex}
                        className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-[#17182B] leading-snug">
                            Q{qIndex + 1}. {q.prompt}
                          </h4>
                          {q.answer && (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-bold shrink-0">
                              {Math.round(q.answer.overallQuestionScore)}%
                            </span>
                          )}
                        </div>

                        {q.answer ? (
                          <>
                            <div className="p-3 rounded-lg bg-white border border-[#E2E4EB] font-mono text-[11px] text-[#17182B] whitespace-pre-wrap leading-relaxed shadow-2xs">
                              <span className="text-[#77788B] block mb-1 font-sans font-semibold text-[10px] uppercase">
                                Candidate Response:
                              </span>
                              {q.answer.answerText}
                            </div>
                            <div className="text-[11px] text-[#5145E5] font-mono">
                              <span className="text-[#77788B] font-sans font-semibold">Evaluator Note:</span>{' '}
                              {q.answer.examinerFeedback}
                            </div>
                          </>
                        ) : (
                          <div className="text-[11px] text-[#77788B] font-mono italic">
                            Not answered yet.
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => void handleFlagReview(session.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#F4F4FA] hover:bg-amber-50 border border-[#E2E4EB] text-xs font-medium text-[#77788B] hover:text-amber-800 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>Flag AI Evaluation</span>
                      </button>

                      <div className="flex flex-wrap items-center gap-3">
                        {session.status === 'COMPLETED' && (
                          <button
                            onClick={() => void handleExportPDF(session)}
                            disabled={downloadingId === session.id}
                            className="px-4 py-2 rounded-xl bg-[#F4F4FA] hover:bg-[#EAEAF4] border border-[#E2E4EB] text-xs font-semibold text-[#17182B] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Download className="w-3.5 h-3.5 text-[#5145E5]" />
                            <span>
                              {downloadingId === session.id
                                ? 'Generating PDF...'
                                : 'Export Verified PDF Dossier'}
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => handleRetakeRound(session)}
                          className="px-4 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
