// src/pages/LiveAIInterviewRoom.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  Clock,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Download,
  HelpCircle,
  Loader2,
  Sparkles,
  Flag,
  ChevronRight,
  ChevronLeft,
  Bot,
  BookOpen,
  Code2,
  CheckSquare,
  ExternalLink,
  FileText,
  RefreshCw,
  Layers,
  Award,
  Target,
  Brain,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  BackendInterviewSession,
  PersonalizedRecommendation,
  StudyNotesData,
  interviewService,
} from '../services/interviewService';

export const LiveAIInterviewRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [session, setSession] = useState<BackendInterviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [hintVisible, setHintVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post-Interview Expanded Features
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'study_notes'>('overview');
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [studyNotes, setStudyNotes] = useState<StudyNotesData | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isDownloadingNotesPdf, setIsDownloadingNotesPdf] = useState(false);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let loaded: BackendInterviewSession | null = null;
      if (sessionId) {
        loaded = await interviewService.getSessionById(sessionId);
      } else {
        const list = await interviewService.listSessions();
        loaded =
          list.find((s) => s.status === 'IN_PROGRESS') || list[0] || null;
      }

      setSession(loaded);
      if (loaded && loaded.questions.length > 0) {
        const firstUnanswered = loaded.questions.findIndex((q) => !q.answer);
        setCurrentIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load interview session.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const currentQuestion = session?.questions[currentIndex] || null;

  // Restore draft or existing submitted answer when navigating between questions
  useEffect(() => {
    if (!currentQuestion) return;
    if (draftAnswers[currentQuestion.id] !== undefined) {
      setAnswerText(draftAnswers[currentQuestion.id]);
    } else if (currentQuestion.answer) {
      setAnswerText(currentQuestion.answer.answerText);
    } else {
      setAnswerText('');
    }
    setHintVisible(false);
  }, [currentQuestion?.id]);

  const handleAnswerChange = (val: string) => {
    setAnswerText(val);
    if (currentQuestion) {
      setDraftAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
    }
  };

  // Load recommendations and cached study notes if completed
  useEffect(() => {
    if (session?.status === 'COMPLETED' && session.id) {
      setIsLoadingRecs(true);
      interviewService
        .getRecommendations(session.id)
        .then((recs) => setRecommendations(recs))
        .catch((err) => console.warn('Could not load recommendations:', err))
        .finally(() => setIsLoadingRecs(false));

      interviewService
        .getStudyNotes(session.id)
        .then((notes) => {
          if (notes) setStudyNotes(notes);
        })
        .catch(() => {});
    }
  }, [session?.status, session?.id]);

  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion) return;
    if (answerText.trim().length < 10) {
      showToast('Please enter at least 10 characters before submitting.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await interviewService.submitAnswer(
        session.id,
        currentQuestion.id,
        answerText.trim()
      );
      setSession(res.session);
      showToast(
        `Evaluated: ${res.evaluation.overallQuestionScore.toFixed(1)}/100`,
        'success'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit response';
      setError(msg);
      showToast(msg, 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!session) return;
    setIsCompleting(true);
    setError(null);
    try {
      const res = await interviewService.completeInterview(session.id);
      const updated = (res as any)?.session || res;
      setSession(updated);
      showToast('Interview session completed. Evaluation report ready.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to finalize session';
      setError(msg);
      showToast(msg, 'warning');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!session) return;
    setIsDownloadingPdf(true);
    try {
      await interviewService.downloadPdfReport(session.id);
      showToast('Downloaded PDF report');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to download PDF',
        'warning'
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleGenerateNotes = async (regenerate = false) => {
    if (!session) return;
    setIsGeneratingNotes(true);
    try {
      const notes = await interviewService.generateStudyNotes(session.id, regenerate);
      setStudyNotes(notes);
      showToast('Personalized Study Notes compiled with Gemini.', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to generate study notes',
        'warning'
      );
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleDownloadNotesPdf = async () => {
    if (!session) return;
    setIsDownloadingNotesPdf(true);
    try {
      await interviewService.downloadStudyNotesPdf(session.id);
      showToast('Downloaded Study Notes PDF Dossier');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to download PDF dossier',
        'warning'
      );
    } finally {
      setIsDownloadingNotesPdf(false);
    }
  };

  const handleFlagEvaluation = async () => {
    if (!session) return;
    const reason = window.prompt(
      'Enter the reason for flagging this evaluation for admin moderation:'
    );
    if (!reason || !reason.trim()) return;

    try {
      await interviewService.flagSession(
        session.id,
        reason.trim(),
        `Question: ${currentQuestion?.prompt || 'General Session'}`
      );
      showToast('Session flagged for administrative audit.');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to submit review flag',
        'warning'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm" />
          <div className="lg:col-span-4 h-96 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm" />
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Interview Session Inaccessible</span>
          </div>
          <p className="text-xs text-[#77788B]">{error}</p>
          <div className="pt-2">
            <NavLink
              to="/mock-interviews"
              className="px-4 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
            >
              <Bot className="w-4 h-4" />
              <span>Configure New Mock Interview</span>
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const answeredCount = session.questions.filter((q) => Boolean(q.answer)).length;
  // In our Prisma schema, the evaluation metrics are directly attached to currentQuestion.answer
  const activeEvaluation = currentQuestion?.answer || null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. SESSION CONTROL BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-[#E2E4EB] rounded-2xl p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#77788B]">
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#5145E5] border border-[#E0E7FF] font-semibold">
              {session.interviewType} • {session.difficulty}
            </span>
            <span>
              Question {currentIndex + 1} of {session.questions.length}
            </span>
            <span className="text-emerald-600 font-semibold">
              {answeredCount}/{session.questions.length} Answered
            </span>
            {session.mode && (
              <span className="px-2 py-0.5 rounded-md bg-[#F4F4FA] text-[#77788B] border border-[#E2E4EB] font-mono">
                {session.mode}
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#17182B]">
            {session.title}
          </h1>
          <p className="text-xs text-[#77788B]">
            Topic: {session.topic} · Status: {session.status}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] text-[#17182B] font-mono text-xs">
            <Clock className="w-4 h-4 text-[#5145E5]" />
            <span>{session.durationMinutes}m Target</span>
          </div>

          {session.status === 'COMPLETED' ? (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download PDF Report</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteInterview}
              disabled={isCompleting || answeredCount === 0}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {isCompleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Finish & Generate Report</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleFlagEvaluation}
            className="px-3 py-1.5 rounded-xl bg-[#F7F7FC] hover:bg-[#EAEAF4] border border-[#E2E4EB] text-xs text-[#77788B] hover:text-[#17182B] flex items-center gap-1 cursor-pointer"
            title="Flag evaluation for admin review"
          >
            <Flag className="w-3.5 h-3.5 text-amber-500" />
            <span>Flag</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-800 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* COMPLETED INTERVIEW MASTER DOSSIER */}
      {session.status === 'COMPLETED' && session.feedback && (
        <section className="bg-white border border-[#5145E5]/30 rounded-2xl p-6 space-y-6 shadow-sm">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E4EB] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase text-[#5145E5] font-bold">
                  Final Evaluation ({session.feedback.reportProvider.toUpperCase()})
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
                  COMPLETED
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#17182B] mt-0.5">
                Overall Score: {session.feedback.overallScore.toFixed(1)} / 100
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#5145E5] text-white border-[#5145E5]'
                    : 'bg-[#F4F4FA] text-[#17182B] border-[#E2E4EB] hover:bg-[#EAEAF4]'
                }`}
              >
                Score Breakdown
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recommendations')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                  activeTab === 'recommendations'
                    ? 'bg-[#5145E5] text-white border-[#5145E5]'
                    : 'bg-[#F4F4FA] text-[#17182B] border-[#E2E4EB] hover:bg-[#EAEAF4]'
                }`}
              >
                Recommendations ({recommendations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('study_notes')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                  activeTab === 'study_notes'
                    ? 'bg-[#5145E5] text-white border-[#5145E5]'
                    : 'bg-[#F4F4FA] text-[#17182B] border-[#E2E4EB] hover:bg-[#EAEAF4]'
                }`}
              >
                Study Notes Dossier
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & 6-DIMENSION BREAKDOWN */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <p className="text-sm text-[#17182B] leading-relaxed bg-[#F7F7FC] p-4 rounded-xl border border-[#E2E4EB]">
                {session.feedback.summary}
              </p>

              {/* Six-Dimensional Performance Metrics */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#5145E5] font-bold mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Six-Dimensional Technical Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Technical Depth', val: session.technicalScore ?? session.feedback.overallScore },
                    { label: 'Conceptual Clarity', val: session.conceptualScore ?? session.feedback.overallScore },
                    { label: 'Structure & Detail', val: session.clarityScore ?? session.feedback.overallScore },
                    { label: 'Communication', val: session.communicationScore ?? session.feedback.overallScore },
                    { label: 'Completeness', val: session.completenessScore ?? session.feedback.overallScore },
                    { label: 'Problem Solving', val: session.problemSolvingScore ?? session.feedback.overallScore },
                  ].map((dim) => (
                    <div
                      key={dim.label}
                      className="p-3.5 rounded-xl bg-white border border-[#E2E4EB] space-y-2 text-center"
                    >
                      <span className="text-[11px] text-[#77788B] font-medium block h-8 flex items-center justify-center">
                        {dim.label}
                      </span>
                      <span className="text-lg font-bold font-mono text-[#5145E5]">
                        {dim.val.toFixed(0)}%
                      </span>
                      <div className="w-full bg-[#F4F4FA] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#5145E5] h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, dim.val))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Performance Breakdown (if present) */}
              {session.feedback.categoryScores && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#5145E5] font-bold mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    Category-Wise Mastery Breakdown
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(session.feedback.categoryScores).map(([cat, score]) => (
                      <div key={cat} className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-[#17182B]">{cat}</span>
                          <span className="font-mono font-bold text-[#5145E5]">{score}%</span>
                        </div>
                        <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#E2E4EB]">
                          <div
                            className={`h-full rounded-full ${
                              score >= 75 ? 'bg-emerald-500' : score >= 60 ? 'bg-[#5145E5]' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths, Refinement & Missing Concepts Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <span className="font-mono font-bold text-emerald-800 uppercase text-[10px]">
                    Strengths
                  </span>
                  <ul className="space-y-1 text-emerald-950 list-disc pl-4">
                    {session.feedback.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <span className="font-mono font-bold text-amber-800 uppercase text-[10px]">
                    Areas to Refine
                  </span>
                  <ul className="space-y-1 text-amber-950 list-disc pl-4">
                    {session.feedback.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
                  <span className="font-mono font-bold text-rose-800 uppercase text-[10px]">
                    Missing Concepts Flagged
                  </span>
                  <ul className="space-y-1 text-rose-950 list-disc pl-4">
                    {session.feedback.missingConcepts.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Roadmap */}
              {Array.isArray(session.feedback.preparationRoadmap) &&
                session.feedback.preparationRoadmap.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#5145E5] font-bold">
                      Personalized Preparation Roadmap
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {session.feedback.preparationRoadmap.map((step, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[#5145E5] font-bold">
                              {step.phase}
                            </span>
                            {step.estimatedHours && (
                              <span className="text-[11px] font-mono text-[#77788B]">
                                ~{step.estimatedHours} hrs
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-[#17182B]">{step.focusTopic}</p>
                          <ul className="text-[#77788B] space-y-1 list-disc pl-4">
                            {step.actionItems.map((item, k) => (
                              <li key={k}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* TAB 2: PERSONALIZED LEARNING RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#17182B]">
                    Gaps-Based Learning & Practice Recommendations
                  </h3>
                  <p className="text-xs text-[#77788B]">
                    Dynamically mapped from your interview evaluation gaps to verified campus resources and Striver benchmark problems.
                  </p>
                </div>
                {isLoadingRecs && <Loader2 className="w-4 h-4 animate-spin text-[#5145E5]" />}
              </div>

              {recommendations.length === 0 && !isLoadingRecs ? (
                <div className="p-8 text-center bg-[#F7F7FC] rounded-2xl border border-[#E2E4EB]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-[#17182B] font-semibold">
                    Outstanding evaluation! No critical technical gaps identified.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-5 rounded-2xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#17182B] text-sm">{rec.topic}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              rec.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : rec.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {rec.priority} PRIORITY
                          </span>
                          <span className="text-[11px] font-mono text-[#77788B]">
                            ~{rec.estimatedHours}h
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#77788B] leading-relaxed italic bg-white p-2.5 rounded-lg border border-[#E2E4EB]">
                        "{rec.reason}"
                      </p>

                      {/* Resources */}
                      {rec.resources.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] uppercase font-mono font-bold text-[#5145E5] flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Core Learning Resources
                          </span>
                          <div className="space-y-1">
                            {rec.resources.map((res) => (
                              <NavLink
                                key={res.id}
                                to={`/resources`}
                                className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E2E4EB] hover:border-[#5145E5] text-[#17182B] transition-colors"
                              >
                                <span className="font-medium truncate max-w-[220px]">
                                  {res.title}
                                </span>
                                <span className="text-[10px] font-mono text-[#5145E5] uppercase">
                                  {res.format}
                                </span>
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Practice Problems */}
                      {rec.practiceProblems.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 flex items-center gap-1">
                            <Code2 className="w-3 h-3" /> Recommended Coding Problems
                          </span>
                          <div className="space-y-1">
                            {rec.practiceProblems.map((prob) => (
                              <NavLink
                                key={prob.id}
                                to={`/coding?problem=${prob.slug}`}
                                className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E2E4EB] hover:border-emerald-500 text-[#17182B] transition-colors"
                              >
                                <span className="font-medium truncate max-w-[220px]">
                                  {prob.title}
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-semibold ${
                                    prob.difficulty === 'EASY'
                                      ? 'text-emerald-600'
                                      : prob.difficulty === 'MEDIUM'
                                      ? 'text-amber-600'
                                      : 'text-rose-600'
                                  }`}
                                >
                                  {prob.difficulty}
                                </span>
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PERSONALIZED STUDY NOTES DOSSIER */}
          {activeTab === 'study_notes' && (
            <div className="space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#EEF2FF] border border-[#E0E7FF] p-4 rounded-xl">
                <div>
                  <h3 className="text-sm font-bold text-[#5145E5] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    AI-Synthesized Mastery Dossier
                  </h3>
                  <p className="text-[11px] text-[#4338CA]">
                    Deep conceptual definitions, production code patterns, critical interview answers, and revision checklists.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateNotes(Boolean(studyNotes))}
                    disabled={isGeneratingNotes}
                    className="px-3 py-1.5 rounded-xl bg-white text-[#5145E5] hover:bg-slate-50 border border-[#E0E7FF] font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isGeneratingNotes ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>{studyNotes ? 'Regenerate Dossier' : 'Generate Study Notes with Gemini'}</span>
                  </button>

                  {studyNotes && (
                    <button
                      type="button"
                      onClick={handleDownloadNotesPdf}
                      disabled={isDownloadingNotesPdf}
                      className="px-3.5 py-1.5 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {isDownloadingNotesPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Download Study Notes PDF</span>
                    </button>
                  )}
                </div>
              </div>

              {!studyNotes && !isGeneratingNotes ? (
                <div className="p-8 text-center bg-[#F7F7FC] rounded-2xl border border-[#E2E4EB] space-y-3">
                  <Brain className="w-8 h-8 text-[#5145E5] mx-auto" />
                  <p className="text-xs text-[#17182B] font-semibold">
                    Generate your personalized technical study notes dossier tailored specifically to the gaps detected in this interview.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerateNotes(false)}
                    className="px-4 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold text-xs cursor-pointer shadow-sm"
                  >
                    Generate Dossier Now
                  </button>
                </div>
              ) : studyNotes ? (
                <div className="space-y-5">
                  {/* Executive Summary */}
                  <div className="p-4 rounded-xl bg-white border border-[#E2E4EB] space-y-1.5">
                    <span className="font-mono uppercase text-[#5145E5] font-bold text-[10px]">
                      Executive Technical Summary
                    </span>
                    <p className="text-xs text-[#17182B] leading-relaxed">
                      {studyNotes.executiveSummary}
                    </p>
                  </div>

                  {/* Key Definitions */}
                  {studyNotes.keyDefinitions?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-mono uppercase text-[#5145E5] font-bold text-xs">
                        Key Rigorous Definitions & Mental Models
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {studyNotes.keyDefinitions.map((def, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-1"
                          >
                            <span className="font-bold text-[#17182B] text-xs block">
                              {def.term}
                            </span>
                            <p className="text-[11px] text-[#17182B]">{def.definition}</p>
                            <span className="text-[10px] font-mono text-[#5145E5] block pt-1 font-semibold">
                              Takeaway: {def.keyTakeaway}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Core Concepts */}
                  {studyNotes.coreConcepts?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-mono uppercase text-[#5145E5] font-bold text-xs">
                        Core Concepts & System Invariants
                      </h4>
                      <div className="space-y-3">
                        {studyNotes.coreConcepts.map((cc, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-white border border-[#E2E4EB] space-y-2"
                          >
                            <span className="font-bold text-[#17182B] text-xs block">
                              {cc.concept}
                            </span>
                            <p className="text-xs text-[#17182B] leading-relaxed">
                              {cc.detailedExplanation}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                                <span className="font-bold text-slate-700 block text-[10px] uppercase">
                                  Practical Example:
                                </span>
                                <span>{cc.practicalExample}</span>
                              </div>
                              {cc.edgeCases && (
                                <div className="p-2 rounded bg-amber-50 border border-amber-200">
                                  <span className="font-bold text-amber-800 block text-[10px] uppercase">
                                    Edge Cases & Pitfalls:
                                  </span>
                                  <span>{cc.edgeCases}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Algorithms & Code Snippets */}
                  {studyNotes.algorithmsAndPatterns?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-mono uppercase text-[#5145E5] font-bold text-xs">
                        Idiomatic Algorithms & Code Patterns
                      </h4>
                      <div className="space-y-3">
                        {studyNotes.algorithmsAndPatterns.map((alg, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="font-bold text-white text-xs">{alg.name}</span>
                              <span className="text-[11px] text-emerald-400 font-mono">
                                {alg.complexity}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans">{alg.description}</p>
                            <pre className="p-3 bg-slate-950 rounded-lg overflow-x-auto text-[11px] text-emerald-300">
                              <code>{alg.codeSnippet}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Critical Interview Questions */}
                  {studyNotes.criticalInterviewQuestions?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-mono uppercase text-[#5145E5] font-bold text-xs">
                        High-Yield Placement Interview Questions
                      </h4>
                      <div className="space-y-3">
                        {studyNotes.criticalInterviewQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-white border border-[#E2E4EB] space-y-2"
                          >
                            <span className="font-bold text-[#17182B] text-xs block">
                              Q{idx + 1}: {q.question}
                            </span>
                            <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-950 text-xs">
                              <span className="font-bold font-mono text-[10px] uppercase text-emerald-800 block mb-0.5">
                                Ideal Response:
                              </span>
                              {q.idealAnswer}
                            </div>
                            <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200 text-rose-950 text-xs">
                              <span className="font-bold font-mono text-[10px] uppercase text-rose-800 block mb-0.5">
                                Common Pitfalls to Avoid:
                              </span>
                              {q.commonPitfalls}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Revision Checklist */}
                  {studyNotes.revisionChecklist?.length > 0 && (
                    <div className="p-4 rounded-xl bg-white border border-[#E2E4EB] space-y-2">
                      <h4 className="font-mono uppercase text-[#5145E5] font-bold text-xs flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4" />
                        Final Revision Checklist
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[#17182B]">
                        {studyNotes.revisionChecklist.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </section>
      )}

      {/* QUESTION NAVIGATOR STRIP */}
      <div className="flex items-center justify-between gap-3 bg-white border border-[#E2E4EB] rounded-2xl px-4 py-2.5 shadow-sm">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="px-3 py-1 rounded-lg bg-[#F4F4FA] hover:bg-[#EAEAF4] disabled:opacity-40 text-xs font-medium text-[#17182B] flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {session.questions.map((q, idx) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'bg-[#5145E5] text-white font-bold shadow-xs'
                  : q.answer
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                  : 'bg-[#F7F7FC] text-[#77788B] border border-[#E2E4EB] hover:text-[#17182B]'
              }`}
            >
              Q{idx + 1}
              {q.isFollowUp ? ' (FU)' : ''}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={currentIndex >= session.questions.length - 1}
          onClick={() =>
            setCurrentIndex((i) => Math.min(session.questions.length - 1, i + 1))
          }
          className="px-3 py-1 rounded-lg bg-[#F4F4FA] hover:bg-[#EAEAF4] disabled:opacity-40 text-xs font-medium text-[#17182B] flex items-center gap-1 cursor-pointer"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* DUAL COLUMN WORKSPACE */}
      {currentQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Question Prompt & Answer Editor */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-mono uppercase bg-[#EEF2FF] text-[#5145E5] border border-[#E0E7FF] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  {currentQuestion.isFollowUp && <Sparkles className="w-3 h-3" />}
                  {currentQuestion.isFollowUp
                    ? `FOLLOW-UP PROBE #0${currentIndex + 1}`
                    : `QUESTION #0${currentIndex + 1}`}
                </span>
                <span className="text-xs text-[#77788B] font-mono">
                  {currentQuestion.topic || session.topic}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-[#17182B] leading-relaxed">
                {currentQuestion.prompt}
              </h2>

              {hintVisible && currentQuestion.hint && (
                <div className="p-3.5 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] text-xs text-[#17182B]">
                  <span className="font-bold text-[#5145E5] block mb-1">Examiner Socratic Hint:</span>
                  {currentQuestion.hint}
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E2E4EB] rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wider text-[#17182B]">
                    Candidate Written Explanation
                  </span>
                  {currentQuestion.answer && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-mono font-semibold border border-emerald-200">
                      Answered (Editable)
                    </span>
                  )}
                </div>
                <span className="text-[#77788B] font-mono text-[11px]">
                  {answerText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <textarea
                value={answerText}
                onChange={(e) => handleAnswerChange(e.target.value)}
                readOnly={session.status !== 'IN_PROGRESS'}
                rows={11}
                className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-4 font-mono text-xs text-[#17182B] placeholder-[#77788B] focus:outline-none focus:border-[#5145E5] focus:bg-white leading-relaxed resize-y"
                placeholder="Write a structured, technically accurate explanation covering algorithms, architecture, tradeoffs, and edge cases..."
              />

              {session.status === 'IN_PROGRESS' && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {currentQuestion.hint && (
                      <button
                        type="button"
                        onClick={() => setHintVisible((v) => !v)}
                        className="px-3 py-1.5 rounded-lg bg-[#F4F4FA] hover:bg-[#EAEAF4] text-xs text-[#17182B] font-medium flex items-center gap-1.5 cursor-pointer border border-[#E2E4EB]"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#5145E5]" />
                        <span>{hintVisible ? 'Hide Hint' : 'Request Hint'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAnswerChange('')}
                      className="px-3 py-1.5 rounded-lg bg-[#F4F4FA] hover:bg-[#EAEAF4] text-xs text-[#77788B] hover:text-[#17182B] flex items-center gap-1.5 cursor-pointer border border-[#E2E4EB]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] disabled:opacity-60 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Gemini Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {currentQuestion.answer ? 'Update Answer & Re-evaluate' : 'Submit Response'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live 6-Dimension AI Evaluation */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E2E4EB] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17182B]">
                  Evaluation Rubric
                </h3>
                <span className="text-sm font-bold font-mono text-emerald-600">
                  {activeEvaluation
                    ? `${activeEvaluation.overallQuestionScore.toFixed(1)}%`
                    : 'Pending'}
                </span>
              </div>

              {activeEvaluation ? (
                <>
                  <div className="space-y-3 text-xs">
                    {[
                      { label: 'Technical Depth', score: activeEvaluation.technicalScore },
                      { label: 'Conceptual Clarity', score: activeEvaluation.conceptualScore },
                      { label: 'Structure & Detail', score: activeEvaluation.clarityScore },
                      { label: 'Communication', score: activeEvaluation.communicationScore },
                      { label: 'Completeness', score: activeEvaluation.completenessScore },
                      { label: 'Problem-Solving', score: activeEvaluation.problemSolvingScore },
                    ].map((metric) => (
                      <div key={metric.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[#17182B] font-medium">{metric.label}</span>
                          <span className="text-[#5145E5] font-mono font-bold">
                            {metric.score.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-[#F4F4FA] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#5145E5] h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, metric.score))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeEvaluation.missingConcepts && activeEvaluation.missingConcepts.length > 0 && (
                    <div className="pt-2 border-t border-[#F0F1F5] space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-amber-700 font-bold block">
                        Concepts to Strengthen:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeEvaluation.missingConcepts.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px] font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] text-xs text-[#17182B] space-y-1">
                    <span className="font-semibold text-[#5145E5] uppercase font-mono text-[10px] block">
                      Examiner Socratic Feedback:
                    </span>
                    <p className="leading-relaxed">{activeEvaluation.examinerFeedback}</p>
                  </div>

                  {currentIndex < session.questions.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((i) => i + 1)}
                      className="w-full py-2.5 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#E0E7FF] text-[#5145E5] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Continue to Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] text-xs text-[#77788B] leading-relaxed">
                  Submit your response to receive a 6-dimension evaluation from Gemini and generate targeted follow-up questions.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
