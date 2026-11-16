// src/pages/LandingPage.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Zap,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Bot,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Play,
  Activity,
  Code2,
  Building2,
  FolderGit2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'MESI' | 'CACHE' | 'COMPACTION'>('MESI');

  const copyCommand = () => {
    navigator.clipboard.writeText('curl -s https://prepai.dev/start | bash');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const disciplines = [
    {
      code: 'CSE',
      title: 'Computer Science & Engineering',
      desc: 'Distributed systems, low-level concurrency, OS internals, database indexing, and algorithmic problem solving.',
      tags: ['C++20', 'Raft Consensus', 'LSM-Trees', 'eBPF'],
      companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
      stats: '1,420+ Drills',
    },
    {
      code: 'ECE',
      title: 'Electronics & Communication',
      desc: 'Digital VLSI design, clock domain crossing (CDC) metastability, FPGA synthesis, RTL pipelining, and DSP protocols.',
      tags: ['SystemVerilog', 'Static Timing', 'Gray Code FIFO', 'DSP'],
      companies: ['Qualcomm', 'Nvidia', 'Intel', 'Apple Hardware'],
      stats: '980+ Drills',
    },
    {
      code: 'EE',
      title: 'Electrical Engineering',
      desc: 'Power electronics, grid telemetry, inverter switching topologies, control systems state-space models, and embedded firmware.',
      tags: ['SVPWM', 'BLDC Drives', 'Microcontrollers', 'State-Space'],
      companies: ['Tesla', 'Texas Instruments', 'Schneider', 'L&T'],
      stats: '760+ Drills',
    },
    {
      code: 'ME',
      title: 'Mechanical Engineering',
      desc: 'Finite element analysis (FEA), computational fluid dynamics (CFD), heat transfer thermal budgets, and kinematic robotics.',
      tags: ['Ansys FEA', 'Navier-Stokes', 'GD&T', 'Kinematics'],
      companies: ['Boeing', 'General Electric', 'Tata Motors', 'Airbus'],
      stats: '690+ Drills',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7FC] text-[#17182B] font-sans selection:bg-[#5145E5]/20 selection:text-[#5145E5]">
      {/* 1. FIXED TOP NAVIGATION */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E4EB] shadow-2xs">
        <div className="h-16 max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#5145E5] text-white flex items-center justify-center shadow-xs">
                <Zap className="w-4 h-4 fill-current text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#17182B]">
                Prep<span className="text-[#5145E5]">AI</span>
              </span>
            </NavLink>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              v2.4 Live
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#77788B]">
            <a href="#workbench-preview" className="hover:text-[#17182B] transition-colors">Workbench</a>
            <a href="#engineering-matrix" className="hover:text-[#17182B] transition-colors">Disciplines</a>
            <a href="#features" className="hover:text-[#17182B] transition-colors">AI Examiner</a>
            <NavLink to="/coding-practice" className="hover:text-[#17182B] transition-colors">Practice Sheets</NavLink>
            <NavLink to="/resources" className="hover:text-[#17182B] transition-colors">Curriculum Library</NavLink>
            <NavLink to="/admin" className="hover:text-[#5145E5] transition-colors">Admin Console</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <NavLink
              to="/login"
              className="text-xs font-semibold text-[#17182B] hover:text-[#5145E5] px-3 py-1.5 rounded-lg hover:bg-[#F4F4FA] transition-all"
            >
              Sign In
            </NavLink>
            <NavLink
              to="/register"
              className="text-xs font-semibold bg-[#5145E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Get Started</span>
            </NavLink>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <main className="pt-16">
        {/* HERO SECTION MATCHING SCREENSHOT */}
        <section className="relative overflow-hidden pt-16 pb-16 px-6">
          <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center">
            {/* Pill matching top pill in screenshot */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E2E4EB] shadow-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-[#5145E5]">
                MODE: Adaptive Verbal &amp; Code Execution
              </span>
              <span className="text-[#CBD0E0]">·</span>
              <span className="text-xs text-[#77788B] font-medium">4 Disciplines Active</span>
            </div>

            {/* Central White Card Inspired by User's Reference Screenshot */}
            <div className="w-full bg-white border border-[#E2E4EB] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EEF2FF] text-[#5145E5] font-mono text-xs font-bold tracking-wide uppercase border border-[#E0E7FF]">
                <Zap className="w-3.5 h-3.5 fill-current" />
                AI TECHNICAL EXAMINER
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#17182B] leading-tight">
                Prepare Smarter.
                <br />
                Practice Better.
                <br />
                <span className="text-[#5145E5]">
                  Crack Your Next Technical Interview.
                </span>
              </h1>

              <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#77788B] leading-relaxed">
                The intelligent preparation suite with adaptive verbal cross-examinations, low-latency code execution, and company hiring rubrics tailored for B.Tech engineers.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <NavLink
                  to="/dashboard"
                  className="px-6 py-3 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-sm font-semibold tracking-wide shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Start Free Practice</span>
                  <ArrowRight className="w-4 h-4" />
                </NavLink>
                <a
                  href="#engineering-matrix"
                  className="px-5 py-3 rounded-xl bg-[#F4F4FA] hover:bg-[#EAEAF4] border border-[#E2E4EB] text-[#17182B] text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#5145E5]" />
                  <span>Explore 4 Disciplines</span>
                </a>
              </div>
            </div>

            {/* Dark Dev Console Widget Matching Attached Screenshot */}
            <div className="w-full max-w-xl mt-8 bg-[#17182B] rounded-2xl p-4 shadow-xl border border-[#2B2D42] text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="ml-2 font-mono text-[11px] font-bold text-gray-400">
                    DEV_CONSOLE
                  </span>
                </div>
                <span className="font-mono text-[11px] text-gray-500">bash</span>
              </div>

              <div className="pt-3 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 text-gray-200">
                  <span className="text-emerald-400 font-bold">$</span>
                  <span>curl -s https://prepai.dev/start | _</span>
                </div>
                <button
                  onClick={copyCommand}
                  className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Stats Row Matching Screenshot */}
            <div className="w-full max-w-xl mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#E2E4EB] rounded-2xl p-5 shadow-sm text-left">
                <div className="flex items-center justify-between text-[#77788B] text-xs font-semibold">
                  <span>Total Sessions</span>
                  <Bot className="w-4 h-4 text-[#5145E5]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#17182B] mt-1 font-mono">
                  52,000+
                </div>
                <span className="text-xs text-[#77788B] mt-0.5 block">Mock Interviews Completed</span>
              </div>

              <div className="bg-white border border-[#E2E4EB] rounded-2xl p-5 shadow-sm text-left">
                <div className="flex items-center justify-between text-[#77788B] text-xs font-semibold">
                  <span>Offer Rate</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 font-mono">
                  94.8%
                </div>
                <span className="text-xs text-[#77788B] mt-0.5 block">Placement Success Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* WORKBENCH PREVIEW CENTERPIECE */}
        <section id="workbench-preview" className="relative max-w-7xl mx-auto px-6 py-12">
          {/* Header Bar */}
          <div className="bg-white border border-[#E2E4EB] rounded-t-2xl px-5 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              </div>
              <span className="font-mono text-xs text-[#77788B] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#5145E5]" />
                live_interview_session // Real-Time AI Examination
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 font-mono text-xs text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Live Evaluation
              </span>
            </div>
          </div>

          {/* Split Workspace Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border-x border-b border-[#E2E4EB] rounded-b-2xl shadow-sm overflow-hidden">
            {/* Left: AI Examiner Telemetry */}
            <div className="lg:col-span-5 bg-[#FAFAFC] p-6 flex flex-col justify-between space-y-5 border-b lg:border-b-0 lg:border-r border-[#E2E4EB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#5145E5] flex items-center justify-center border border-[#E0E7FF]">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#17182B]">PrepAI Examiner v2.4</h4>
                    <span className="text-[11px] text-[#77788B] font-mono">Concurrency &amp; Core Systems</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  EVALUATING
                </span>
              </div>

              {/* Active Prompt */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E4EB] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#5145E5] font-bold uppercase">Question Prompt #02</span>
                  <span className="text-[#77788B]">Follow-up Probe</span>
                </div>
                <p className="text-xs text-[#17182B] leading-relaxed font-medium">
                  "Explain how cache coherence protocols (<strong className="text-[#5145E5]">MESI</strong>) maintain state transitions across multicore L1/L2 caches, and how hardware store buffers introduce memory reordering risks."
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-white p-2.5 rounded-xl border border-[#E2E4EB]">
                  <span className="block text-[10px] text-[#77788B]">LATENCY</span>
                  <span className="text-emerald-600 font-bold">18 ms</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#E2E4EB]">
                  <span className="block text-[10px] text-[#77788B]">CONCEPT HIT</span>
                  <span className="text-[#17182B] font-bold">97.2%</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#E2E4EB]">
                  <span className="block text-[10px] text-[#77788B]">RUBRIC</span>
                  <span className="text-[#5145E5] font-bold">L4 SWE Bar</span>
                </div>
              </div>
            </div>

            {/* Right: Code Buffer */}
            <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-4 bg-[#17182B] text-gray-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono font-bold text-gray-300">cache_coherence.cpp</span>
                <span className="text-[11px] font-mono text-purple-400">C++20 ISO Standard</span>
              </div>

              <div className="p-4 rounded-xl font-mono text-xs text-gray-300 overflow-x-auto space-y-1">
                <div className="text-gray-500">// Cache Line alignment to avoid false sharing across CPU cores</div>
                <div><span className="text-purple-400">struct</span> <span className="text-cyan-400">alignas</span>(64) CoherenceNode {'{'}</div>
                <div className="pl-4"><span className="text-purple-400">std::atomic</span>&lt;<span className="text-cyan-400">uint64_t</span>&gt; sequence_num{'{'}0{'}'};</div>
                <div className="pl-4"><span className="text-purple-400">std::atomic</span>&lt;<span className="text-cyan-400">bool</span>&gt; modified_flag{'{'}<span className="text-amber-400">false</span>{'}'};</div>
                <div className="pl-4 text-gray-500">// Store buffer drain flush barrier before release semantics</div>
                <div className="pl-4"><span className="text-purple-400">void</span> <span className="text-cyan-400">publish</span>(<span className="text-cyan-400">uint64_t</span> val) {'{'}</div>
                <div className="pl-8">payload = val;</div>
                <div className="pl-8">std::atomic_thread_fence(std::memory_order_release);</div>
                <div className="pl-8">sequence_num.store(val, std::memory_order_relaxed);</div>
                <div className="pl-4">{'}'}</div>
                <div>{'}'};</div>
              </div>

              <div className="p-3 bg-[#20232C] rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-300">Rubric Validation: 96.4%</span>
                </div>
                <NavLink
                  to="/coding-practice"
                  className="px-3 py-1 rounded-lg bg-[#5145E5] text-white text-[11px] font-semibold"
                >
                  Open Sandbox
                </NavLink>
              </div>
            </div>
          </div>
        </section>

        {/* 4 ENGINEERING DISCIPLINES MATRIX */}
        <section id="engineering-matrix" className="py-16 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs text-[#5145E5] font-bold tracking-wider uppercase">
              Comprehensive Domain Coverage
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#17182B] mt-2">
              Engineered Specifically for 4 Core Disciplines
            </h2>
            <p className="text-sm text-[#77788B] mt-3 leading-relaxed">
              Real departmental syllabi, GATE technical benchmarks, and company interview problem archives for CSE, ECE, EE, and ME.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {disciplines.map((d) => (
              <div
                key={d.code}
                className="bg-white border border-[#E2E4EB] rounded-2xl p-6 flex flex-col justify-between hover:border-[#5145E5] hover:shadow-md transition-all group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] text-[#5145E5] font-bold text-sm flex items-center justify-center font-mono">
                      {d.code}
                    </span>
                    <span className="text-xs font-mono text-[#77788B] font-semibold">
                      {d.stats}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#17182B] group-hover:text-[#5145E5] transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-xs text-[#77788B] mt-2 leading-relaxed">
                    {d.desc}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {d.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-[#F7F7FC] text-[10px] font-mono text-[#17182B] border border-[#E2E4EB]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F0F1F5]">
                  <span className="text-[10px] text-[#77788B] uppercase tracking-wider block mb-1 font-semibold">
                    Target Placement Loops:
                  </span>
                  <div className="text-xs font-semibold text-[#17182B] truncate">
                    {d.companies.join(' · ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PLATFORM FEATURES GRID */}
        <section id="features" className="py-16 px-6 max-w-7xl mx-auto bg-white rounded-3xl border border-[#E2E4EB] my-12 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs text-[#5145E5] font-bold tracking-wider uppercase">
              Telemetry &amp; AI Architecture
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#17182B] mt-2">
              The PrepAI Advantage
            </h2>
            <p className="text-sm text-[#77788B] mt-2">
              High-fidelity preparation platform designed to mirror tier-1 campus technical loops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#5145E5] flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17182B]">Adaptive AI Examiner</h3>
              <p className="text-xs text-[#77788B] leading-relaxed">
                Evaluates candidate answers in real time, detecting missing tradeoffs, and generating targeted Socratic follow-up probes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#5145E5] flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17182B]">Monaco IDE &amp; Test Runner</h3>
              <p className="text-xs text-[#77788B] leading-relaxed">
                Full-featured editor supporting C++20, Python 3, Java, and C with sub-millisecond testcase execution and stdout telemetry.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#5145E5] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17182B]">Diagnostic Telemetry</h3>
              <p className="text-xs text-[#77788B] leading-relaxed">
                6-axis competency curves, radar progression charts, and curriculum compendiums across CSE, ECE, EE, and ME.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E2E4EB] py-10 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#77788B]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#5145E5] text-white flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-[#17182B]">PrepAI v2.4</span>
            <span>• Technical Interview Preparation Platform</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <NavLink to="/dashboard" className="hover:text-[#17182B] transition-colors">Dashboard</NavLink>
            <NavLink to="/mock-interviews" className="hover:text-[#17182B] transition-colors">Mock Interviews</NavLink>
            <NavLink to="/coding-practice" className="hover:text-[#17182B] transition-colors">Coding Practice</NavLink>
            <NavLink to="/resources" className="hover:text-[#17182B] transition-colors">Resources</NavLink>
            <NavLink to="/admin" className="hover:text-[#5145E5] transition-colors">Admin Console</NavLink>
          </div>
          <div>
            © 2026 PrepAI Systems Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
