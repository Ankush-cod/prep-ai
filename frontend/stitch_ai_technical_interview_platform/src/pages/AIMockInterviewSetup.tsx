// src/pages/AIMockInterviewSetup.tsx
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Terminal,
  Brain,
  Layers,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  FileText,
  Loader2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Branch } from '../types/prepai';
import { interviewService } from '../services/interviewService';
import { BackendResume, resumeService } from '../services/resumeService';

const TOPIC_SUGGESTIONS: Record<Branch, string[]> = {
  CSE: ['Data Structures & Algorithms', 'Operating Systems & Concurrency', 'DBMS & Indexing', 'Distributed System Design'],
  ECE: ['Digital VLSI & CDC', 'Signals & Systems', 'Embedded C & RTOS', 'Communication Protocols'],
  EE: ['Power Electronics & Converters', 'Control Systems & Stability', 'Electrical Machines', 'Embedded Firmware'],
  ME: ['Thermodynamics & Heat Transfer', 'Strength of Materials & FEA', 'Fluid Mechanics', 'Machine Design & Kinematics'],
};

export const AIMockInterviewSetup: React.FC = () => {
  const { profile, activeInterviewConfig, setActiveInterviewConfig, showToast } = useApp();
  const navigate = useNavigate();

  const [type, setType] = useState<'technical' | 'system_design' | 'behavioral' | 'hr'>(
    activeInterviewConfig.type
  );
  const [company, setCompany] = useState(activeInterviewConfig.company || 'Google');
  const [branch, setBranch] = useState<Branch>(profile.branch || activeInterviewConfig.branch);
  const [semester, setSemester] = useState<number>(profile.semester || 5);
  const [topic, setTopic] = useState<string>(TOPIC_SUGGESTIONS[profile.branch || 'CSE'][0]);
  const [difficulty, setDifficulty] = useState(activeInterviewConfig.difficulty || 'Medium');
  const [duration, setDuration] = useState(activeInterviewConfig.duration || 30);
  const [questionCount, setQuestionCount] = useState(activeInterviewConfig.questionCount || 4);
  const [resumeContext, setResumeContext] = useState(activeInterviewConfig.resumeContext);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [resumes, setResumes] = useState<BackendResume[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBranch(profile.branch || 'CSE');
    setSemester(profile.semester || 5);
  }, [profile.branch, profile.semester]);

  useEffect(() => {
    resumeService
      .listResumes()
      .then((items) => {
        setResumes(items);
        if (items.length > 0) {
          setSelectedResumeId(items[0].id);
        }
      })
      .catch(() => {
        // Non-blocking if user has not uploaded resumes yet
      });
  }, []);

  const interviewTypes = [
    {
      id: 'technical' as const,
      title: 'Technical Deep-Dive',
      desc: 'Core branch fundamentals, algorithms, system internals, and problem-solving tradeoffs.',
      tags: ['Branch Core', 'Problem Solving', 'Follow-Up Probes'],
      icon: Terminal,
    },
    {
      id: 'system_design' as const,
      title: 'System Design Architecture',
      desc: 'Scalable architecture, database partitioning, caching strategies, and failure resilience.',
      tags: ['Architecture', 'Scalability', 'Tradeoffs'],
      icon: Layers,
    },
    {
      id: 'behavioral' as const,
      title: 'Behavioral & Leadership',
      desc: 'Conflict resolution, decision ownership, engineering collaboration, and STAR structure.',
      tags: ['STAR Rubric', 'Communication', 'Ownership'],
      icon: Brain,
    },
    {
      id: 'hr' as const,
      title: 'HR & Fitment Screening',
      desc: 'Career narrative, project motivation, team fitment, and situational judgment scenarios.',
      tags: ['Fitment', 'Clarity', 'Trajectory'],
      icon: Sparkles,
    },
  ];

  const companies = [
    { name: 'Google', caliber: 'L3 / L4 SWE', tag: 'Algorithms & Systems' },
    { name: 'Microsoft', caliber: 'SDE / Core OS', tag: 'Design & Concurrency' },
    { name: 'Amazon', caliber: 'SDE-1 / AWS', tag: 'Scalable Services' },
    { name: 'Qualcomm', caliber: 'Firmware / ASIC', tag: 'VLSI & Embedded' },
    { name: 'Nvidia', caliber: 'Architecture', tag: 'Compute & Silicon' },
    { name: 'General Core', caliber: 'Campus Placement', tag: 'Branch Standard' },
  ];

  const branches: { code: Branch; name: string }[] = [
    { code: 'CSE', name: 'Computer Science & Engineering' },
    { code: 'ECE', name: 'Electronics & Communication' },
    { code: 'EE', name: 'Electrical Engineering' },
    { code: 'ME', name: 'Mechanical Engineering' },
  ];

  const difficulties = [
    { level: 'Easy (Foundations)', rigor: 'Core syllabus concepts, definitions, and fundamental reasoning' },
    { level: 'Medium', rigor: 'Applied problem-solving, edge cases, and practical architecture' },
    { level: 'Hard (L4+)', rigor: 'Production-scale tradeoffs, deep internals, and optimization proofs' },
    { level: 'Staff / Principal', rigor: 'Complex failure domains, multi-layer constraints, and synthesis' },
  ];

  const mapInterviewTypeEnum = (
    val: typeof type
  ): 'TECHNICAL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'HR' => {
    if (val === 'system_design') return 'SYSTEM_DESIGN';
    if (val === 'behavioral') return 'BEHAVIORAL';
    if (val === 'hr') return 'HR';
    return 'TECHNICAL';
  };

  const handleLaunch = async () => {
    if (!topic.trim()) {
      setError('Please enter or select a focus topic before starting.');
      return;
    }

    setError(null);
    setIsLaunching(true);

    try {
      setActiveInterviewConfig({
        ...activeInterviewConfig,
        type,
        company,
        branch,
        difficulty,
        duration,
        questionCount,
        resumeContext,
      });

      const session = await interviewService.createSession({
        branch,
        semester,
        interviewType: mapInterviewTypeEnum(type),
        difficulty,
        topic: topic.trim(),
        companyName: company === 'General Core' ? null : company,
        questionCount,
        durationMinutes: duration,
        resumeId: resumeContext && selectedResumeId ? selectedResumeId : null,
      });

      showToast('AI Interview session initialized');
      navigate(`/mock-interviews/live/${session.id}`);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to initialize AI interview session.';
      setError(msg);
      showToast(msg, 'warning');
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-gray-500 uppercase tracking-wider">
            <span>SIMULATIONS</span>
            <span>/</span>
            <span className="text-purple-300">NEW SESSION CONFIGURATION</span>
            <span>//</span>
            <span className="text-cyan-400 font-medium">GEMINI TEXT EXAMINER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Configure AI Mock Interview
          </h1>
          <p className="text-sm text-gray-400 max-w-3xl">
            Customize a text-based adaptive mock interview calibrated against your branch, semester, topic, target company, and optional parsed resume.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242731] border border-[#353946] self-start lg:self-center shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-emerald-400 font-medium">TEXT EXAMINER READY</span>
            <span className="text-gray-600">•</span>
            <span className="text-purple-300">Gemini Backend</span>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-300">Unable to Initialize Session</p>
            <p className="mt-0.5 text-red-200/90">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-6">
          {/* Section 01: Interview Type */}
          <section className="p-6 rounded-2xl bg-[#242731] border border-[#353946] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  01
                </span>
                <h2 className="text-base font-bold text-white">Interview Type</h2>
              </div>
              <span className="font-mono text-[11px] text-gray-500 uppercase tracking-wider">
                Evaluation Domain
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setType(item.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-purple-600/15 border-purple-500 shadow-md'
                        : 'bg-[#20232C] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-3">{item.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-gray-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 02: Target Company Profile */}
          <section className="p-6 rounded-2xl bg-[#242731] border border-[#353946] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  02
                </span>
                <h2 className="text-base font-bold text-white">Target Company Calibration</h2>
              </div>
              <span className="font-mono text-[11px] text-gray-500 uppercase tracking-wider">
                Hiring Track
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {companies.map((c) => {
                const isSelected = company === c.name;
                return (
                  <div
                    key={c.name}
                    onClick={() => setCompany(c.name)}
                    className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-sm'
                        : 'bg-[#20232C] border-white/5 hover:border-[#353946] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{c.name}</span>
                      <Building2
                        className={`w-3.5 h-3.5 ${
                          isSelected ? 'text-cyan-400' : 'text-gray-500'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-1">{c.caliber}</span>
                    <span className="text-[9px] font-mono text-gray-500 block mt-0.5">{c.tag}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 03: Branch, Semester & Topic */}
          <section className="p-6 rounded-2xl bg-[#242731] border border-[#353946] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  03
                </span>
                <h2 className="text-base font-bold text-white">
                  Branch, Semester & Focus Topic
                </h2>
              </div>
              <span className="font-mono text-[11px] text-gray-500 uppercase tracking-wider">
                Curriculum Core
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branches.map((b) => {
                const isSelected = branch === b.code;
                return (
                  <div
                    key={b.code}
                    onClick={() => {
                      setBranch(b.code);
                      setTopic(TOPIC_SUGGESTIONS[b.code][0]);
                    }}
                    className={`p-3.5 rounded-xl cursor-pointer border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-purple-600/15 border-purple-500 text-white'
                        : 'bg-[#20232C] border-white/5 hover:border-[#353946] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-white/5 text-purple-400 font-bold text-xs flex items-center justify-center font-mono">
                        {b.code}
                      </span>
                      <span className="text-xs font-semibold">{b.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-[10px] font-mono uppercase text-gray-400 block mb-1.5">
                  Current Semester
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full bg-[#20232C] border border-[#353946] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s} className="bg-[#20232C]">
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-mono uppercase text-gray-400 block mb-1.5">
                  Interview Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Operating Systems, DBMS, VLSI CDC, Control Systems"
                  className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {TOPIC_SUGGESTIONS[branch].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTopic(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                    topic === preset
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-[#20232C] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </section>

          {/* Section 04: Difficulty & Volume */}
          <section className="p-6 rounded-2xl bg-[#242731] border border-[#353946] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  04
                </span>
                <h2 className="text-base font-bold text-white">Difficulty & Volume</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {difficulties.map((d) => {
                const isSelected = difficulty === d.level;
                return (
                  <div
                    key={d.level}
                    onClick={() => setDifficulty(d.level)}
                    className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-sm'
                        : 'bg-[#20232C] border-white/5 hover:border-[#353946] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{d.level}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{d.rigor}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { m: 20, q: 3, label: 'Sprint Drill' },
                { m: 30, q: 4, label: 'Standard Loop' },
                { m: 45, q: 5, label: 'Comprehensive' },
                { m: 60, q: 6, label: 'Full Battery' },
              ].map((opt) => {
                const isSelected = questionCount === opt.q;
                return (
                  <div
                    key={opt.m}
                    onClick={() => {
                      setDuration(opt.m);
                      setQuestionCount(opt.q);
                    }}
                    className={`p-3.5 rounded-xl cursor-pointer border text-center transition-all ${
                      isSelected
                        ? 'bg-purple-600/15 border-purple-500 text-white shadow-sm'
                        : 'bg-[#20232C] border-white/5 hover:border-[#353946] text-gray-300'
                    }`}
                  >
                    <span className="text-base font-bold font-mono block text-white">{opt.m} min</span>
                    <span className="text-[11px] text-purple-300 font-mono block">{opt.q} Questions</span>
                    <span className="text-[10px] text-gray-500 mt-1 block">{opt.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 05: Optional Resume Context */}
          <section className="p-6 rounded-2xl bg-[#242731] border border-[#353946] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  05
                </span>
                <h2 className="text-base font-bold text-white">Resume Contextualization</h2>
              </div>
              <NavLink
                to="/resume-analyzer"
                className="text-xs text-purple-400 hover:text-purple-300 font-medium"
              >
                Upload / Manage Resumes →
              </NavLink>
            </div>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#20232C] border border-white/5 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-gray-200">
                  Include parsed resume projects & skills in Gemini question generation
                </span>
              </div>
              <input
                type="checkbox"
                checked={resumeContext}
                onChange={(e) => setResumeContext(e.target.checked)}
                className="rounded bg-[#242731] border-white/20 text-purple-600 focus:ring-0"
              />
            </label>

            {resumeContext && (
              <div>
                {resumes.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#20232C]">
                        {r.fileName} ({new Date(r.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-gray-400">
                    No analyzed resumes found yet.{' '}
                    <NavLink to="/resume-analyzer" className="text-purple-400 underline">
                      Upload a PDF/DOCX resume
                    </NavLink>{' '}
                    or proceed without resume context.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Sticky Session Blueprint */}
        <div className="xl:col-span-4 sticky top-24 space-y-4">
          <div className="rounded-2xl bg-[#242731] border border-[#353946] p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#353946]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-bold">
                Session Blueprint
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                Ready
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Target Track</span>
                <span className="text-white font-semibold">{company}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Session Mode</span>
                <span className="text-purple-300 font-semibold capitalize">
                  {type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Department & Sem</span>
                <span className="text-white font-mono">
                  {branch} · Sem {semester}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Topic</span>
                <span className="text-cyan-300 font-medium truncate max-w-[180px]">{topic}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Difficulty</span>
                <span className="text-cyan-400 font-mono font-medium">{difficulty}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Initial Questions</span>
                <span className="text-gray-200 font-mono">
                  {questionCount} (+ follow-ups)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Resume Context</span>
                <span className={resumeContext && selectedResumeId ? 'text-emerald-400 font-mono' : 'text-gray-500'}>
                  {resumeContext && selectedResumeId ? 'Attached' : 'None'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunch}
              disabled={isLaunching}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
            >
              {isLaunching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Interview with Gemini...</span>
                </>
              ) : (
                <>
                  <span>Launch AI Interview Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
