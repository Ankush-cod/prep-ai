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
  FolderGit2
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
      desc: 'Distributed systems, low-level concurrency, OS internals, database storage engines, and algorithmic problem solving.',
      tags: ['C++20', 'Raft Consensus', 'LSM-Trees', 'eBPF'],
      companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
      stats: '1,420+ Drills'
    },
    {
      code: 'ECE',
      title: 'Electronics & Communication',
      desc: 'Digital VLSI design, clock domain crossing (CDC) metastability, FPGA synthesis, RTL pipelining, and DSP protocols.',
      tags: ['SystemVerilog', 'Static Timing', 'Gray Code FIFO', 'DSP'],
      companies: ['Qualcomm', 'Nvidia', 'Intel', 'Apple Hardware'],
      stats: '980+ Drills'
    },
    {
      code: 'EE',
      title: 'Electrical Engineering',
      desc: 'Power electronics, grid telemetry, inverter switching topologies, control systems state-space models, and embedded firmware.',
      tags: ['SVPWM', 'BLDC Drives', 'Microcontrollers', 'State-Space'],
      companies: ['Tesla', 'Texas Instruments', 'Schneider', 'L&T'],
      stats: '760+ Drills'
    },
    {
      code: 'ME',
      title: 'Mechanical Engineering',
      desc: 'Finite element analysis (FEA), computational fluid dynamics (CFD), heat transfer thermal budgets, and kinematic robotics.',
      tags: ['Ansys FEA', 'Navier-Stokes', 'GD&T', 'Kinematics'],
      companies: ['Boeing', 'General Electric', 'Tata Motors', 'Airbus'],
      stats: '690+ Drills'
    }
  ];

  return (
    <div className="min-h-screen bg-[#191B22] text-[#e3e2e8] font-sans selection:bg-purple-600/30 selection:text-white">
      {/* FIXED TOP NAVIGATION */}
      <header className="fixed top-0 w-full z-50 bg-[#20232C]/85 backdrop-blur-xl border-b border-[#353946] shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="h-16 max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#242731] border border-[#353946] flex items-center justify-center text-purple-400 group-hover:border-purple-500/50 transition-colors">
                <Zap className="w-4 h-4 fill-current text-purple-400" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Prep<span className="text-purple-400">AI</span>
              </span>
            </NavLink>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
              v2.4 Live
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-gray-400">
            <a href="#workbench-preview" className="hover:text-white transition-colors">Workbench</a>
            <a href="#engineering-matrix" className="hover:text-white transition-colors">Disciplines</a>
            <a href="#features" className="hover:text-white transition-colors">AI Examiner</a>
            <NavLink to="/coding-practice" className="hover:text-white transition-colors">Practice Sheets</NavLink>
            <NavLink to="/resources" className="hover:text-white transition-colors">Resources</NavLink>
            <NavLink to="/admin" className="hover:text-purple-400 transition-colors">Admin Console</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <NavLink
              to="/login"
              className="text-xs font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className="text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Get Started</span>
            </NavLink>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-16">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-16 px-6">
          {/* Subtle grid and ambient purple emitter */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#958ea0_1px,transparent_1px)] [background-size:24px_24px]"></div>
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-purple-600/15 blur-[140px] pointer-events-none rounded-full"></div>

          <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
            {/* Version pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242731] border border-[#353946] shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-xs text-purple-300 font-semibold uppercase tracking-wider">
                AI Examiner Engine v2.4
              </span>
              <span className="text-gray-600">·</span>
              <span className="text-xs text-gray-400">4 Engineering Disciplines</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl leading-tight">
              Prepare Smarter. Practice Better.
              <br />
              <span className="bg-gradient-to-r from-purple-300 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Crack Your Next Technical Interview.
              </span>
            </h1>

            {/* Subhead */}
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed">
              The intelligent preparation suite with adaptive verbal cross-examinations, low-latency code execution, and company hiring rubrics tailored for B.Tech engineers.
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <NavLink
                to="/dashboard"
                className="group px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold tracking-wide shadow-[0_0_24px_rgba(139,92,246,0.4)] transition-all flex items-center gap-2"
              >
                <span>Start Free Practice</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </NavLink>
              <a
                href="#engineering-matrix"
                className="px-5 py-3 rounded-xl bg-[#242731] hover:bg-[#25262e] border border-[#353946] text-gray-200 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Explore 4 Disciplines</span>
              </a>

              {/* Terminal command snippet */}
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#20232C] border border-[#353946] text-gray-400 font-mono text-xs shadow-inner">
                <span className="text-emerald-400 font-bold">$</span>
                <code className="text-gray-200">curl -s https://prepai.dev/start | bash</code>
                <button
                  onClick={copyCommand}
                  className="text-gray-400 hover:text-white transition-colors ml-1 p-1 rounded"
                  title="Copy command"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {copied && <span className="text-[11px] text-emerald-400">Copied!</span>}
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-14 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#20232C]/80 p-4 rounded-2xl border border-[#353946] shadow-lg">
              <div className="p-4 bg-[#242731] rounded-xl text-center">
                <span className="block text-2xl lg:text-3xl font-bold text-white tracking-tight">52,000+</span>
                <span className="text-xs text-gray-400 mt-1 block">Mock Interviews</span>
              </div>
              <div className="p-4 bg-[#242731] rounded-xl text-center">
                <span className="block text-2xl lg:text-3xl font-bold text-emerald-400 tracking-tight">94.8%</span>
                <span className="text-xs text-gray-400 mt-1 block">Placement Offer Rate</span>
              </div>
              <div className="p-4 bg-[#242731] rounded-xl text-center">
                <span className="block text-2xl lg:text-3xl font-bold text-cyan-400 tracking-tight">240+</span>
                <span className="text-xs text-gray-400 mt-1 block">Tier-1 Rubrics</span>
              </div>
              <div className="p-4 bg-[#242731] rounded-xl text-center">
                <span className="block text-2xl lg:text-3xl font-bold text-purple-400 tracking-tight">4 Core</span>
                <span className="text-xs text-gray-400 mt-1 block">CSE · ECE · EE · ME</span>
              </div>
            </div>
          </div>
        </section>

        {/* WORKBENCH PREVIEW CENTERPIECE */}
        <section id="workbench-preview" className="relative max-w-7xl mx-auto px-6 py-12">
          {/* Header Bar */}
          <div className="bg-[#242731] border border-[#353946] rounded-t-2xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="font-mono text-xs text-gray-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                workspace_session_id_449f1 // Live Technical Interview Simulation
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#20232C] font-mono text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Live 18ms Latency
              </span>
              <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-xs font-semibold">
                Senior SWE Panel
              </span>
            </div>
          </div>

          {/* Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#191B22] border-x border-b border-[#353946] rounded-b-2xl shadow-2xl overflow-hidden">
            {/* Left: AI Examiner Telemetry */}
            <div className="lg:col-span-5 bg-[#20232C] p-6 flex flex-col justify-between space-y-5 border-b lg:border-b-0 lg:border-r border-[#353946]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">PrepAI Examiner v2.4</h4>
                    <span className="text-[11px] text-gray-400 font-mono">Concurrence & Core Architecture</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  MESI-Evaluation
                </span>
              </div>

              {/* Active Prompt */}
              <div className="p-4 rounded-xl bg-[#242731] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 uppercase">Active Prompt #03</span>
                  <span className="text-gray-500">Follow-up: Deep Dive</span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                  "Explain memory cache coherence protocols (<strong className="text-purple-400">MESI</strong>) in multicore architecture and how store buffers introduce memory reordering risks in hardware-level concurrent access."
                </p>
              </div>

              {/* Audio Waveform */}
              <div className="p-4 rounded-xl bg-[#242731] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 uppercase tracking-wider text-[11px]">Candidate Audio Telemetry</span>
                  <span className="text-purple-400 font-mono text-[11px]">142 WPM · Natural Cadence</span>
                </div>
                <div className="h-10 bg-[#191B22] rounded-lg flex items-center justify-between px-3 gap-1 overflow-hidden">
                  <div className="w-1 bg-purple-500/40 rounded-full h-3 animate-pulse"></div>
                  <div className="w-1 bg-purple-500/60 rounded-full h-5"></div>
                  <div className="w-1 bg-purple-400 rounded-full h-8 animate-pulse"></div>
                  <div className="w-1 bg-purple-500/80 rounded-full h-6"></div>
                  <div className="w-1 bg-cyan-400 rounded-full h-7 animate-pulse"></div>
                  <div className="w-1 bg-cyan-400/90 rounded-full h-4"></div>
                  <div className="w-1 bg-emerald-400 rounded-full h-8"></div>
                  <div className="w-1 bg-emerald-400/70 rounded-full h-6 animate-pulse"></div>
                  <div className="w-1 bg-purple-400 rounded-full h-9"></div>
                  <div className="w-1 bg-purple-500/50 rounded-full h-5"></div>
                  <div className="w-1 bg-cyan-400 rounded-full h-3 animate-pulse"></div>
                  <div className="w-1 bg-purple-400/70 rounded-full h-7"></div>
                  <div className="w-1 bg-cyan-400/80 rounded-full h-8"></div>
                  <div className="w-1 bg-emerald-400 rounded-full h-4 animate-pulse"></div>
                  <div className="w-1 bg-purple-400 rounded-full h-6"></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-[#20232C] py-1.5 rounded">
                    <span className="block text-[9px] text-gray-500">ACOUSTIC LATENCY</span>
                    <span className="text-emerald-400 font-bold">18 ms</span>
                  </div>
                  <div className="bg-[#20232C] py-1.5 rounded">
                    <span className="block text-[9px] text-gray-500">CONCEPT HIT</span>
                    <span className="text-gray-200 font-bold">97.2%</span>
                  </div>
                  <div className="bg-[#20232C] py-1.5 rounded">
                    <span className="block text-[9px] text-gray-500">CONFIDENCE</span>
                    <span className="text-cyan-400 font-bold">Senior Tier</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Monaco IDE + Output */}
            <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-4 bg-[#191B22]">
              {/* File Tabs */}
              <div className="flex items-center justify-between border-b border-[#353946] pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('MESI')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                      activeTab === 'MESI'
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    cache_coherence.cpp
                  </button>
                  <button
                    onClick={() => setActiveTab('CACHE')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                      activeTab === 'CACHE'
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    lru_cache.go
                  </button>
                  <button
                    onClick={() => setActiveTab('COMPACTION')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                      activeTab === 'COMPACTION'
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    rocksdb_compaction.rs
                  </button>
                </div>
                <span className="text-[11px] font-mono text-gray-500">C++20 ISO / Clang 17</span>
              </div>

              {/* Code Buffer */}
              <div className="bg-[#20232C] rounded-xl p-4 font-mono text-xs text-gray-300 overflow-x-auto border border-white/5 space-y-1">
                <div className="text-gray-500">// Cache Line alignment to avoid false sharing across CPU cores</div>
                <div><span className="text-purple-400">struct</span> <span className="text-cyan-400">alignas</span>(64) CoherenceNode {'{'}</div>
                <div className="pl-4"><span className="text-purple-400">std::atomic</span>&lt;<span className="text-cyan-400">uint64_t</span>&gt; sequence_num{'{'}0{'}'};</div>
                <div className="pl-4"><span className="text-purple-400">std::atomic</span>&lt;<span className="text-cyan-400">bool</span>&gt; modified_flag{'{'}<span className="text-yellow-400">false</span>{'}'};</div>
                <div className="pl-4 text-gray-500">// Store buffer drain flush barrier before release semantics</div>
                <div className="pl-4"><span className="text-purple-400">void</span> <span className="text-cyan-400">publish</span>(<span className="text-cyan-400">uint64_t</span> val) {'{'}</div>
                <div className="pl-8">payload = val;</div>
                <div className="pl-8">std::atomic_thread_fence(std::memory_order_release);</div>
                <div className="pl-8">sequence_num.store(val, std::memory_order_relaxed);</div>
                <div className="pl-4">{'}'}</div>
                <div>{'}'};</div>
              </div>

              {/* Real-Time Proctor Rubric Bar */}
              <div className="p-3 bg-[#242731] rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-300">Rubric Validation: 94.2%</span>
                  <span className="text-gray-500 hidden sm:inline">• Zero False Sharing Verified</span>
                </div>
                <NavLink
                  to="/mock-interviews"
                  className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition-all"
                >
                  Launch Full Room
                </NavLink>
              </div>
            </div>
          </div>
        </section>

        {/* 4 ENGINEERING DISCIPLINES MATRIX */}
        <section id="engineering-matrix" className="py-16 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs text-purple-400 font-semibold tracking-wider uppercase">
              Comprehensive Domain Coverage
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-2">
              Engineered Specifically for 4 Core Disciplines
            </h2>
            <p className="text-sm text-gray-400 mt-3">
              No generic aptitude questionnaires. Real departmental syllabi, GATE technical benchmarks, and company interview problem archives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {disciplines.map((d) => (
              <div
                key={d.code}
                className="bg-[#20232C] border border-[#353946] rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/50 hover:bg-[#16171d] transition-all group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-400 font-bold text-sm flex items-center justify-center">
                      {d.code}
                    </span>
                    <span className="text-xs font-mono text-gray-500 group-hover:text-purple-400 transition-colors">
                      {d.stats}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {d.desc}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {d.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-gray-300 border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                    Target Placement Loops:
                  </span>
                  <div className="text-xs font-semibold text-gray-300 truncate">
                    {d.companies.join(' · ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PLATFORM FEATURES GRID */}
        <section id="features" className="py-16 px-6 max-w-7xl mx-auto bg-[#20232C]/50 rounded-3xl border border-white/5 my-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs text-purple-400 font-semibold tracking-wider uppercase">
              Telemetry & AI Architecture
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-2">
              The PrepAI Advantage
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              High-fidelity preparation platform designed to mirror tier-1 technical loops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#242731] border border-[#353946] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Adaptive AI Cross-Examiner</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Evaluates candidate answers in real-time, detecting missing tradeoffs, shallow answers, and generating targeted follow-up probes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#242731] border border-[#353946] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Monaco IDE & Test Runner</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Full-featured editor supporting C++20, Python 3, Go, and Java with sub-millisecond testcase execution and stdout telemetry.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#242731] border border-[#353946] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Diagnostic Telemetry</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Calibration curves, radar charts, weekly consistency heatmaps, and personalized vector prescriptions before campus drive cycles.
              </p>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-4xl mx-auto p-10 rounded-3xl bg-gradient-to-b from-[#242731] to-[#20232C] border border-[#353946] relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Ready for Your Campus Placement Drive?
            </h2>
            <p className="mt-4 text-sm text-gray-400 max-w-xl mx-auto">
              Join thousands of engineering students from IITs and NITs practicing daily with calibrated AI examiners.
            </p>
            <div className="mt-8 flex justify-center">
              <NavLink
                to="/dashboard"
                className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-[0_0_24px_rgba(139,92,246,0.5)] transition-all flex items-center gap-2"
              >
                <span>Enter Engineering Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </NavLink>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#353946] py-10 px-6 bg-[#20232C]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-semibold text-gray-300">PrepAI v2.4</span>
            <span>• Obsidian Telemetry Design System</span>
          </div>
          <div className="flex items-center gap-6">
            <NavLink to="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</NavLink>
            <NavLink to="/mock-interviews" className="hover:text-gray-300 transition-colors">Mock Interviews</NavLink>
            <NavLink to="/coding-practice" className="hover:text-gray-300 transition-colors">Coding Practice</NavLink>
            <NavLink to="/resources" className="hover:text-gray-300 transition-colors">Library</NavLink>
            <NavLink to="/admin" className="hover:text-purple-400 transition-colors">Admin Console</NavLink>
          </div>
          <div>
            © 2026 PrepAI Systems Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
