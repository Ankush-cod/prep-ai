// src/components/auth/AuthLayout.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  Terminal,
  Bot,
  Code2,
  Cpu,
  ArrowLeft,
} from 'lucide-react';
import { Toast } from '../common/Toast';

interface AuthLayoutProps {
  children: React.ReactNode;
  badgeText: string;
  sideTitle: string;
  sideSubtitle: string;
  headerAction?: {
    label: string;
    prompt: string;
    to: string;
  };
}

const branches = [
  { code: 'CSE', label: 'Algorithms, OS & Systems' },
  { code: 'ECE', label: 'VLSI, RTL & Signal Loops' },
  { code: 'EE', label: 'Power, Control & Firmware' },
  { code: 'ME', label: 'FEA, Thermo & Kinematics' },
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  badgeText,
  sideTitle,
  sideSubtitle,
  headerAction,
}) => {
  return (
    <div className="min-h-screen bg-[#191B22] text-[#e3e2e8] font-sans relative overflow-x-hidden selection:bg-[#8b5cf6]/30 selection:text-white flex flex-col">
      <Toast />

      {/* Background Obsidian Telemetry Texture & Ambient Emitters */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#958ea0_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="fixed -top-40 left-1/4 w-[620px] h-[340px] bg-purple-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="fixed -bottom-40 right-1/4 w-[480px] h-[300px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Navigation Strip */}
      <header className="relative z-20 h-16 border-b border-[#353946] bg-[#20232C]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#242731] border border-[#353946] flex items-center justify-center text-purple-400 group-hover:border-purple-500/50 transition-colors">
                <Zap className="w-4 h-4 fill-current text-purple-400" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Prep<span className="text-purple-400">AI</span>
              </span>
            </NavLink>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              {badgeText}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <NavLink
              to="/"
              className="text-xs font-medium text-gray-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Home</span>
            </NavLink>

            {headerAction && (
              <div className="flex items-center gap-2 text-xs">
                <span className="hidden md:inline text-gray-500">
                  {headerAction.prompt}
                </span>
                <NavLink
                  to={headerAction.to}
                  className="px-3.5 py-1.5 rounded-lg bg-[#242731] hover:bg-[#25262e] border border-[#353946] hover:border-purple-500/40 text-gray-200 font-medium transition-all"
                >
                  {headerAction.label}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Responsive Split Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8 lg:py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Telemetry Briefing Column */}
          <aside className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#242731] border border-[#353946]">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-purple-300 font-semibold">
                  Obsidian Telemetry // Auth Gateway
                </span>
              </div>

              <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
                {sideTitle}
              </h1>

              <p className="text-sm text-gray-400 leading-relaxed">
                {sideSubtitle}
              </p>
            </div>

            {/* Platform Capabilities Card */}
            <div className="rounded-2xl bg-[#20232C]/90 border border-[#353946] p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#353946] pb-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-gray-400">
                  Engineered Tracks
                </span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  4 B.Tech Branches
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {branches.map((branch) => (
                  <div
                    key={branch.code}
                    className="rounded-xl bg-[#242731] border border-white/5 p-3 space-y-1"
                  >
                    <span className="inline-block font-mono text-xs font-bold text-purple-400">
                      {branch.code}
                    </span>
                    <p className="text-[11px] text-gray-400 leading-snug">
                      {branch.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#353946] grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Bot className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>AI Examiner</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Sandboxed Code</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Resume Probes</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-gray-500 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Encrypted JWT Session · Role-Scoped Access Control</span>
            </div>
          </aside>

          {/* Right Form Card */}
          <section className="lg:col-span-7 w-full max-w-xl mx-auto lg:max-w-none">
            <div className="bg-[#20232C]/95 backdrop-blur-xl border border-[#353946] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/60 to-transparent" />
              {children}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
