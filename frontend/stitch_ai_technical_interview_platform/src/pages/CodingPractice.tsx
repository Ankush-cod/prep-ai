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
  ExternalLink,
  Code2,
  Award,
  Maximize2,
  Minimize2,
  Settings2,
  Keyboard,
  HelpCircle,
  Sliders,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';
import {
  BackendCodingProblem,
  BackendCodingSubmission,
  CodingLanguage,
  codingService,
} from '../services/codingService';
import { MonacoCodeEditor } from '../components/coding/MonacoCodeEditor';

const LANGUAGE_LABELS: Record<CodingLanguage, string> = {
  cpp: 'C++17',
  cpp20: 'C++20',
  python: 'Python 3',
  java: 'Java',
  javascript: 'JavaScript',
  c: 'C',
  go: 'Go',
};

const DEFAULT_STARTER: Record<CodingLanguage, string> = {
  cpp: `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Enter your C++17 solution here\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    return 0;\n}`,
  cpp20: `#include <iostream>\n#include <vector>\n#include <span>\n#include <ranges>\nusing namespace std;\n\nint main() {\n    // C++20 modern solution\n    return 0;\n}`,
  python: `import sys\n\ndef solve():\n    # Enter your Python 3 solution here\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
  java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Enter your Java solution here\n    }\n}`,
  javascript: `const fs = require("fs");\n\nfunction solve() {\n    const input = fs.readFileSync(0, "utf8").trim().split("\\n");\n    // Enter your JavaScript solution here\n}\n\nsolve();\n`,
  c: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Enter your C solution here\n    return 0;\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n\t// Enter your Go solution here\n\tfmt.Println()\n}`,
};

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

