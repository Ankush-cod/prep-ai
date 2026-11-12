// src/pages/AnalyticsDashboard.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';
import {
  AnalyticsPayload,
  DashboardPayload,
  analyticsService,
} from '../services/analyticsService';

export const AnalyticsDashboard: React.FC = () => {
  const { profile } = useApp();
  const [timeframe, setTimeframe] = useState<'30D' | '90D' | 'ALL'>('ALL');
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stats, dash] = await Promise.all([
        analyticsService.getAnalytics(),
        analyticsService.getDashboard().catch(() => null),
      ]);
      setAnalytics(stats);
      setDashboard(dash);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load performance analytics.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const filteredTrend = useMemo(() => {
    if (!analytics) return [];
    if (timeframe === 'ALL') return analytics.scoreTrend;
    const days = timeframe === '30D' ? 30 : 90;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return analytics.scoreTrend.filter(
      (pt) => new Date(pt.date).getTime() >= cutoff
    );
  }, [analytics, timeframe]);

  const avgScore = useMemo(() => {
    if (filteredTrend.length === 0) {
      return dashboard?.summaryMetrics.averageInterviewScore ?? 0;
    }
    return (
      Math.round(
        (filteredTrend.reduce((s, p) => s + p.overallScore, 0) /
          filteredTrend.length) *
          10
      ) / 10
    );
  }, [filteredTrend, dashboard]);

  const chartPoints = useMemo(() => {
    if (filteredTrend.length === 0) return [];
    const width = 820;
    const leftPad = 50;
    const topPad = 25;
    const height = 140;
    return filteredTrend.map((pt, idx) => {
      const x =
        filteredTrend.length === 1
          ? leftPad + width / 2
          : leftPad + (idx / (filteredTrend.length - 1)) * width;
      const clampedScore = Math.max(0, Math.min(100, pt.overallScore));
      const y = topPad + height - (clampedScore / 100) * height;
      return {
        ...pt,
        x: Math.round(x),
        y: Math.round(y),
      };
    });
  }, [filteredTrend]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-[#242731] border border-[#353946]"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-[#242731] border border-[#353946]" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-[#242731] border border-red-500/30 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Unable to load Analytics</span>
          </div>
          <p className="text-xs text-gray-400">{error || 'No analytics returned.'}</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const polylinePath = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span>Diagnostic Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Performance Analytics &amp; Diagnostic Telemetry
          </h1>
          <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
            Longitudinal interview score tracking, 6-dimension rubric breakdown, topic performance, and coding sandbox progress.
          </p>
        </div>

        <div className="flex items-center bg-[#242731] p-1 rounded-xl border border-[#353946] self-start lg:self-end">
          {[
            { id: '30D', label: 'Last 30 Days' },
            { id: '90D', label: 'Last 90 Days' },
            { id: 'ALL', label: 'All Time' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as '30D' | '90D' | 'ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                timeframe === t.id
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Top 4 Telemetry Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#242731] border border-[#353946] rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-gray-400">
              Average Interview Score
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-mono text-[10px] font-semibold border border-purple-500/20">
              {filteredTrend.length} Scored
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-white">
              {avgScore}
            </span>
            <span className="text-sm text-gray-500 font-mono">%</span>
          </div>
          <div className="w-full bg-[#20232C] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${Math.min(100, avgScore)}%` }}
            />
          </div>
        </div>

        <div className="bg-[#242731] border border-[#353946] rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-gray-400">
              Completed Rounds
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono text-[10px] font-semibold border border-cyan-500/20">
              {analytics.evaluatedAnswersCount} Answers
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-white">
              {analytics.completedInterviewsCount}
            </span>
            <span className="text-xs text-gray-400 font-mono">sessions</span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            Evaluated against rubric dimensions
          </div>
        </div>

        <div className="bg-[#242731] border border-[#353946] rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-gray-400">
              Coding Acceptance
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/20">
              {analytics.codingStats.uniqueSolvedCount} /{' '}
              {analytics.codingStats.totalProblems} Solved
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-emerald-400">
              {Math.round(analytics.codingStats.acceptanceRate)}
            </span>
            <span className="text-xs text-gray-500 font-mono">%</span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            {analytics.codingStats.acceptedSubmissions} /{' '}
            {analytics.codingStats.totalSubmissions} submissions accepted
          </div>
        </div>

        <div className="bg-[#242731] border border-[#353946] rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-gray-400">
              Activity Streak
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[10px] font-semibold border border-amber-500/20">
              Tracked
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-amber-400">
              {dashboard?.summaryMetrics.streakDays ?? 0}
            </span>
            <span className="text-xs text-gray-400 font-mono">days active</span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            Consecutive study days with recorded runs
          </div>
        </div>
      </section>

      {/* Longitudinal Score Trend Chart */}
      <section className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#353946] pb-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Interview Score Progression
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Completed mock interview overall rubric percentages over time
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Session Score
            </span>
          </div>
        </div>

        {chartPoints.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-xs text-gray-400">
              No completed interview scores in this timeframe yet.
            </p>
            <NavLink
              to="/mock-interviews"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-semibold"
            >
              Take an AI Mock Interview
            </NavLink>
          </div>
        ) : (
          <div className="h-56 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 900 200" fill="none">
              <line x1="40" y1="25" x2="880" y2="25" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="40" y1="60" x2="880" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="40" y1="95" x2="880" y2="95" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="40" y1="130" x2="880" y2="130" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="40" y1="165" x2="880" y2="165" stroke="rgba(255,255,255,0.08)" />

              {chartPoints.length > 1 && (
                <polyline
                  points={polylinePath}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {chartPoints.map((pt, i) => (
                <g key={pt.sessionId}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#8b5cf6" stroke="#191B22" strokeWidth="2" />
                  <text
                    x={pt.x}
                    y={Math.max(14, pt.y - 10)}
                    fill="#e5e7eb"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {Math.round(pt.overallScore)}%
                  </text>
                  <text
                    x={pt.x}
                    y="188"
                    fill="#9ca3af"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {i < 10 ? new Date(pt.date).toLocaleDateString() : ''}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </section>

      {/* Topic Mastery Matrix & AI Recommendations */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#353946] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Topic Performance Matrix</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Computed from your evaluated interview answers
              </p>
            </div>
            <span className="text-xs font-mono text-purple-300">
              {profile.branch || 'CSE'} Dept
            </span>
          </div>

          {analytics.topicBreakdown.length === 0 ? (
            <p className="text-xs text-gray-400 py-4">
              Complete interview questions to generate your topic mastery scores.
            </p>
          ) : (
            <div className="space-y-3.5">
              {analytics.topicBreakdown.map((t) => {
                const score = Math.round(t.averageScore);
                const status =
                  score >= 85
                    ? 'Strong'
                    : score >= 70
                    ? 'Proficient'
                    : 'Needs Focus';
                return (
                  <div key={t.topic} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-200 font-medium">
                        {t.topic}{' '}
                        <span className="text-[11px] text-gray-500 font-mono">
                          ({t.attempts} {t.attempts === 1 ? 'answer' : 'answers'})
                        </span>
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            score >= 85
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : score >= 70
                              ? 'bg-purple-500/15 text-purple-300'
                              : 'bg-amber-500/15 text-amber-300'
                          }`}
                        >
                          {status}
                        </span>
                        <span className="text-white font-bold">{score}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#20232C] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          score >= 85
                            ? 'bg-emerald-400'
                            : score >= 70
                            ? 'bg-purple-500'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Strengths & Focus Areas (5 cols) */}
        <div className="lg:col-span-5 bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Strengths &amp; Priority Focus
              </span>
              <h3 className="text-base font-bold text-white">
                Data-Driven Improvement Areas
              </h3>
            </div>

            {analytics.strengths.length > 0 && (
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-emerald-400 uppercase font-semibold block">
                  Verified Strengths
                </span>
                {analytics.strengths.map((s) => (
                  <div
                    key={s.topic}
                    className="p-3 rounded-xl bg-[#20232C] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {s.topic}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {Math.round(s.averageScore)}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {analytics.weaknesses.length > 0 ? (
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-amber-400 uppercase font-semibold block">
                  Recommended Review Topics
                </span>
                {analytics.weaknesses.map((w) => (
                  <div
                    key={w.topic}
                    className="p-3 rounded-xl bg-[#20232C] border border-amber-500/20 flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-200">{w.topic}</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {Math.round(w.averageScore)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                {analytics.completedInterviewsCount === 0
                  ? 'No weaknesses detected yet because no interviews have been completed.'
                  : 'All evaluated topics are currently scoring above the focus threshold.'}
              </p>
            )}
          </div>

          <NavLink
            to="/mock-interviews"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(139,92,246,0.3)] transition-all"
          >
            <span>Launch Targeted Mock Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </section>
    </div>
  );
};
