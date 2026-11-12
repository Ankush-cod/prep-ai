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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  BackendInterviewSession,
  interviewService,
} from '../services/interviewService';

export const LiveAIInterviewRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [session, setSession] = useState<BackendInterviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [hintVisible, setHintVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (currentQuestion?.answer) {
      setAnswerText(currentQuestion.answer.answerText);
    } else {
      setAnswerText('');
    }
    setHintVisible(false);
  }, [currentQuestion?.id]);

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
        `Evaluated: ${res.evaluation.overallQuestionScore.toFixed(1)}/100`
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'AI answer evaluation failed.';
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
      const completed = await interviewService.completeSession(session.id);
      setSession(completed);
      showToast('Interview completed and final report generated!');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to finalize interview report.';
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
      showToast('PDF report downloaded');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to export PDF report',
        'warning'
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleFlagEvaluation = async () => {
    if (!session) return;
    try {
      await interviewService.flagSession(
        session.id,
        'Candidate requested evaluation review',
        `Flagged on question #${currentIndex + 1}`
      );
      showToast('Session flagged for admin review', 'info');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Unable to submit review flag',
        'warning'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-400">
        <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
        <p className="text-xs font-mono">Loading AI Interview Room...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 max-w-3xl mx-auto mt-12 rounded-2xl bg-[#242731] border border-[#353946] text-center space-y-4">
        <Bot className="w-10 h-10 text-purple-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Active Interview Session</h2>
        <p className="text-xs sm:text-sm text-gray-400">
          {error ||
            'Configure your branch, semester, topic, and difficulty to start a text-based Gemini mock interview.'}
        </p>
        <NavLink
          to="/mock-interviews"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
        >
          Configure New Interview
        </NavLink>
      </div>
    );
  }

  const answeredCount = session.questions.filter((q) => q.answer).length;
  const activeEvaluation = currentQuestion?.answer || null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Session Header */}
      <div className="bg-[#242731] border border-[#353946] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-gray-400 mb-1">
            <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/20 font-semibold">
              {session.interviewType} • {session.difficulty}
            </span>
            <span>
              Question {currentIndex + 1} of {session.questions.length}
            </span>
            <span className="text-emerald-400">
              {answeredCount}/{session.questions.length} Answered
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {session.title}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Topic: {session.topic} · Status: {session.status}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#20232C] border border-[#353946] text-white font-mono text-xs">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>{session.durationMinutes}m Target</span>
          </div>

          {session.status === 'COMPLETED' ? (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#353946] text-xs text-gray-300 flex items-center gap-1 cursor-pointer"
            title="Flag evaluation for admin review"
          >
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span>Flag</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 flex items-start gap-2.5 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Completed Final Report View */}
      {session.status === 'COMPLETED' && session.feedback && (
        <section className="bg-[#242731] border border-purple-500/30 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#353946] pb-4">
            <div>
              <span className="font-mono text-[11px] uppercase text-purple-300">
                Final Interview Report ({session.feedback.reportProvider.toUpperCase()})
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Overall Score: {session.feedback.overallScore.toFixed(1)} / 100
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/interview-history')}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#353946] text-xs text-gray-200 cursor-pointer"
              >
                View All History
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-200 leading-relaxed">{session.feedback.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#20232C] border border-emerald-500/20 space-y-2">
              <span className="font-mono font-bold text-emerald-400 uppercase text-[10px]">
                Strengths
              </span>
              <ul className="space-y-1 text-gray-300 list-disc pl-4">
                {session.feedback.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#20232C] border border-amber-500/20 space-y-2">
              <span className="font-mono font-bold text-amber-400 uppercase text-[10px]">
                Weaknesses
              </span>
              <ul className="space-y-1 text-gray-300 list-disc pl-4">
                {session.feedback.weaknesses.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#20232C] border border-red-500/20 space-y-2">
              <span className="font-mono font-bold text-red-400 uppercase text-[10px]">
                Missing Concepts
              </span>
              <ul className="space-y-1 text-gray-300 list-disc pl-4">
                {session.feedback.missingConcepts.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {Array.isArray(session.feedback.preparationRoadmap) &&
            session.feedback.preparationRoadmap.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Personalized Preparation Roadmap
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {session.feedback.preparationRoadmap.map((step, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#20232C] border border-white/5 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-purple-300 font-bold">
                          {step.phase}
                        </span>
                        {step.estimatedHours && (
                          <span className="text-[11px] font-mono text-gray-500">
                            ~{step.estimatedHours} hrs
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-white">{step.focusTopic}</p>
                      <ul className="text-gray-400 space-y-1 list-disc pl-4">
                        {step.actionItems.map((item, k) => (
                          <li key={k}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </section>
      )}

      {/* Question Navigator Strip */}
      <div className="flex items-center justify-between gap-3 bg-[#242731] border border-[#353946] rounded-xl px-4 py-2.5">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs text-gray-300 flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {session.questions.map((q, idx) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'bg-purple-600 text-white font-semibold'
                  : q.answer
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-[#20232C] text-gray-400 border border-white/5'
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
          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs text-gray-300 flex items-center gap-1 cursor-pointer"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dual Column Workspace */}
      {currentQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Question Prompt & Answer Editor */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-mono uppercase bg-purple-500/15 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                  {currentQuestion.isFollowUp && <Sparkles className="w-3 h-3" />}
                  {currentQuestion.isFollowUp
                    ? `FOLLOW-UP PROBE #0${currentIndex + 1}`
                    : `QUESTION #0${currentIndex + 1}`}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {currentQuestion.topic || session.topic}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQuestion.prompt}
              </h2>

              {hintVisible && currentQuestion.hint && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200">
                  <span className="font-bold text-purple-300 block mb-1">Examiner Hint:</span>
                  {currentQuestion.hint}
                </div>
              )}
            </div>

            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-gray-300">
                  Candidate Written Response
                </span>
                <span className="text-gray-500 font-mono text-[11px]">
                  {answerText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                readOnly={Boolean(activeEvaluation) || session.status !== 'IN_PROGRESS'}
                rows={12}
                className="w-full bg-[#20232C] border border-[#353946] rounded-xl p-4 font-mono text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 leading-relaxed resize-y"
                placeholder="Write a structured, technically accurate explanation covering architecture, tradeoffs, and edge cases..."
              />

              {!activeEvaluation && session.status === 'IN_PROGRESS' && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {currentQuestion.hint && (
                      <button
                        type="button"
                        onClick={() => setHintVisible((v) => !v)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                        <span>{hintVisible ? 'Hide Hint' : 'Request Hint'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setAnswerText('')}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-xs flex items-center gap-2 shadow-[0_0_16px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Gemini Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Answer for Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live 6-Dimension AI Evaluation */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  AI Evaluation Rubric
                </h3>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {activeEvaluation
                    ? `${activeEvaluation.overallQuestionScore.toFixed(1)}%`
                    : 'Pending'}
                </span>
              </div>

              {activeEvaluation ? (
                <>
                  <div className="space-y-3 text-xs">
                    {[
                      { label: 'Technical Correctness', score: activeEvaluation.technicalScore },
                      { label: 'Conceptual Understanding', score: activeEvaluation.conceptualScore },
                      { label: 'Clarity', score: activeEvaluation.clarityScore },
                      { label: 'Communication', score: activeEvaluation.communicationScore },
                      { label: 'Completeness', score: activeEvaluation.completenessScore },
                      { label: 'Problem-Solving', score: activeEvaluation.problemSolvingScore },
                    ].map((metric) => (
                      <div key={metric.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-300">{metric.label}</span>
                          <span className="text-purple-300 font-mono font-bold">
                            {metric.score.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-[#20232C] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, metric.score))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeEvaluation.missingConcepts.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-amber-400 block">
                        Missing Concepts
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeEvaluation.missingConcepts.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[10px]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-[#20232C] border border-white/5 text-xs text-gray-300 space-y-1">
                    <span className="font-semibold text-purple-400 uppercase font-mono text-[10px] block">
                      Examiner Feedback:
                    </span>
                    <p className="leading-relaxed">{activeEvaluation.examinerFeedback}</p>
                  </div>

                  {currentIndex < session.questions.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((i) => i + 1)}
                      className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue to Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-xl bg-[#20232C] border border-white/5 text-xs text-gray-400 leading-relaxed">
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