export const CodingPractice: React.FC = () => {
  const { toggleBookmark, isBookmarked, showToast } = useApp();

  const [problems, setProblems] = useState<BackendCodingProblem[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    solved: number;
    striverTotal: number;
    striverSolved: number;
    cp31Total: number;
    cp31Solved: number;
  } | null>(null);

  const [selectedId, setSelectedId] = useState<string>('');
  const [submissions, setSubmissions] = useState<BackendCodingSubmission[]>([]);
  const [sandboxAvailable, setSandboxAvailable] = useState<boolean | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<CodingLanguage[]>([
    'cpp',
    'cpp20',
    'python',
    'java',
    'javascript',
    'c',
    'go',
  ]);

  const [collectionFilter, setCollectionFilter] = useState<'ALL' | 'STRIVER_A2Z' | 'CP_31'>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Editor states
  const [language, setLanguage] = useState<CodingLanguage>('cpp');
  const [codeBuffers, setCodeBuffers] = useState<Record<string, string>>({});
  const [editorTheme, setEditorTheme] = useState<'light' | 'vs-dark'>('light');
  const [fontSize, setFontSize] = useState<number>(14);
  const [wordWrap, setWordWrap] = useState<boolean>(false);
  const [minimap, setMinimap] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false);

  // Left panel tabs
  const [leftTab, setLeftTab] = useState<'description' | 'submissions'>('description');

  // Bottom console states
  const [consoleTab, setConsoleTab] = useState<'testcases' | 'custom' | 'output' | 'results'>('testcases');
  const [activeTestcase, setActiveTestcase] = useState<number>(0);
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
      const [problemsRes, langList, allSubmissions] = await Promise.all([
        codingService.listProblems(),
        codingService.getLanguages().catch(() => []),
        codingService.listSubmissions().catch(() => []),
      ]);

      const problemList = problemsRes.problems || [];
      setProblems(problemList);
      setStats(problemsRes.stats || null);
      setSubmissions(allSubmissions);

      if (langList.length > 0) {
        setAvailableLanguages(langList.map((l) => l.id as CodingLanguage));
        setSandboxAvailable(langList.some((l) => l.available));
      } else {
        setSandboxAvailable(true); // Fallback to judge0
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
      if (collectionFilter !== 'ALL' && p.collection !== collectionFilter) return false;
      if (ratingFilter !== 'ALL' && String(p.rating) !== ratingFilter) return false;
      const matchesDiff =
        difficultyFilter === 'All' ||
        p.difficulty.toUpperCase() === difficultyFilter.toUpperCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        (p.problemIdentifier && p.problemIdentifier.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesDiff && matchesSearch;
    });
  }, [problems, collectionFilter, ratingFilter, difficultyFilter, searchQuery]);

  const selectedProblem = useMemo(
    () =>
      problems.find((p) => p.id === selectedId) ||
      filteredProblems[0] ||
      problems[0] ||
      null,
    [problems, filteredProblems, selectedId]
  );

  // Sync starter code & restore user drafts per problem and language
  useEffect(() => {
    if (!selectedProblem) return;

    // Load drafts from progress or localStorage
    const savedDrafts = selectedProblem.progress?.codeDrafts || {};
    const localSaved = localStorage.getItem(`prepai_drafts_${selectedProblem.id}`);
    const parsedLocal = localSaved ? JSON.parse(localSaved) : {};
    const merged = { ...savedDrafts, ...parsedLocal };

    const initialLang = (selectedProblem.progress?.lastLanguage as CodingLanguage) || language;
    setLanguage(initialLang);

    const initialCode =
      merged[initialLang] ||
      (selectedProblem.starterCode as any)?.[initialLang] ||
      DEFAULT_STARTER[initialLang] ||
      '';

    setCodeBuffers({
      ...merged,
      [initialLang]: initialCode,
    });
    setActiveTestcase(0);
    setRunResult(null);
  }, [selectedProblem?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentCode = useMemo(() => {
    if (!selectedProblem) return '';
    return (
      codeBuffers[language] ??
      (selectedProblem.starterCode as any)?.[language] ??
      DEFAULT_STARTER[language] ??
      ''
    );
  }, [codeBuffers, language, selectedProblem]);

  const handleCodeChange = (newCode: string) => {
    if (!selectedProblem) return;
    setCodeBuffers((prev) => {
      const updated = { ...prev, [language]: newCode };
      // Persist to local storage immediately
      try {
        localStorage.setItem(`prepai_drafts_${selectedProblem.id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleLanguageChange = (newLang: CodingLanguage) => {
    if (!selectedProblem) return;
    setLanguage(newLang);
    setCodeBuffers((prev) => {
      if (prev[newLang]) return prev;
      const starter =
        (selectedProblem.starterCode as any)?.[newLang] ||
        DEFAULT_STARTER[newLang] ||
        '';
      return { ...prev, [newLang]: starter };
    });
    showToast(`Switched editor to ${LANGUAGE_LABELS[newLang]}`, 'info');
  };

  const handleResetCode = () => {
    if (!selectedProblem) return;
    const starter =
      (selectedProblem.starterCode as any)?.[language] ||
      DEFAULT_STARTER[language] ||
      '';
    handleCodeChange(starter);
    showToast('Reset editor to starter template', 'info');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    showToast('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSolved = async () => {
    if (!selectedProblem) return;
    const nextSolved = !selectedProblem.solved;
    try {
      await codingService.toggleSolved(selectedProblem.id, nextSolved);
      setProblems((prev) =>
        prev.map((p) => (p.id === selectedProblem.id ? { ...p, solved: nextSolved } : p))
      );
      showToast(nextSolved ? 'Problem marked as solved!' : 'Problem marked as unsolved', 'info');
    } catch {
      showToast('Failed to update problem status', 'warning');
    }
  };

  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setRunResult(null);
    setConsoleTab('output');
    try {
      const inputToSend =
        consoleTab === 'custom' || customInput
          ? customInput
          : selectedProblem.testCases?.[activeTestcase]?.input || '';

      const result = await codingService.runSample(selectedProblem.id, {
        language,
        sourceCode: currentCode,
        customInput: inputToSend,
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
        memory: result.memoryKb != null ? `${Math.round((result.memoryKb / 1024) * 10) / 10} MB` : '—',
        output: outputLines,
      });

      // Save draft code to backend
      void codingService.saveProgress(selectedProblem.id, {
        codeDrafts: { [language]: currentCode },
        lastLanguage: language,
      });

      if (ok) {
        showToast('Sample execution completed successfully!');
      } else {
        showToast(`Execution status: ${result.status}`, 'warning');
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Code execution request failed.';
      setRunResult({
        ok: false,
        status: 'Execution Error',
        runtime: '—',
        memory: '—',
        output: msg,
        errorDetail: msg,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setRunResult(null);
    setConsoleTab('results');
    try {
      const submission = await codingService.submitSolution(selectedProblem.id, {
        language,
        sourceCode: currentCode,
      });

      setSubmissions((prev) => [submission, ...prev]);

      const isAccepted = submission.status === 'ACCEPTED';
      const outputLines = [
        submission.compileOutput ? `Compile Output:\n${submission.compileOutput}` : '',
        submission.stderr ? `Stderr:\n${submission.stderr}` : '',
        submission.stdout ? `Last Output:\n${submission.stdout}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      setRunResult({
        ok: isAccepted,
        status: submission.status,
        runtime: submission.runtimeMs != null ? `${submission.runtimeMs} ms` : '—',
        memory: submission.memoryKb != null ? `${Math.round((submission.memoryKb / 1024) * 10) / 10} MB` : '—',
        output: outputLines || `Passed ${submission.passedCount}/${submission.totalCount} test cases.`,
      });

      if (isAccepted) {
        setProblems((prev) =>
          prev.map((p) => (p.id === selectedProblem.id ? { ...p, solved: true } : p))
        );
        showToast('Accepted! All test cases passed successfully!', 'info');
      } else {
        showToast(`Submission Verdict: ${submission.status} (${submission.passedCount}/${submission.totalCount} passed)`, 'warning');
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Solution submission failed.';
      setRunResult({
        ok: false,
        status: 'Submission Failed',
        runtime: '—',
        memory: '—',
        output: msg,
      });
    } finally {
      setIsRunning(false);
    }
  };

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

  if (loadError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Unable to load Coding Practice workspace</span>
          </div>
          <p className="text-xs text-[#77788B]">{loadError}</p>
          <button
            onClick={loadWorkspace}
            className="px-4 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#F7F7FC] p-4 max-w-none overflow-y-auto' : ''}`}>
      {/* TOP HEADER: COLLECTION SWITCHER & TELEMETRY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E2E4EB] p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] border border-[#D6D9FB] flex items-center justify-center text-[#5145E5] shadow-xs">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#17182B] tracking-tight flex items-center gap-2">
              Coding Practice & VS Code Sandbox
              <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Monaco + Judge0
              </span>
            </h1>
            <p className="text-xs text-[#77788B]">
              Master curated Striver A2Z DSA and TLE CP-31 roadmaps with 4-space Tab indentation and instant judging.
            </p>
          </div>
        </div>

        {/* Collection Selector Tabs */}
        <div className="flex items-center p-1 bg-[#F4F5FB] border border-[#E2E4EB] rounded-xl shrink-0">
          <button
            onClick={() => {
              setCollectionFilter('ALL');
              setRatingFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              collectionFilter === 'ALL'
                ? 'bg-[#5145E5] text-white shadow-xs'
                : 'text-[#77788B] hover:text-[#17182B]'
            }`}
          >
            All Tracks ({problems.length})
          </button>
          <button
            onClick={() => {
              setCollectionFilter('STRIVER_A2Z');
              setRatingFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              collectionFilter === 'STRIVER_A2Z'
                ? 'bg-[#5145E5] text-white shadow-xs'
                : 'text-[#77788B] hover:text-[#17182B]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Striver A2Z ({stats?.striverTotal ?? problems.filter((p) => p.collection === 'STRIVER_A2Z').length})
          </button>
          <button
            onClick={() => {
              setCollectionFilter('CP_31');
              setRatingFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              collectionFilter === 'CP_31'
                ? 'bg-[#5145E5] text-white shadow-xs'
                : 'text-[#77788B] hover:text-[#17182B]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            TLE CP-31 ({stats?.cp31Total ?? problems.filter((p) => p.collection === 'CP_31').length})
          </button>
        </div>
      </div>

      {/* ZONE 1: WORKSPACE TELEMETRY & PROBLEM SELECTOR */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Progress Summary */}
          <div className="bg-white border border-[#E2E4EB] p-5 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5145E5]" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#77788B] font-bold">
                    Practice Telemetry
                  </span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full border font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                  Judge0 Engine Ready
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-base font-bold text-[#17182B] tracking-tight">
                  Overall Completion
                </h2>
                <span className="font-mono text-xs font-semibold text-[#5145E5]">
                  {solvedProblemCount} <span className="text-[#77788B] font-normal">/ {problems.length} Solved</span>
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-[#F4F5FB] overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#5145E5] to-indigo-500 transition-all"
                  style={{
                    width: problems.length > 0 ? `${Math.round((solvedProblemCount / problems.length) * 100)}%` : '0%',
                  }}
                />
              </div>

              {/* Sub-track Progress */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E2E4EB]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#17182B] font-semibold">Striver A2Z</span>
                    <span className="font-mono text-[#5145E5] font-bold">
                      {stats?.striverSolved ?? 0}/{stats?.striverTotal ?? 10}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#E2E4EB] overflow-hidden">
                    <div
                      className="h-full bg-[#5145E5] rounded-full"
                      style={{
                        width: `${stats?.striverTotal ? Math.round((stats.striverSolved / stats.striverTotal) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E2E4EB]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#17182B] font-semibold">TLE CP-31</span>
                    <span className="font-mono text-indigo-600 font-bold">
                      {stats?.cp31Solved ?? 0}/{stats?.cp31Total ?? 10}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#E2E4EB] overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{
                        width: `${stats?.cp31Total ? Math.round((stats.cp31Solved / stats.cp31Total) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E4EB] text-[#77788B]">
              <span>Total Submissions: {submissions.length}</span>
              <span className="text-emerald-700 font-mono font-semibold">
                Accepted: {acceptedSubmissionsCount}
              </span>
            </div>
          </div>

          {/* Card 2: Problem Selector & Filter */}
          <div className="bg-white border border-[#E2E4EB] p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-[#77788B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search problems, contest IDs (e.g. 231A), topics..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F8F9FD] border border-[#E2E4EB] rounded-xl text-xs text-[#17182B] placeholder-[#77788B] focus:outline-none focus:border-[#5145E5]"
                />
              </div>
              <div className="flex items-center gap-1">
                {(['All', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                      difficultyFilter === diff
                        ? 'bg-[#EEF0FF] text-[#5145E5] border border-[#D6D9FB] font-bold'
                        : 'bg-[#F8F9FD] text-[#77788B] hover:text-[#17182B] border border-[#E2E4EB]'
                    }`}
                  >
                    {diff === 'All' ? 'All' : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* CP-31 Rating Filter if CP-31 or ALL is selected */}
            {(collectionFilter === 'CP_31' || collectionFilter === 'ALL') && (
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[11px] font-mono">
                <span className="text-[#77788B] text-[10px] uppercase font-bold shrink-0">Rating:</span>
                {(['ALL', '800', '900', '1000'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatingFilter(r)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors shrink-0 cursor-pointer ${
                      ratingFilter === r
                        ? 'bg-[#EEF0FF] text-[#5145E5] border border-[#D6D9FB] font-bold'
                        : 'bg-[#F8F9FD] text-[#77788B] hover:text-[#17182B] border border-[#E2E4EB]'
                    }`}
                  >
                    {r === 'ALL' ? 'All Ratings' : `★ ${r}`}
                  </button>
                ))}
              </div>
            )}

            {/* Problem Horizontal Scroll List */}
            <div className="flex gap-2 overflow-x-auto pb-1 max-h-[140px]">
              {filteredProblems.length === 0 ? (
                <p className="text-xs text-[#77788B] py-3">
                  No coding problems match your current filters.
                </p>
              ) : (
                filteredProblems.map((p) => {
                  const active = selectedProblem?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`shrink-0 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-[#EEF0FF] border-[#5145E5] text-[#17182B] shadow-xs'
                          : 'bg-[#F8F9FD] border-[#E2E4EB] text-[#77788B] hover:text-[#17182B] hover:border-[#D6D9FB]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {p.solved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        <span className="text-xs font-semibold truncate max-w-[180px] text-[#17182B]">
                          {p.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[#77788B]">
                        <span className="text-[#5145E5] font-semibold">
                          {p.collection === 'CP_31' ? 'CP-31' : 'A2Z'}
                        </span>
                        {p.rating && <span className="text-amber-600 font-bold">★{p.rating}</span>}
                        {p.problemIdentifier && <span>[{p.problemIdentifier}]</span>}
                        <span>{p.difficulty}</span>
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
        <div className="bg-white border border-[#E2E4EB] rounded-2xl p-8 text-center text-xs text-[#77788B] shadow-xs">
          No coding problems found in database. Seed the database or adjust your filter.
        </div>
      ) : (
        /* ZONE 2: PROFESSIONAL TWO-PANEL WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL (5 cols): PROBLEM DESCRIPTION & HISTORY */}
          <div className="lg:col-span-5 bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-xs space-y-4 max-h-[820px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLeftTab('description')}
                  className={`text-xs font-semibold pb-1 transition-all cursor-pointer ${
                    leftTab === 'description'
                      ? 'text-[#5145E5] border-b-2 border-[#5145E5]'
                      : 'text-[#77788B] hover:text-[#17182B]'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setLeftTab('submissions')}
                  className={`text-xs font-semibold pb-1 transition-all inline-flex items-center gap-1 cursor-pointer ${
                    leftTab === 'submissions'
                      ? 'text-[#5145E5] border-b-2 border-[#5145E5]'
                      : 'text-[#77788B] hover:text-[#17182B]'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Submissions ({problemSubmissions.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Mark as Solved Toggle */}
                <button
                  onClick={handleToggleSolved}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedProblem.solved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-[#F8F9FD] text-[#77788B] border-[#E2E4EB] hover:text-[#17182B]'
                  }`}
                  title="Toggle problem solved status"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedProblem.solved ? 'Solved' : 'Mark Solved'}</span>
                </button>

                {/* Bookmark Button */}
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
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isBookmarked(selectedProblem.id)
                      ? 'bg-[#EEF0FF] text-[#5145E5] border-[#D6D9FB]'
                      : 'bg-[#F8F9FD] text-[#77788B] hover:text-[#17182B] border-[#E2E4EB]'
                  }`}
                  title="Bookmark problem"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {leftTab === 'description' ? (
              <div className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#77788B] mb-2">
                    <span className={`px-2 py-0.5 rounded border font-semibold ${difficultyBadge(selectedProblem.difficulty)}`}>
                      {selectedProblem.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#EEF0FF] text-[#5145E5] border border-[#D6D9FB] font-semibold">
                      {selectedProblem.collection === 'CP_31' ? 'TLE CP-31' : 'Striver A2Z'}
                    </span>
                    {selectedProblem.rating && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                        ★ Rating {selectedProblem.rating}
                      </span>
                    )}
                    {selectedProblem.contestNumber && (
                      <span>Contest #{selectedProblem.contestNumber}</span>
                    )}
                    {selectedProblem.problemIdentifier && (
                      <span>({selectedProblem.problemIdentifier})</span>
                    )}
                    <span>• {selectedProblem.track}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-xl font-bold text-[#17182B] tracking-tight">
                      {selectedProblem.title}
                    </h1>
                    {selectedProblem.externalUrl && (
                      <a
                        href={selectedProblem.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF0FF] hover:bg-[#E0E4FF] text-[#5145E5] border border-[#D6D9FB] text-xs font-mono font-semibold transition-colors"
                        title="Open external problem on Codeforces / LeetCode"
                      >
                        <span>Original Problem</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedProblem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full bg-[#F4F5FB] text-[10px] font-mono text-[#77788B] border border-[#E2E4EB]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-[#17182B] leading-relaxed whitespace-pre-line border-t border-[#E2E4EB] pt-3">
                  {selectedProblem.description}
                </div>

                {selectedProblem.examples?.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#77788B]">Examples</h4>
                    {selectedProblem.examples.map((ex, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E2E4EB] font-mono text-xs space-y-1.5">
                        <div>
                          <span className="text-[#5145E5] font-semibold">Input:</span>
                          <pre className="text-[#17182B] mt-0.5 whitespace-pre-wrap">{ex.input}</pre>
                        </div>
                        <div>
                          <span className="text-emerald-600 font-semibold">Output:</span>
                          <pre className="text-emerald-700 mt-0.5 whitespace-pre-wrap">{ex.output}</pre>
                        </div>
                        {ex.explanation && (
                          <div className="text-[#77788B] text-[11px] pt-1 border-t border-[#E2E4EB]">
                            <span className="font-semibold">Explanation:</span> {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedProblem.constraints?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#E2E4EB]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#77788B]">Constraints</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs font-mono text-[#77788B]">
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
                  <p className="text-xs text-[#77788B] py-6 text-center">
                    No submissions yet for this problem. Submit your solution using the editor on the right!
                  </p>
                ) : (
                  problemSubmissions.map((sub) => (
                    <div key={sub.id} className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E2E4EB] space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className={sub.status === 'ACCEPTED' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                          {sub.status}
                        </span>
                        <span className="text-[#77788B] text-[11px]">{new Date(sub.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#77788B]">
                        <span>Lang: {sub.language.toUpperCase()}</span>
                        <span>Passed: {sub.passedCount}/{sub.totalCount}</span>
                        <span>{sub.runtimeMs != null ? `${sub.runtimeMs} ms` : '—'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* RIGHT PANEL (7 cols): MONACO CODE EDITOR & CONSOLE */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-[#E2E4EB] rounded-2xl shadow-xs overflow-hidden">
              {/* Editor Top Control Bar */}
              <div className="px-4 py-2.5 bg-[#F8F9FD] border-b border-[#E2E4EB] flex flex-wrap items-center justify-between gap-2">
                {/* Language Selector Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        language === lang
                          ? 'bg-[#5145E5] text-white font-bold shadow-xs'
                          : 'text-[#77788B] hover:text-[#17182B] hover:bg-[#EEF0FF]'
                      }`}
                    >
                      {LANGUAGE_LABELS[lang] || lang}
                    </button>
                  ))}
                </div>

                {/* Editor Utility Actions */}
                <div className="flex items-center gap-2">
                  {/* Shortcuts Modal Trigger */}
                  <button
                    onClick={() => setShortcutsOpen(true)}
                    className="p-1.5 rounded-lg bg-white border border-[#E2E4EB] hover:bg-[#F4F5FB] text-[#77788B] hover:text-[#17182B] transition-colors cursor-pointer"
                    title="Keyboard Shortcuts Reference"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                  </button>

                  {/* Settings Dropdown Toggle */}
                  <div className="relative">
                    <button
                      onClick={() => setSettingsOpen((prev) => !prev)}
                      className="p-1.5 rounded-lg bg-white border border-[#E2E4EB] hover:bg-[#F4F5FB] text-[#77788B] hover:text-[#17182B] transition-colors cursor-pointer"
                      title="Editor Settings"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>

                    {settingsOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E4EB] rounded-xl shadow-lg p-3 z-50 text-xs space-y-3">
                        <div className="font-bold text-[#17182B] border-b border-[#E2E4EB] pb-1.5">
                          Editor Preferences
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#77788B]">Theme</span>
                          <button
                            onClick={() => setEditorTheme((t) => (t === 'light' ? 'vs-dark' : 'light'))}
                            className="px-2 py-0.5 rounded bg-[#F4F5FB] border border-[#E2E4EB] text-xs font-mono font-semibold"
                          >
                            {editorTheme === 'light' ? 'VS Light' : 'VS Dark'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#77788B]">Font Size</span>
                          <div className="flex items-center gap-1 font-mono">
                            <button
                              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                              className="px-2 py-0.5 bg-[#F4F5FB] border border-[#E2E4EB] rounded"
                            >
                              -
                            </button>
                            <span className="w-6 text-center">{fontSize}</span>
                            <button
                              onClick={() => setFontSize((s) => Math.min(20, s + 1))}
                              className="px-2 py-0.5 bg-[#F4F5FB] border border-[#E2E4EB] rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#77788B]">Word Wrap</span>
                          <button
                            onClick={() => setWordWrap((w) => !w)}
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              wordWrap ? 'bg-[#EEF0FF] text-[#5145E5]' : 'bg-[#F4F5FB] text-[#77788B]'
                            }`}
                          >
                            {wordWrap ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#77788B]">Minimap</span>
                          <button
                            onClick={() => setMinimap((m) => !m)}
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              minimap ? 'bg-[#EEF0FF] text-[#5145E5]' : 'bg-[#F4F5FB] text-[#77788B]'
                            }`}
                          >
                            {minimap ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Copy Code */}
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-white border border-[#E2E4EB] hover:bg-[#F4F5FB] text-[#77788B] hover:text-[#17182B] transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Reset Code */}
                  <button
                    onClick={handleResetCode}
                    className="p-1.5 rounded-lg bg-white border border-[#E2E4EB] hover:bg-[#F4F5FB] text-[#77788B] hover:text-[#17182B] transition-colors cursor-pointer"
                    title="Reset to starter template"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={() => setIsFullscreen((f) => !f)}
                    className="p-1.5 rounded-lg bg-white border border-[#E2E4EB] hover:bg-[#F4F5FB] text-[#77788B] hover:text-[#17182B] transition-colors cursor-pointer"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* REAL MONACO EDITOR */}
              <div className="p-2 bg-[#F8F9FD]">
                <MonacoCodeEditor
                  language={language}
                  value={currentCode}
                  onChange={handleCodeChange}
                  theme={editorTheme}
                  fontSize={fontSize}
                  wordWrap={wordWrap}
                  minimap={minimap}
                  height={isFullscreen ? '60vh' : '460px'}
                />
              </div>

              {/* Bottom Action Bar */}
              <div className="px-4 py-3 bg-[#F8F9FD] border-t border-[#E2E4EB] flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-[#77788B] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#5145E5]" />
                  Tab inserts 4 spaces • Auto indentation active ({LANGUAGE_LABELS[language]})
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="px-4 py-2 rounded-xl bg-white border border-[#E2E4EB] hover:bg-[#F4F5FB] text-[#17182B] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                    <span>{isRunning ? 'Running...' : 'Run Sample'}</span>
                  </button>
                  <button
                    onClick={handleSubmitCode}
                    disabled={isRunning}
                    className="px-5 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isRunning ? 'Submitting...' : 'Submit'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TESTCASES & EXECUTION CONSOLE */}
            <div className="bg-white border border-[#E2E4EB] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E4EB] pb-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setConsoleTab('testcases')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      consoleTab === 'testcases'
                        ? 'bg-[#EEF0FF] text-[#5145E5] font-bold border border-[#D6D9FB]'
                        : 'text-[#77788B] hover:text-[#17182B]'
                    }`}
                  >
                    Test Cases
                  </button>
                  <button
                    onClick={() => setConsoleTab('custom')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      consoleTab === 'custom'
                        ? 'bg-[#EEF0FF] text-[#5145E5] font-bold border border-[#D6D9FB]'
                        : 'text-[#77788B] hover:text-[#17182B]'
                    }`}
                  >
                    Custom Input
                  </button>
                  <button
                    onClick={() => setConsoleTab('output')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      consoleTab === 'output'
                        ? 'bg-[#EEF0FF] text-[#5145E5] font-bold border border-[#D6D9FB]'
                        : 'text-[#77788B] hover:text-[#17182B]'
                    }`}
                  >
                    Output
                  </button>
                  <button
                    onClick={() => setConsoleTab('results')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      consoleTab === 'results'
                        ? 'bg-[#EEF0FF] text-[#5145E5] font-bold border border-[#D6D9FB]'
                        : 'text-[#77788B] hover:text-[#17182B]'
                    }`}
                  >
                    Results
                  </button>
                </div>

                {runResult && (
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold ${
                        runResult.ok
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {runResult.status}
                    </span>
                    <span className="text-[#77788B]">Time: {runResult.runtime}</span>
                    <span className="text-[#77788B]">Memory: {runResult.memory}</span>
                  </div>
                )}
              </div>

              {/* Console Tab Contents */}
              {consoleTab === 'testcases' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {(selectedProblem.testCases || []).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveTestcase(i)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          activeTestcase === i
                            ? 'bg-[#5145E5] text-white font-bold'
                            : 'bg-[#F8F9FD] border border-[#E2E4EB] text-[#77788B] hover:text-[#17182B]'
                        }`}
                      >
                        Case {i + 1}
                      </button>
                    ))}
                  </div>

                  {selectedProblem.testCases?.[activeTestcase] && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E2E4EB]">
                        <span className="text-[#77788B] font-semibold block mb-1">Standard Input (stdin):</span>
                        <pre className="text-[#17182B] whitespace-pre-wrap">
                          {selectedProblem.testCases[activeTestcase].input}
                        </pre>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#E2E4EB]">
                        <span className="text-emerald-700 font-semibold block mb-1">Expected Output:</span>
                        <pre className="text-emerald-800 whitespace-pre-wrap">
                          {selectedProblem.testCases[activeTestcase].expectedOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {consoleTab === 'custom' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#77788B]">
                    Custom Standard Input (stdin):
                  </label>
                  <textarea
                    rows={4}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input lines here..."
                    className="w-full p-3 rounded-xl bg-[#F8F9FD] border border-[#E2E4EB] text-xs font-mono text-[#17182B] placeholder-[#77788B] focus:outline-none focus:border-[#5145E5]"
                  />
                </div>
              )}

              {consoleTab === 'output' && (
                <div className="p-3 rounded-xl bg-[#17182B] text-gray-100 font-mono text-xs overflow-x-auto min-h-[100px] whitespace-pre-wrap">
                  {runResult?.output || '(Run your code to view standard output and execution diagnostics here)'}
                </div>
              )}

              {consoleTab === 'results' && (
                <div className="p-4 rounded-xl bg-[#F8F9FD] border border-[#E2E4EB] text-xs font-mono space-y-2">
                  {runResult ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                        <span className={runResult.ok ? 'text-emerald-700' : 'text-rose-700'}>
                          Verdict: {runResult.status}
                        </span>
                      </div>
                      <p className="text-[#77788B]">{runResult.output}</p>
                    </div>
                  ) : (
                    <p className="text-[#77788B]">Click Submit to evaluate your solution against all hidden test cases.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {shortcutsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E4EB] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3">
              <div className="flex items-center gap-2 text-base font-bold text-[#17182B]">
                <Keyboard className="w-5 h-5 text-[#5145E5]" />
                <span>Monaco Editor Keyboard Shortcuts</span>
              </div>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="text-[#77788B] hover:text-[#17182B] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono divide-y divide-[#E2E4EB]">
              {[
                { key: 'Tab', desc: 'Insert 4 spaces (preserves editor focus)' },
                { key: 'Shift + Tab', desc: 'Decrease indentation' },
                { key: 'Enter', desc: 'Maintain automatic indentation' },
                { key: 'Ctrl + / (Cmd + /)', desc: 'Toggle line comments' },
                { key: 'Ctrl + D (Cmd + D)', desc: 'Select next matching occurrence' },
                { key: 'Ctrl + F (Cmd + F)', desc: 'Find in file' },
                { key: 'Ctrl + H (Cmd + H)', desc: 'Find and replace' },
                { key: 'Ctrl + Z / Ctrl + Shift + Z', desc: 'Undo / Redo' },
                { key: 'Ctrl + A', desc: 'Select all code' },
                { key: 'Ctrl + Home / End', desc: 'Jump to beginning / end of file' },
              ].map((sc, i) => (
                <div key={i} className="flex items-center justify-between pt-2">
                  <kbd className="px-2 py-0.5 rounded bg-[#F4F5FB] border border-[#E2E4EB] text-[#5145E5] font-semibold">
                    {sc.key}
                  </kbd>
                  <span className="text-[#77788B] text-right font-sans">{sc.desc}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShortcutsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold cursor-pointer"
            >
              Close Shortcuts Reference
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
