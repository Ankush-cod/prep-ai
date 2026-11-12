// src/pages/CodingPractice.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  Search,
  RefreshCw,
  Terminal,
  History,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';
import {
  BackendCodingProblem,
  BackendCodingSubmission,
  CodingLanguage,
  codingService,
} from '../services/codingService';

const LANGUAGE_LABELS: Record<CodingLanguage, string> = {
  cpp: 'C++17',
  python: 'Python 3',
  java: 'Java',
  javascript: 'JavaScript',
  go: 'Go',
};

const DEFAULT_STARTER: Record<CodingLanguage, string> = {
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
  python: 'import sys\n\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()\n',
  java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n    }\n}',
  javascript: 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8");\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println()\n}',
};

function difficultyBadge(diff: string): string {
  switch (diff.toUpperCase()) {
    case 'EASY':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    case 'MEDIUM':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    case 'HARD':
    default:
      return 'bg-red-500/15 text-red-400 border-red-500/20';
  }
}

export const CodingPractice: React.FC = () => {
  const { toggleBookmark, isBookmarked, showToast } = useApp();

  const [problems, setProblems] = useState<BackendCodingProblem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [submissions, setSubmissions] = useState<BackendCodingSubmission[]>([]);
  const [sandboxAvailable, setSandboxAvailable] = useState<boolean | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<CodingLanguage[]>([
    'cpp',
    'python',
    'java',
    'javascript',
    'go',
  ]);

  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [language, setLanguage] = useState<CodingLanguage>('cpp');
  const [code, setCode] = useState<string>(DEFAULT_STARTER.cpp);
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'notes'>(
    'description'
  );
  const [activeTestcase, setActiveTestcase] = useState<number>(0);
  const [useCustomInput, setUseCustomInput] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [runResult, setRunResult] = useState<{
    ok: boolean;
    status: string;
    runtime: string;
    memory: string;
    output: string;
    errorDetail?: string;
  } | null>(null);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [problemList, langList, allSubmissions] = await Promise.all([
        codingService.listProblems(),
        codingService.getLanguages().catch(() => []),
        codingService.listSubmissions().catch(() => []),
      ]);

      setProblems(problemList);
      setSubmissions(allSubmissions);

      if (langList.length > 0) {
        setAvailableLanguages(langList.map((l) => l.id));
        setSandboxAvailable(langList.some((l) => l.available));
      } else {
        setSandboxAvailable(false);
      }

      if (problemList.length > 0) {
        setSelectedId((prev) => {
          const exists = problemList.some((p) => p.id === prev);
          return exists ? prev : problemList[0].id;
        });
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Failed to load coding problems from server.';
      setLoadError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesDiff =
        difficultyFilter === 'All' ||
        p.difficulty.toUpperCase() === difficultyFilter.toUpperCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesDiff && matchesSearch;
    });
  }, [problems, difficultyFilter, searchQuery]);

  const selectedProblem = useMemo(
    () =>
      problems.find((p) => p.id === selectedId) ||
      filteredProblems[0] ||
      problems[0] ||
      null,
    [problems, filteredProblems, selectedId]
  );

  // Sync starter code when switching problems
  useEffect(() => {
    if (!selectedProblem) return;
    const starter =
      selectedProblem.starterCode?.[language] ?? DEFAULT_STARTER[language] ?? '';
    setCode(starter);
    setActiveTestcase(0);
    setRunResult(null);
  }, [selectedProblem?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const problemSubmissions = useMemo(() => {
    if (!selectedProblem) return [];
    return submissions.filter((s) => s.problemId === selectedProblem.id);
  }, [submissions, selectedProblem]);

  const solvedProblemCount = useMemo(
    () => problems.filter((p) => p.solved).length,
    [problems]
  );

  const acceptedSubmissionsCount = useMemo(
    () => submissions.filter((s) => s.status === 'ACCEPTED').length,
    [submissions]
  );

  const handleLanguageChange = (lang: CodingLanguage) => {
    setLanguage(lang);
    const starter =
      selectedProblem?.starterCode?.[lang] ?? DEFAULT_STARTER[lang] ?? '';
    setCode(starter);
    showToast(`Switched editor language to ${LANGUAGE_LABELS[lang]}`, 'info');
  };

  const handleResetCode = () => {
    const starter =
      selectedProblem?.starterCode?.[language] ?? DEFAULT_STARTER[language] ?? '';
    setCode(starter);
    showToast('Reset code to starter template', 'info');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setRunResult(null);
    try {
      const result = await codingService.runSample(selectedProblem.id, {
        language,
        sourceCode: code,
        customInput: useCustomInput ? customInput : undefined,
      });

      const ok = result.mode === 'custom' ? !result.stderr && !result.compileOutput : Boolean(result.passed);
      const outputLines = [
        result.compileOutput ? `Compile Output:\n${result.compileOutput}` : '',
        result.stderr ? `Stderr:\n${result.stderr}` : '',
        result.stdout ? result.stdout : '(No stdout output)',
      ]
        .filter(Boolean)
        .join('\n\n');

      setRunResult({
        ok,
        status: result.status,
        runtime: result.runtimeMs != null ? `${result.runtimeMs} ms` : '—',
        memory: result.memoryKb != null ? `${Math.round(result.memoryKb / 1024 * 10) / 10} MB` : '—',
        output: outputLines,
      });

      if (ok) {
        showToast('Sample run completed!');
      } else {
        showToast(`Execution status: ${result.status}`, 'warning');
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Code execution request failed.';
      setRunResult({
        ok: false,
        status: err instanceof ApiError && err.status === 503 ? 'Sandbox Unavailable' : 'Execution Error',
        runtime: '—',
        memory: '—',
        output: msg,
        errorDetail: msg,
      });
      showToast(msg, 'warning');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setRunResult(null);
    try {
      const submission = await codingService.submitSolution(selectedProblem.id, {
        language,
        sourceCode: code,
      });

      setSubmissions((prev) => [submission, ...prev]);

      const accepted = submission.status === 'ACCEPTED';
      if (accepted) {
        setProblems((prev) =>
          prev.map((p) => (p.id === selectedProblem.id ? { ...p, solved: true } : p))
        );
      }

      const detail = [
        `Result: ${submission.status} (${submission.passedCount}/${submission.totalCount} test cases passed)`,
        submission.compileOutput ? `Compile:\n${submission.compileOutput}` : '',
        submission.stderr ? `Stderr:\n${submission.stderr}` : '',
        submission.stdout ? `Stdout:\n${submission.stdout}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      setRunResult({
        ok: accepted,
        status: submission.status,
        runtime: submission.runtimeMs != null ? `${submission.runtimeMs} ms` : '—',
        memory:
          submission.memoryKb != null
            ? `${Math.round((submission.memoryKb / 1024) * 10) / 10} MB`
            : '—',
        output: detail,
      });

      if (accepted) {
        showToast('Solution Accepted! Submission saved to database.');
      } else {
        showToast(`Submission status: ${submission.status}`, 'warning');
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Failed to submit solution to execution engine.';
      setRunResult({
        ok: false,
        status: err instanceof ApiError && err.status === 503 ? 'Sandbox Unavailable' : 'Submission Failed',
        runtime: '—',
        memory: '—',
        output: msg,
      });
      showToast(msg, 'warning');
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 bg-[#242731] border border-[#353946] rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-[520px] bg-[#242731] border border-[#353946] rounded-2xl" />
          <div className="lg:col-span-7 h-[520px] bg-[#242731] border border-[#353946] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-[#242731] border border-red-500/30 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Unable to load Coding Practice workspace</span>
          </div>
          <p className="text-xs text-gray-400">{loadError}</p>
          <button
            onClick={loadWorkspace}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ZONE 1: WORKSPACE TELEMETRY & PROBLEM SELECTOR */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Real Progress Summary */}
          <div className="bg-[#242731] border border-[#353946] p-5 rounded-2xl shadow-md relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-purple-600/10 blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                  Coding Practice Telemetry
                </span>
              </div>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded border font-medium ${
                  sandboxAvailable
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/20'
                }`}
              >
                {sandboxAvailable ? 'Sandbox Ready' : 'Sandbox Unconfigured'}
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Problem Bank Progress
              </h2>
              <span className="font-mono text-xs font-semibold text-purple-400">
                {solvedProblemCount}{' '}
                <span className="text-gray-500 font-normal">
                  / {problems.length} Solved
                </span>
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-[#20232C] overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all"
                style={{
                  width:
                    problems.length > 0
                      ? `${Math.round((solvedProblemCount / problems.length) * 100)}%`
                      : '0%',
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5 text-gray-400">
              <span>Total Submissions: {submissions.length}</span>
              <span className="text-emerald-400 font-mono">
                Accepted: {acceptedSubmissionsCount}
              </span>
            </div>
          </div>

          {/* Card 2: Problem Selector & Filter */}
          <div className="bg-[#242731] border border-[#353946] p-5 rounded-2xl shadow-md space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search problems, topics, tags..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#20232C] border border-[#353946] rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex items-center gap-1">
                {(['All', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                      difficultyFilter === diff
                        ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40'
                        : 'bg-[#20232C] text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {diff === 'All' ? 'All' : diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {filteredProblems.length === 0 ? (
                <p className="text-xs text-gray-500 py-1">
                  No coding problems match your current filters.
                </p>
              ) : (
                filteredProblems.map((p) => {
                  const active = selectedProblem?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`shrink-0 px-3 py-2 rounded-xl border text-left transition-all ${
                        active
                          ? 'bg-purple-600/20 border-purple-500/50 text-white'
                          : 'bg-[#20232C] border-[#353946] text-gray-300 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {p.solved && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="text-xs font-semibold truncate max-w-[180px]">
                          {p.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-gray-400">
                        <span>{p.difficulty}</span>
                        <span>•</span>
                        <span>{p.topic}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {!selectedProblem ? (
        <div className="bg-[#242731] border border-[#353946] rounded-2xl p-8 text-center text-xs text-gray-400">
          No coding problems found in database. Seed the database or adjust your search filter.
        </div>
      ) : (
        /* ZONE 2: SPLIT CODING WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane (5 cols): Problem Description & History */}
          <div className="lg:col-span-5 bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4 max-h-[820px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#353946] pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`text-xs font-semibold pb-1 transition-all ${
                    activeTab === 'description'
                      ? 'text-purple-300 border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`text-xs font-semibold pb-1 transition-all inline-flex items-center gap-1 ${
                    activeTab === 'submissions'
                      ? 'text-purple-300 border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Submissions ({problemSubmissions.length})
                </button>
              </div>

              <button
                onClick={() =>
                  void toggleBookmark({
                    id: selectedProblem.id,
                    title: selectedProblem.title,
                    category: 'Coding Practice',
                    branch: 'CSE',
                    difficulty:
                      selectedProblem.difficulty === 'EASY'
                        ? 'Easy'
                        : selectedProblem.difficulty === 'MEDIUM'
                        ? 'Medium'
                        : 'Hard',
                    tags: selectedProblem.tags,
                    targetCompany: selectedProblem.company?.name || 'General',
                    type: 'code',
                    targetType: 'CODING_PROBLEM',
                  })
                }
                className={`p-1.5 rounded-lg border transition-all ${
                  isBookmarked(selectedProblem.id)
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                    : 'bg-white/5 text-gray-400 hover:text-white border-[#353946]'
                }`}
                title="Bookmark problem"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            {activeTab === 'description' ? (
              <div className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-gray-400 mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded border font-semibold ${difficultyBadge(
                        selectedProblem.difficulty
                      )}`}
                    >
                      {selectedProblem.difficulty}
                    </span>
                    <span>{selectedProblem.track}</span>
                    {selectedProblem.step && <span>• {selectedProblem.step}</span>}
                    {selectedProblem.company && (
                      <span>• {selectedProblem.company.name}</span>
                    )}
                  </div>
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    {selectedProblem.title}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedProblem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-[#20232C] text-[10px] font-mono text-gray-300 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line border-t border-white/5 pt-3">
                  {selectedProblem.description}
                </div>

                {selectedProblem.examples?.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Examples
                    </h4>
                    {selectedProblem.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-[#20232C] border border-white/5 font-mono text-xs space-y-1.5"
                      >
                        <div>
                          <span className="text-purple-400">Input:</span>
                          <pre className="text-gray-300 mt-0.5 whitespace-pre-wrap">
                            {ex.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-cyan-400">Output:</span>
                          <pre className="text-emerald-400 mt-0.5 whitespace-pre-wrap">
                            {ex.output}
                          </pre>
                        </div>
                        {ex.explanation && (
                          <div className="text-gray-400 text-[11px] pt-1 border-t border-white/5">
                            <span className="text-gray-500">Explanation:</span>{' '}
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedProblem.constraints?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Constraints
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs font-mono text-gray-400">
                      {selectedProblem.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {problemSubmissions.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">
                    No submissions yet for this problem. Submit a solution using the
                    editor to record telemetry here.
                  </p>
                ) : (
                  problemSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-[#20232C] border border-[#353946] space-y-1.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={
                            sub.status === 'ACCEPTED'
                              ? 'text-emerald-400 font-semibold'
                              : 'text-red-400 font-semibold'
                          }
                        >
                          {sub.status}
                        </span>
                        <span className="text-gray-500 text-[11px]">
                          {new Date(sub.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>Lang: {sub.language.toUpperCase()}</span>
                        <span>
                          Passed: {sub.passedCount}/{sub.totalCount}
                        </span>
                        <span>
                          {sub.runtimeMs != null ? `${sub.runtimeMs} ms` : '—'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Pane (7 cols): Code Editor & Execution Console */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#242731] border border-[#353946] rounded-2xl shadow-md overflow-hidden">
              <div className="px-4 py-2.5 bg-[#20232C] border-b border-[#353946] flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-all ${
                        language === lang
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {LANGUAGE_LABELS[lang] || lang}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={handleResetCode}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Reset code"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="relative bg-[#191B22] p-4 font-mono text-xs text-gray-200">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={16}
                  spellCheck={false}
                  className="w-full bg-transparent text-gray-100 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-purple-600/30"
                />
              </div>

              <div className="px-4 py-3 bg-[#20232C] border-t border-[#353946] flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  OnlineCompiler.io Sandbox ({LANGUAGE_LABELS[language]})
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                    <span>{isRunning ? 'Running...' : 'Run Sample'}</span>
                  </button>
                  <button
                    onClick={handleSubmitCode}
                    disabled={isRunning}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isRunning ? 'Submitting...' : 'Submit'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Testcases & Execution Console */}
            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-5 shadow-md space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#353946] pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {(selectedProblem.testCases || []).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setUseCustomInput(false);
                        setActiveTestcase(i);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                        !useCustomInput && activeTestcase === i
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Testcase {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setUseCustomInput(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      useCustomInput
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Custom Input
                  </button>
                </div>

                {runResult && (
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        runResult.ok
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/15 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {runResult.status}
                    </span>
                    <span className="text-gray-400 text-[11px] hidden sm:inline">
                      {runResult.runtime} • {runResult.memory}
                    </span>
                  </div>
                )}
              </div>

              {useCustomInput ? (
                <div className="space-y-1.5 text-xs font-mono">
                  <label className="text-gray-500 text-[11px] uppercase tracking-wider block">
                    Custom Stdin Input
                  </label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    rows={4}
                    placeholder="Enter custom stdin input passed to your program..."
                    className="w-full p-2.5 rounded-lg bg-[#20232C] text-gray-200 border border-[#353946] focus:outline-none focus:border-purple-500"
                  />
                </div>
              ) : (
                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-gray-500 text-[11px] uppercase tracking-wider block">
                      Input
                    </span>
                    <pre className="p-2.5 rounded-lg bg-[#20232C] text-gray-200 mt-1 border border-white/5 whitespace-pre-wrap">
                      {selectedProblem.testCases?.[activeTestcase]?.input || '—'}
                    </pre>
                  </div>

                  <div>
                    <span className="text-gray-500 text-[11px] uppercase tracking-wider block">
                      Expected Output
                    </span>
                    <pre className="p-2.5 rounded-lg bg-[#20232C] text-emerald-400 mt-1 border border-white/5 whitespace-pre-wrap">
                      {selectedProblem.testCases?.[activeTestcase]?.expectedOutput || '—'}
                    </pre>
                  </div>
                </div>
              )}

              {runResult && (
                <div>
                  <span className="text-gray-500 text-[11px] uppercase tracking-wider block font-mono">
                    Execution Output
                  </span>
                  <pre className="p-2.5 rounded-lg bg-[#191B22] text-gray-300 mt-1 border border-white/5 whitespace-pre-wrap text-xs font-mono">
                    {runResult.output}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
