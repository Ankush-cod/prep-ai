// src/pages/UserDashboard.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  ArrowRight,
  Bot,
  Terminal,
  CheckCircle2,
  Flame,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  Bookmark,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';
import {
  AnalyticsPayload,
  DashboardPayload,
  analyticsService,
} from '../services/analyticsService';

export const UserDashboard: React.FC = () => {
  const { profile } = useApp();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dash, stats] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getAnalytics().catch(() => null),
      ]);
      setDashboard(dash);
      setAnalytics(stats);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load dashboard telemetry.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 rounded-2xl bg-[#242731] border border-[#353946]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-[#242731] border border-[#353946]"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-72 rounded-2xl bg-[#242731] border border-[#353946]" />
          <div className="lg:col-span-4 h-72 rounded-2xl bg-[#242731] border border-[#353946]" />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-[#242731] border border-red-500/30 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Unable to load Dashboard</span>
          </div>
          <p className="text-xs text-gray-400">{error || 'No telemetry returned.'}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { academicInfo, summaryMetrics, recentInterviews, recentActivity, recommendedTopics } =
    dashboard;

  const branchCode = academicInfo.branch || profile.branch || 'CSE';
  const branchLabel = academicInfo.branchName || `${branchCode} Track`;
  const semesterLabel = academicInfo.semester ? `Semester ${academicInfo.semester}` : 'Semester Unset';
  const completionPct =
    summaryMetrics.totalProblemsCount > 0
      ? Math.round(
          (summaryMetrics.solvedProblemsCount / summaryMetrics.totalProblemsCount) * 100
        )
      : 0;
  const dims = analytics?.dimensionAverages;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. TOP BANNER / STUDENT PLACEMENT COCKPIT */}
      <section className="relative rounded-2xl bg-[#242731] border border-[#353946] p-6 lg:p-8 shadow-xl overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-cyan-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-gray-400">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#20232C] text-emerald-400 font-medium border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SESSION_ACTIVE
              </span>
              <span>•</span>
              <span className="text-purple-300">
                {branchCode} Track • Year {academicInfo.academicYear ?? 1} • {semesterLabel}
              </span>
              {academicInfo.institution && (
                <>
                  <span>•</span>
                  <span className="text-gray-300">{academicInfo.institution}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back, {academicInfo.fullName}
              </h1>
              {profile.rollNumber && (
                <span className="font-mono text-xs text-gray-400">
                  {profile.rollNumber}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              {recommendedTopics.length > 0 ? (
                <>
                  Recommended focus based on your current telemetry:{' '}
                  <span className="text-white font-medium">
                    {recommendedTopics.slice(0, 2).join(', ')}
                  </span>
                  . Continue with a tailored AI mock interview or solve coding challenges below.
                </>
              ) : (
                'Complete an AI mock interview or coding practice problem to populate your diagnostic performance telemetry.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {profile.skills.languages.length > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-[#20232C] border border-white/5 text-gray-300 font-mono text-xs">
                  {profile.skills.languages.map((l) => l.name).slice(0, 3).join(' • ')}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-[#20232C] border border-white/5 text-cyan-400 font-mono text-xs flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5" />
                {summaryMetrics.bookmarkCount} Bookmarks
              </span>
              {academicInfo.cgpa != null && academicInfo.cgpa > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/20 font-mono text-xs font-medium flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  CGPA {academicInfo.cgpa.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 xl:self-end shrink-0">
            <NavLink
              to="/mock-interviews"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Start AI Mock Interview</span>
            </NavLink>
            <NavLink
              to="/coding-practice"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25262e] hover:bg-[#2e2f38] text-gray-200 border border-[#353946] text-xs font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Terminal className="w-4 h-4 text-gray-400" />
              <span>Open Coding Sandbox</span>
            </NavLink>
          </div>
        </div>
      </section>

      {/* 2. FOUR TELEMETRY METRIC CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Avg Interview Score */}
        <div className="rounded-2xl bg-[#242731] border border-[#353946] p-5 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Interview Readiness
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-xs font-mono font-medium flex items-center gap-1 border border-purple-500/20">
              <TrendingUp className="w-3 h-3" />
              {summaryMetrics.completedInterviews > 0 ? 'Evaluated' : 'Baseline'}
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl lg:text-4xl font-bold tracking-tight text-white font-mono">
                {Math.round(summaryMetrics.averageInterviewScore)}
              </span>
              <span className="text-xs text-gray-500 font-mono">/100</span>
            </div>
            <span className="text-xs font-mono text-gray-400">
              {summaryMetrics.completedInterviews} scored
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="w-full bg-[#20232C] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, summaryMetrics.averageInterviewScore)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
              <span>Total Sessions: {summaryMetrics.totalInterviews}</span>
              <span>Completed: {summaryMetrics.completedInterviews}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Problems Solved */}
        <div className="rounded-2xl bg-[#242731] border border-[#353946] p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Problems Solved
            </span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-xs font-mono font-medium border border-cyan-500/20">
              {summaryMetrics.totalSubmissions} runs
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl lg:text-4xl font-bold tracking-tight text-white font-mono">
                {summaryMetrics.solvedProblemsCount}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                /{summaryMetrics.totalProblemsCount}
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              {completionPct}%
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="w-full bg-[#20232C] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
              <span>Sandbox Verified</span>
              <span>Acceptance Tracked</span>
            </div>
          </div>
        </div>

        {/* Card 3: Activity Streak */}
        <div className="rounded-2xl bg-[#242731] border border-[#353946] p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Active Streak
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl lg:text-4xl font-bold tracking-tight text-white font-mono">
                {summaryMetrics.streakDays}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {summaryMetrics.streakDays === 1 ? 'day' : 'days'}
              </span>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Recorded
            </span>
          </div>
          <div className="space-y-1.5 pt-1 text-[10px] font-mono text-gray-400 border-t border-white/5">
            <span>Calculated from interview & coding submission timestamps</span>
          </div>
        </div>

        {/* Card 4: Focus Area */}
        <div className="rounded-2xl bg-[#242731] border border-amber-500/30 p-5 flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Next Focus Area
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono">
              Target
            </span>
          </div>
          <div className="my-2">
            <h4 className="text-sm font-bold text-white leading-tight">
              {recommendedTopics[0] || `${branchCode} Core Fundamentals`}
            </h4>
            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
              {recommendedTopics.length > 0
                ? 'Derived from your lowest evaluated interview topic.'
                : 'Practice a mock round or resume-based session to generate custom targets.'}
            </p>
          </div>
          <NavLink
            to="/mock-interviews"
            className="w-full py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
          >
            <span>Start Targeted Mock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </section>

      {/* 3. MAIN DUAL-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Activity Feed */}
          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Activity Feed</h3>
                <p className="text-[11px] text-gray-400">
                  Real-time log of interviews completed and coding submissions
                </p>
              </div>
              <NavLink
                to="/analytics"
                className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#20232C] border border-white/5 text-center space-y-2">
                <p className="text-xs font-semibold text-gray-300">
                  No recorded activity yet
                </p>
                <p className="text-[11px] text-gray-500">
                  Start an AI mock interview or submit a coding solution to populate your activity log.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentActivity.map((act) => (
                  <div
                    key={`${act.type}-${act.id}`}
                    className="p-3.5 rounded-xl bg-[#20232C] border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold shrink-0 ${
                          act.type === 'INTERVIEW'
                            ? 'bg-purple-500/15 text-purple-300'
                            : 'bg-cyan-500/15 text-cyan-300'
                        }`}
                      >
                        {act.type}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {act.title}
                        </p>
                        <p className="text-[10px] font-mono text-gray-500">
                          {new Date(act.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono text-xs">
                      <span className="text-emerald-400 font-semibold">
                        {act.score != null ? `${Math.round(act.score)}%` : act.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Mock Interviews */}
          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Mock Interviews</h3>
                <p className="text-[11px] text-gray-400">
                  AI-evaluated interview sessions stored in your account
                </p>
              </div>
              <NavLink
                to="/interview-history"
                className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>View All ({summaryMetrics.totalInterviews})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            {recentInterviews.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#20232C] border border-white/5 text-center space-y-3">
                <p className="text-xs text-gray-400">
                  You haven&apos;t taken any mock interviews yet.
                </p>
                <NavLink
                  to="/mock-interviews"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-semibold"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Configure First Mock Interview</span>
                </NavLink>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInterviews.slice(0, 3).map((intv) => (
                  <div
                    key={intv.id}
                    className="p-4 rounded-xl bg-[#20232C] border border-white/5 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {intv.companyName && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-semibold">
                            {intv.companyName}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 font-mono">
                          {intv.interviewType} • {intv.difficulty}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          • {new Date(intv.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {intv.title}
                      </h4>
                      {intv.feedback?.summary && (
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {intv.feedback.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-emerald-400">
                          {intv.overallScore != null
                            ? `${Math.round(intv.overallScore)}%`
                            : intv.status}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {intv.overallScore != null ? 'Score' : 'Status'}
                        </span>
                      </div>
                      <NavLink
                        to="/interview-history"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                        title="Inspect Session History"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </NavLink>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Modules Card */}
          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="text-base font-bold text-white">Quick Study Actions</h3>
            <div className="space-y-2.5">
              <NavLink
                to="/resume-analyzer"
                className="p-3 rounded-xl bg-[#20232C] border border-white/5 hover:border-purple-500/40 flex items-center justify-between text-xs text-gray-200 transition-all"
              >
                <span>Analyze Resume with Gemini</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              </NavLink>
              <NavLink
                to="/company-questions"
                className="p-3 rounded-xl bg-[#20232C] border border-white/5 hover:border-cyan-500/40 flex items-center justify-between text-xs text-gray-200 transition-all"
              >
                <span>Browse Company Question Bank</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </NavLink>
              <NavLink
                to="/resources"
                className="p-3 rounded-xl bg-[#20232C] border border-white/5 hover:border-emerald-500/40 flex items-center justify-between text-xs text-gray-200 transition-all"
              >
                <span>{branchCode} Notes & GATE PYQs</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </NavLink>
            </div>
          </div>

          {/* Competency Breakdown */}
          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Competency Breakdown</h3>
              <NavLink
                to="/analytics"
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Detailed Graph
              </NavLink>
            </div>

            {!dims ? (
              <p className="text-xs text-gray-400">
                Complete at least one AI mock interview to compute your 6-axis rubric averages.
              </p>
            ) : (
              <div className="space-y-3 pt-1">
                {[
                  { label: 'Technical Depth', val: dims.technical, bar: 'bg-purple-500', text: 'text-purple-300' },
                  { label: 'Conceptual Clarity', val: dims.conceptual, bar: 'bg-cyan-400', text: 'text-cyan-300' },
                  { label: 'Problem Solving', val: dims.problemSolving, bar: 'bg-emerald-400', text: 'text-emerald-300' },
                  { label: 'Communication', val: dims.communication, bar: 'bg-amber-400', text: 'text-amber-300' },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{metric.label}</span>
                      <span className={`${metric.text} font-mono font-semibold`}>
                        {Math.round(metric.val)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#20232C] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`${metric.bar} h-full rounded-full`}
                        style={{ width: `${Math.min(100, Math.round(metric.val))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Standing */}
          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
              Academic Profile
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/30 font-mono">
                {branchCode}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{branchLabel}</h4>
                <p className="text-[11px] text-gray-400 truncate">
                  {academicInfo.institution || 'Institution not specified — update in Profile'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {academicInfo.degree} • Year {academicInfo.academicYear ?? 1} •{' '}
                {semesterLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
