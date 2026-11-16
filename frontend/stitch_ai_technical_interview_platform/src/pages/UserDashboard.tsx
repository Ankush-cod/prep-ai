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
  Sparkles,
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
        <div className="h-44 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-72 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm" />
          <div className="lg:col-span-4 h-72 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm" />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Unable to load Dashboard</span>
          </div>
          <p className="text-xs text-[#77788B]">{error || 'No telemetry returned.'}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
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
      <section className="relative rounded-2xl bg-white border border-[#E2E4EB] p-6 lg:p-8 shadow-sm overflow-hidden">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#77788B]">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE SESSION
              </span>
              <span>•</span>
              <span className="text-[#5145E5] font-semibold">
                {branchCode} Track • Year {academicInfo.academicYear ?? 1} • {semesterLabel}
              </span>
              {academicInfo.institution && (
                <>
                  <span>•</span>
                  <span className="text-[#77788B]">{academicInfo.institution}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17182B] tracking-tight">
                Welcome back, {academicInfo.fullName}
              </h1>
              {profile.rollNumber && (
                <span className="font-mono text-xs text-[#77788B]">
                  {profile.rollNumber}
                </span>
              )}
            </div>

            <p className="text-sm text-[#77788B] leading-relaxed">
              {recommendedTopics.length > 0 ? (
                <>
                  Recommended focus based on your current telemetry:{' '}
                  <span className="text-[#17182B] font-semibold">
                    {recommendedTopics.slice(0, 2).join(', ')}
                  </span>
                  . Continue with a calibrated AI mock interview or practice with code sandbox below.
                </>
              ) : (
                'Complete an AI mock interview or solve coding practice problems to populate your diagnostic performance telemetry.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {profile.skills.languages.length > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-[#F7F7FC] border border-[#E2E4EB] text-[#17182B] font-mono text-xs">
                  {profile.skills.languages.map((l) => l.name).slice(0, 3).join(' • ')}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-[#EEF2FF] border border-[#E0E7FF] text-[#5145E5] font-mono text-xs flex items-center gap-1 font-semibold">
                <Bookmark className="w-3.5 h-3.5" />
                {summaryMetrics.bookmarkCount} Bookmarks
              </span>
              {academicInfo.cgpa != null && academicInfo.cgpa > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  CGPA {academicInfo.cgpa.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 xl:self-end shrink-0">
            <NavLink
              to="/mock-interviews"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Start AI Mock Interview</span>
            </NavLink>
            <NavLink
              to="/coding-practice"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F4F4FA] hover:bg-[#EAEAF4] text-[#17182B] border border-[#E2E4EB] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Terminal className="w-4 h-4 text-[#5145E5]" />
              <span>Open Coding Sandbox</span>
            </NavLink>
          </div>
        </div>
      </section>

      {/* 2. FOUR TELEMETRY METRIC CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Avg Interview Score */}
        <div className="rounded-2xl bg-white border border-[#E2E4EB] p-5 flex flex-col justify-between hover:border-[#5145E5]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77788B]">
              Interview Readiness
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#5145E5] text-xs font-mono font-semibold flex items-center gap-1 border border-[#E0E7FF]">
              <TrendingUp className="w-3 h-3" />
              {summaryMetrics.completedInterviews > 0 ? 'Evaluated' : 'Baseline'}
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl lg:text-4xl font-bold tracking-tight text-[#17182B] font-mono">
                {Math.round(summaryMetrics.averageInterviewScore)}
              </span>
              <span className="text-xs text-[#77788B] font-mono">/100</span>
            </div>
            <span className="text-xs font-mono text-[#77788B]">
              {summaryMetrics.completedInterviews} scored
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="w-full bg-[#F4F4FA] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#5145E5] h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, summaryMetrics.averageInterviewScore)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-[#77788B]">
              <span>Total Sessions: {summaryMetrics.totalInterviews}</span>
              <span>Completed: {summaryMetrics.completedInterviews}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Problems Solved */}
        <div className="rounded-2xl bg-white border border-[#E2E4EB] p-5 flex flex-col justify-between hover:border-[#5145E5]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77788B]">
              Problems Solved
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold border border-emerald-200">
              {summaryMetrics.totalSubmissions} runs
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl lg:text-4xl font-bold tracking-tight text-[#17182B] font-mono">
                {summaryMetrics.solvedProblemsCount}
              </span>
              <span className="text-xs text-[#77788B] font-mono">
                /{summaryMetrics.totalProblemsCount}
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-bold">
              {completionPct}%
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="w-full bg-[#F4F4FA] h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-[#77788B]">
              <span>Striver A2Z & CP-31</span>
              <span>Acceptance Verified</span>
            </div>
          </div>
        </div>

        {/* Card 3: Activity Streak */}
        <div className="rounded-2xl bg-white border border-[#E2E4EB] p-5 flex flex-col justify-between hover:border-[#5145E5]/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77788B]">
              Active Streak
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl lg:text-4xl font-bold tracking-tight text-[#17182B] font-mono">
                {summaryMetrics.streakDays}
              </span>
              <span className="text-xs text-[#77788B] font-mono">
                {summaryMetrics.streakDays === 1 ? 'day' : 'days'}
              </span>
            </div>
            <span className="text-xs text-amber-600 font-mono font-bold">
              Daily Practice
            </span>
          </div>
          <div className="space-y-1.5 pt-1 text-[10px] font-mono text-[#77788B] border-t border-[#F0F1F5]">
            <span>Activity logged from mock interviews and sandbox submissions</span>
          </div>
        </div>

        {/* Card 4: Focus Area */}
        <div className="rounded-2xl bg-white border border-amber-200 p-5 flex flex-col justify-between hover:border-amber-300 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Focus Recommendation
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 font-mono font-bold border border-amber-200">
              TARGET
            </span>
          </div>
          <div className="my-2">
            <h4 className="text-sm font-bold text-[#17182B] leading-tight">
              {recommendedTopics[0] || `${branchCode} Core Fundamentals`}
            </h4>
            <p className="text-[11px] text-[#77788B] mt-1 line-clamp-2">
              {recommendedTopics.length > 0
                ? 'Derived from your lowest evaluated interview topic rubric.'
                : 'Practice a mock round to generate custom focus recommendations.'}
            </p>
          </div>
          <NavLink
            to="/mock-interviews"
            className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
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
          <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#17182B]">Recent Activity Feed</h3>
                <p className="text-[11px] text-[#77788B]">
                  Real-time timeline of interviews taken and coding sandbox submissions
                </p>
              </div>
              <NavLink
                to="/analytics"
                className="text-xs font-semibold text-[#5145E5] hover:underline flex items-center gap-1"
              >
                <span>Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] text-center space-y-2">
                <p className="text-xs font-semibold text-[#17182B]">
                  No recorded activity yet
                </p>
                <p className="text-[11px] text-[#77788B]">
                  Start an AI mock interview or submit a coding solution to populate your activity log.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentActivity.map((act) => (
                  <div
                    key={`${act.type}-${act.id}`}
                    className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 border ${
                          act.type === 'INTERVIEW'
                            ? 'bg-[#EEF2FF] text-[#5145E5] border-[#E0E7FF]'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {act.type}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#17182B] truncate">
                          {act.title}
                        </p>
                        <p className="text-[10px] font-mono text-[#77788B]">
                          {new Date(act.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono text-xs">
                      <span className="text-emerald-600 font-bold">
                        {act.score != null ? `${Math.round(act.score)}%` : act.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Mock Interviews */}
          <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#17182B]">Recent Mock Interviews</h3>
                <p className="text-[11px] text-[#77788B]">
                  AI-evaluated interview sessions and rubric feedback stored in your account
                </p>
              </div>
              <NavLink
                to="/interview-history"
                className="text-xs font-semibold text-[#5145E5] hover:underline flex items-center gap-1"
              >
                <span>View All ({summaryMetrics.totalInterviews})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            {recentInterviews.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] text-center space-y-3">
                <p className="text-xs text-[#77788B]">
                  You haven&apos;t taken any mock interviews yet.
                </p>
                <NavLink
                  to="/mock-interviews"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5145E5] text-white text-xs font-semibold shadow-xs"
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
                    className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] hover:border-[#5145E5]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {intv.companyName && (
                          <span className="px-2 py-0.5 rounded bg-[#EEF2FF] text-[#5145E5] font-mono text-[10px] font-bold">
                            {intv.companyName}
                          </span>
                        )}
                        <span className="text-xs text-[#77788B] font-mono">
                          {intv.interviewType} • {intv.difficulty}
                        </span>
                        <span className="text-[11px] text-[#77788B]">
                          • {new Date(intv.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#17182B] group-hover:text-[#5145E5] transition-colors">
                        {intv.title}
                      </h4>
                      {intv.feedback?.summary && (
                        <p className="text-xs text-[#77788B] line-clamp-1">
                          {intv.feedback.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-emerald-600">
                          {intv.overallScore != null
                            ? `${Math.round(intv.overallScore)}%`
                            : intv.status}
                        </div>
                        <span className="text-[10px] text-[#77788B] font-mono">
                          {intv.overallScore != null ? 'Score' : 'Status'}
                        </span>
                      </div>
                      <NavLink
                        to="/interview-history"
                        className="p-2 rounded-lg bg-white border border-[#E2E4EB] hover:bg-[#F4F4FA] text-[#17182B] transition-colors shadow-2xs"
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
          <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#17182B]">Quick Study Actions</h3>
            <div className="space-y-2.5">
              <NavLink
                to="/resume-analyzer"
                className="p-3 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] hover:border-[#5145E5]/40 hover:bg-[#EEF2FF]/40 flex items-center justify-between text-xs text-[#17182B] font-medium transition-all"
              >
                <span>Analyze Resume with Gemini</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5145E5]" />
              </NavLink>
              <NavLink
                to="/company-questions"
                className="p-3 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] hover:border-[#5145E5]/40 hover:bg-[#EEF2FF]/40 flex items-center justify-between text-xs text-[#17182B] font-medium transition-all"
              >
                <span>Browse Company Question Bank</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5145E5]" />
              </NavLink>
              <NavLink
                to="/resources"
                className="p-3 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] hover:border-[#5145E5]/40 hover:bg-[#EEF2FF]/40 flex items-center justify-between text-xs text-[#17182B] font-medium transition-all"
              >
                <span>{branchCode} Notes & GATE PYQs</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5145E5]" />
              </NavLink>
            </div>
          </div>

          {/* Competency Breakdown */}
          <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#17182B]">Competency Rubric</h3>
              <NavLink
                to="/analytics"
                className="text-xs font-semibold text-[#5145E5] hover:underline"
              >
                Detailed Graph
              </NavLink>
            </div>

            {!dims ? (
              <p className="text-xs text-[#77788B]">
                Complete at least one AI mock interview to compute your 6-axis rubric averages.
              </p>
            ) : (
              <div className="space-y-3 pt-1">
                {[
                  { label: 'Technical Depth', val: dims.technical, bar: 'bg-[#5145E5]', text: 'text-[#5145E5]' },
                  { label: 'Conceptual Clarity', val: dims.conceptual, bar: 'bg-cyan-500', text: 'text-cyan-700' },
                  { label: 'Problem Solving', val: dims.problemSolving, bar: 'bg-emerald-500', text: 'text-emerald-700' },
                  { label: 'Communication', val: dims.communication, bar: 'bg-amber-500', text: 'text-amber-700' },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#17182B] font-medium">{metric.label}</span>
                      <span className={`${metric.text} font-mono font-bold`}>
                        {Math.round(metric.val)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#F4F4FA] h-2 rounded-full overflow-hidden">
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
          <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#77788B]">
              Academic Standing
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#5145E5] font-bold text-xs flex items-center justify-center border border-[#E0E7FF] font-mono">
                {branchCode}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#17182B] truncate">{branchLabel}</h4>
                <p className="text-[11px] text-[#77788B] truncate">
                  {academicInfo.institution || 'Institution registered in Profile'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {academicInfo.degree} • Year {academicInfo.academicYear ?? 1} • {semesterLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
