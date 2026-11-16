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
    <div className="min-h-screen bg-[#F7F7FC] text-[#17182B] font-sans relative overflow-x-hidden selection:bg-[#5145E5]/20 selection:text-[#17182B] flex flex-col">
      <Toast />

      {/* Background Dotted Grid Texture & Ambient Emitters */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#D3D5E6_1.15px,transparent_1.15px)] [background-size:24px_24px]" />
      <div className="fixed -top-40 left-1/4 w-[620px] h-[340px] bg-indigo-500/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="fixed -bottom-40 right-1/4 w-[480px] h-[300px] bg-purple-500/5 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Navigation Strip */}
      <header className="relative z-20 h-16 border-b border-[#E2E4EB] bg-white/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#F0EEFF] border border-[#DDD8FE] flex items-center justify-center text-[#5145E5] group-hover:border-[#5145E5]/50 transition-colors">
                <Zap className="w-4 h-4 fill-current text-[#5145E5]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#17182B]">
                Prep<span className="text-[#5145E5]">AI</span>
              </span>
            </NavLink>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0EEFF] border border-[#DDD8FE] text-[#5145E5] font-mono text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5145E5] animate-pulse" />
              {badgeText}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <NavLink
              to="/"
              className="text-xs font-medium text-[#77788B] hover:text-[#17182B] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Home</span>
            </NavLink>

            {headerAction && (
              <div className="flex items-center gap-2 text-xs">
                <span className="hidden md:inline text-[#77788B]">
                  {headerAction.prompt}
                </span>
                <NavLink
                  to={headerAction.to}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-[#F7F7FC] border border-[#E2E4EB] hover:border-[#5145E5]/40 text-[#17182B] font-semibold transition-all shadow-xs"
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E2E4EB] shadow-xs">
                <Terminal className="w-3.5 h-3.5 text-[#5145E5]" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#5145E5] font-semibold">
                  Engineering Suite // Auth Gateway
                </span>
              </div>

              <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-[#17182B] leading-tight">
                {sideTitle}
              </h1>

              <p className="text-sm text-[#77788B] leading-relaxed">
                {sideSubtitle}
              </p>
            </div>

            {/* Platform Capabilities Card */}
            <div className="rounded-2xl bg-white border border-[#E2E4EB] p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#77788B] font-semibold">
                  Engineered Tracks
                </span>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                  4 B.Tech Branches
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {branches.map((branch) => (
                  <div
                    key={branch.code}
                    className="rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] p-3 space-y-1"
                  >
                    <span className="inline-block font-mono text-xs font-bold text-[#5145E5]">
                      {branch.code}
                    </span>
                    <p className="text-[11px] text-[#77788B] leading-snug">
                      {branch.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E2E4EB] grid grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#17182B] font-medium">
                  <Bot className="w-3.5 h-3.5 text-[#5145E5] shrink-0" />
                  <span>AI Examiner</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#17182B] font-medium">
                  <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Sandboxed Code</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#17182B] font-medium">
                  <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Resume Probes</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[#77788B] font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Encrypted JWT Session · Role-Scoped Access Control</span>
            </div>
          </aside>

          {/* Right Form Card */}
          <section className="lg:col-span-7 w-full max-w-xl mx-auto lg:max-w-none">
            <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#5145E5] to-indigo-400" />
              {children}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
