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
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Branch } from '../types/prepai';
import { CreateInterviewSessionInput, interviewService } from '../services/interviewService';
import { BackendResume, resumeService } from '../services/resumeService';
import { apiRequest, ApiError } from '../services/api';

const TOPIC_SUGGESTIONS: Record<Branch, string[]> = {
  CSE: ['Data Structures & Algorithms', 'Operating Systems & Concurrency', 'DBMS & Indexing', 'Distributed System Design'],
  ECE: ['Digital VLSI & CDC', 'Signals & Systems', 'Embedded C & RTOS', 'Communication Protocols'],
  EE: ['Power Electronics & Converters', 'Control Systems & Stability', 'Electrical Machines', 'Embedded Firmware'],
  ME: ['Thermodynamics & Heat Transfer', 'Strength of Materials & FEA', 'Fluid Mechanics', 'Machine Design & Kinematics'],
};

export const AIMockInterviewSetup: React.FC = () => {
  const { profile, activeInterviewConfig, setActiveInterviewConfig, showToast } = useApp();
  const navigate = useNavigate();

  // Mode Selection: RESUME_BASED | TOPIC_BASED | COMPREHENSIVE
  const [interviewMode, setInterviewMode] = useState<'RESUME_BASED' | 'TOPIC_BASED' | 'COMPREHENSIVE'>('TOPIC_BASED');

  const [type, setType] = useState<'technical' | 'system_design' | 'behavioral' | 'hr'>(
    activeInterviewConfig.type || 'technical'
  );
  const [company, setCompany] = useState(activeInterviewConfig.company || 'Google');
  const [branch, setBranch] = useState<Branch>(profile.branch || activeInterviewConfig.branch || 'CSE');
  const [semester, setSemester] = useState<number>(profile.semester || 5);
  const [topic, setTopic] = useState<string>(TOPIC_SUGGESTIONS[profile.branch || 'CSE']?.[0] || 'Data Structures & Algorithms');
  const [difficulty, setDifficulty] = useState(activeInterviewConfig.difficulty || 'Medium');
  const [duration, setDuration] = useState(activeInterviewConfig.duration || 30);
  const [questionCount, setQuestionCount] = useState(activeInterviewConfig.questionCount || 4);
  const [resumeContext, setResumeContext] = useState(activeInterviewConfig.resumeContext);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [resumes, setResumes] = useState<BackendResume[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [aiServiceStatus, setAiServiceStatus] = useState<'checking' | 'online' | 'degraded'>('checking');

  // Comprehensive Mode Category Distribution
  const [categoryDistribution, setCategoryDistribution] = useState({
    dsa: 2,
    projects: 1,
    coreCs: 2,
    programming: 1,
    technologies: 1,
  });

  useEffect(() => {
    if (profile.branch) {
      setBranch(profile.branch);
      if (!topic || topic === TOPIC_SUGGESTIONS.CSE[0]) {
        setTopic(TOPIC_SUGGESTIONS[profile.branch]?.[0] || 'Core Fundamentals');
      }
    }
    if (profile.semester) {
      setSemester(profile.semester);
    }
  }, [profile.branch, profile.semester]);

  // Check actual AI service health
  useEffect(() => {
    apiRequest<{ status: string; services?: { gemini?: boolean } }>('/health')
      .then((res) => {
        if (res.services?.gemini) {
          setAiServiceStatus('online');
        } else {
          setAiServiceStatus('degraded');
        }
      })
      .catch(() => {
        setAiServiceStatus('degraded');
      });
  }, []);

  useEffect(() => {
    resumeService
      .listResumes()
      .then((items) => {
        setResumes(items);
        if (items.length > 0 && !selectedResumeId) {
          setSelectedResumeId(items[0].id);
        }
      })
      .catch(() => {
        // Non-blocking
      });
  }, [selectedResumeId]);

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
    { name: 'Amazon', caliber: 'SDE-1 / SDE-2', tag: 'Leadership Principles & Scale' },
    { name: 'Microsoft', caliber: 'SDE', tag: 'Design Patterns & Cloud' },
    { name: 'Flipkart', caliber: 'SDE-1', tag: 'Concurrency & Low-Latency' },
    { name: 'Uber', caliber: 'Software Eng', tag: 'Microservices & Geo-Spatial' },
    { name: 'General Engineering', caliber: 'Campus Placement', tag: 'B.Tech Core Syllabus' },
  ];

  const branches: { code: Branch; name: string }[] = [
    { code: 'CSE', name: 'Computer Science (CSE)' },
    { code: 'ECE', name: 'Electronics & Comm (ECE)' },
    { code: 'EE', name: 'Electrical Eng (EE)' },
    { code: 'ME', name: 'Mechanical Eng (ME)' },
  ];

  const difficulties = [
    { level: 'Easy', rigor: 'Undergrad fundamentals, core definitions, basic runtime complexity.' },
    { level: 'Medium', rigor: 'Standard campus placement bar, deep edge cases, optimal data structures.' },
    { level: 'Hard', rigor: 'Top-tier tech bar, ambiguous constraints, distributed failure modes.' },
  ];

  const handleLaunch = async () => {
    setError(null);
    setFieldErrors({});

    // 1. Client-Side Pre-Validation
    const validationErrors: Record<string, string> = {};
    if (!['CSE', 'ECE', 'EE', 'ME'].includes(branch)) {
      validationErrors.branch = 'Please select a valid engineering discipline (CSE, ECE, EE, or ME).';
    }
    if (!semester || semester < 1 || semester > 8) {
      validationErrors.semester = 'Please select a valid semester (1-8).';
    }
    const initialTopic = topic.trim() || TOPIC_SUGGESTIONS[branch]?.[0] || 'Core Fundamentals & Problem Solving';
    if (!initialTopic) {
      validationErrors.topic = 'Please select or enter an interview topic.';
    }
    if (!type) {
      validationErrors.type = 'Please select an interview evaluation type.';
    }
    if (resumeContext && !selectedResumeId && resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      setError(firstError);
      showToast(firstError, 'warning');
      return;
    }

    setIsLaunching(true);

    const interviewTypeMap: Record<string, 'TECHNICAL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'HR'> = {
      technical: 'TECHNICAL',
      system_design: 'SYSTEM_DESIGN',
      behavioral: 'BEHAVIORAL',
      hr: 'HR',
    };

    const resolvedTopic =
      interviewMode === 'RESUME_BASED'
        ? (topic.trim() || 'Resume Projects, Skills & Core Fundamentals')
        : interviewMode === 'COMPREHENSIVE'
        ? (topic.trim() || 'Comprehensive Placement Technical Evaluation')
        : (topic.trim() || TOPIC_SUGGESTIONS[branch]?.[0] || 'Core Fundamentals & Problem Solving');

    const totalQuestions =
      interviewMode === 'COMPREHENSIVE'
        ? Math.min(15, Math.max(2, Object.values(categoryDistribution).reduce((a, b) => a + b, 0)))
        : questionCount;

    const payload: CreateInterviewSessionInput = {
      branch,
      semester,
      interviewType: interviewTypeMap[type] || 'TECHNICAL',
      difficulty,
      topic: resolvedTopic,
      companyName: company === 'General Engineering' ? null : company,
      questionCount: totalQuestions,
      durationMinutes: duration,
      resumeId: (interviewMode === 'RESUME_BASED' || resumeContext) && selectedResumeId ? selectedResumeId : null,
      interviewMode: type,
      mode: interviewMode,
      categoryDistribution: interviewMode === 'COMPREHENSIVE' ? categoryDistribution : undefined,
    };

    try {
      const session = await interviewService.createSession(payload);

      if (!session || !session.id) {
        throw new Error('Interview session could not be created. Please try again.');
      }

      setActiveInterviewConfig({
        type,
        company,
        difficulty,
        duration,
        questionCount: totalQuestions,
        topic: resolvedTopic,
        branch,
        resumeContext: interviewMode === 'RESUME_BASED' || resumeContext,
      });

      showToast('Interview session generated successfully with Gemini AI', 'success');
      navigate(`/mock-interviews/live/${session.id}`);
    } catch (err) {
      let friendlyMessage = 'Failed to initialize interview session. Please try again.';

      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
          const first = Object.values(err.fieldErrors)[0];
          friendlyMessage = first || 'Please review highlighted configuration fields above.';
        } else if (err.status === 503) {
          friendlyMessage = 'AI examiner service is temporarily unavailable. Please try again in a few moments.';
        } else if (err.status === 400 && err.message) {
          friendlyMessage = err.message === 'Required'
            ? 'Please ensure all required configuration fields are filled.'
            : err.message;
        } else if (err.message && err.message !== 'Required') {
          friendlyMessage = err.message;
        }
      } else if (err instanceof Error && err.message) {
        friendlyMessage = err.message === 'Required'
          ? 'Please complete all required interview configuration fields.'
          : err.message;
      }

      setError(friendlyMessage);
      showToast(friendlyMessage, 'warning');
      setIsLaunching(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. HEADER SECTION */}
      <section className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-[#77788B] uppercase tracking-wider">
              <span className="text-[#5145E5] font-semibold">Gemini Flash Socratic Engine</span>
              <span>•</span>
              <span>Interactive Technical Examiner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17182B]">
              Configure Technical Mock Interview
            </h1>
            <p className="text-sm text-[#77788B] max-w-3xl leading-relaxed">
              Targeted verbal cross-examination, company hiring rubrics, and automated follow-up questioning tailored for B.Tech engineers.
            </p>
          </div>

          {/* AI Connection Status */}
          <div className="flex items-center gap-2">
            {aiServiceStatus === 'online' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI EXAMINER ONLINE</span>
              </div>
            ) : aiServiceStatus === 'degraded' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-mono font-semibold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>AI SERVICE DEGRADED</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-[#77788B] text-xs font-mono font-semibold border border-slate-200">
                <Loader2 className="w-3 h-3 animate-spin text-[#77788B]" />
                <span>CHECKING AI STATUS...</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4.5 flex items-start justify-between gap-3 text-xs text-rose-800 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-950 text-sm">Session Initialization Failed</p>
              <p className="mt-0.5 text-rose-800 font-medium">{error}</p>
              {Object.keys(fieldErrors).length > 1 && (
                <ul className="mt-2 list-disc list-inside space-y-0.5 text-rose-700">
                  {Object.entries(fieldErrors).map(([key, val]) => (
                    <li key={key}>
                      <span className="font-semibold capitalize">{key}:</span> {val}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setFieldErrors({});
            }}
            className="text-rose-500 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-100 transition-colors"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-6">
          {/* Section 00: Mode Selection */}
          <section className="p-6 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-[#5145E5] font-bold bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#E0E7FF]">
                  MODE
                </span>
                <h2 className="text-base font-bold text-[#17182B]">Select Mock Interview Mode</h2>
              </div>
              <span className="text-[11px] text-[#77788B] uppercase tracking-wider font-semibold">
                3 Pathways
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {[
                {
                  id: 'RESUME_BASED' as const,
                  title: 'Resume-Based',
                  badge: 'Profile Tailored',
                  desc: 'Questions customized to your actual projects, tech stack, libraries, and core concepts.',
                  icon: FileText,
                },
                {
                  id: 'TOPIC_BASED' as const,
                  title: 'Topic-Focused',
                  badge: 'Syllabus Core',
                  desc: 'Concentrated cross-examination on chosen branch subjects, edge cases, and algorithmic rigor.',
                  icon: Terminal,
                },
                {
                  id: 'COMPREHENSIVE' as const,
                  title: 'Comprehensive',
                  badge: 'Full Placement',
                  desc: 'Multi-category battery covering DSA, System Design, Core CS, OOP, and Modern Web.',
                  icon: Layers,
                },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = interviewMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setInterviewMode(m.id);
                      if (m.id === 'RESUME_BASED') {
                        setResumeContext(true);
                        if (resumes.length > 0 && !selectedResumeId) {
                          setSelectedResumeId(resumes[0].id);
                        }
                      }
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#EEF2FF] border-[#5145E5] shadow-xs ring-1 ring-[#5145E5]'
                        : 'bg-[#F7F7FC] border-[#E2E4EB] hover:bg-[#EEF2FF]/30 hover:border-[#5145E5]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#5145E5] text-white' : 'bg-white text-[#77788B] border border-[#E2E4EB]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-[#5145E5] text-white' : 'bg-white text-[#77788B] border border-[#E2E4EB]'
                        }`}
                      >
                        {m.badge}
                      </span>
                    </div>
                    <h3 className={`text-xs font-bold mb-1 ${isSelected ? 'text-[#5145E5]' : 'text-[#17182B]'}`}>
                      {m.title}
                    </h3>
                    <p className="text-[11px] text-[#77788B] leading-relaxed">{m.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* If Comprehensive mode selected, show category distribution sliders */}
            {interviewMode === 'COMPREHENSIVE' && (
              <div className="pt-3 border-t border-[#E2E4EB] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#17182B]">
                    Category Question Distribution (Max 15 total)
                  </h4>
                  <span className="text-xs font-mono font-bold text-[#5145E5]">
                    Total:{' '}
                    {Object.values(categoryDistribution).reduce((a, b) => a + b, 0)} Questions
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { key: 'dsa', label: 'Data Structures & Alg' },
                    { key: 'projects', label: 'System Design / Projects' },
                    { key: 'coreCs', label: 'Core CS (OS/DBMS/CN)' },
                    { key: 'programming', label: 'Programming & OOP' },
                    { key: 'technologies', label: 'Web & Technologies' },
                  ].map((cat) => (
                    <div key={cat.key} className="p-2.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB]">
                      <div className="flex justify-between mb-1.5 font-medium text-[#17182B]">
                        <span>{cat.label}</span>
                        <span className="font-mono text-[#5145E5] font-bold">
                          {categoryDistribution[cat.key as keyof typeof categoryDistribution]} Qs
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={categoryDistribution[cat.key as keyof typeof categoryDistribution]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCategoryDistribution((prev) => ({
                            ...prev,
                            [cat.key]: val,
                          }));
                        }}
                        className="w-full accent-[#5145E5] cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Section 01: Interview Type */}
          <section className={`p-6 rounded-2xl bg-white border ${fieldErrors.type ? 'border-rose-400' : 'border-[#E2E4EB]'} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-[#5145E5] font-bold bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#E0E7FF]">
                  01
                </span>
                <h2 className="text-base font-bold text-[#17182B]">Interview Type</h2>
              </div>
              <span className="text-[11px] text-[#77788B] uppercase tracking-wider font-semibold">
                Evaluation Domain
              </span>
            </div>

            {fieldErrors.type && (
              <p className="text-xs text-rose-600 font-medium">{fieldErrors.type}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setType(item.id);
                      if (fieldErrors.type) setFieldErrors((prev) => ({ ...prev, type: '' }));
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#EEF2FF] border-[#5145E5] shadow-xs ring-1 ring-[#5145E5]'
                        : 'bg-[#F7F7FC] border-[#E2E4EB] hover:bg-[#EEF2FF]/30 hover:border-[#5145E5]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#5145E5] text-white' : 'bg-white text-[#77788B] border border-[#E2E4EB]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded bg-[#5145E5] text-white font-mono text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xs font-bold mb-1 ${isSelected ? 'text-[#5145E5]' : 'text-[#17182B]'}`}>
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#77788B] leading-relaxed mb-3">{item.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded bg-white text-[9px] font-mono text-[#77788B] border border-[#E2E4EB]"
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
          <section className="p-6 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-[#5145E5] font-bold bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#E0E7FF]">
                  02
                </span>
                <h2 className="text-base font-bold text-[#17182B]">Target Company Calibration</h2>
              </div>
              <span className="text-[11px] text-[#77788B] uppercase tracking-wider font-semibold">
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
                        ? 'bg-[#EEF2FF] border-[#5145E5] text-[#17182B] shadow-xs ring-1 ring-[#5145E5]'
                        : 'bg-[#F7F7FC] border-[#E2E4EB] hover:border-[#5145E5]/40 text-[#17182B]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17182B]">{c.name}</span>
                      <Building2
                        className={`w-3.5 h-3.5 ${
                          isSelected ? 'text-[#5145E5]' : 'text-[#77788B]'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-[#77788B] block mt-1">{c.caliber}</span>
                    <span className="text-[9px] font-mono text-[#5145E5] block mt-0.5">{c.tag}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 03: Branch, Semester & Topic */}
          <section className="p-6 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-[#5145E5] font-bold bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#E0E7FF]">
                  03
                </span>
                <h2 className="text-base font-bold text-[#17182B]">
                  Branch, Semester & Focus Topic
                </h2>
              </div>
              <span className="text-[11px] text-[#77788B] uppercase tracking-wider font-semibold">
                Curriculum Core
              </span>
            </div>

            {fieldErrors.branch && (
              <p className="text-xs text-rose-600 font-medium">{fieldErrors.branch}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branches.map((b) => {
                const isSelected = branch === b.code;
                return (
                  <div
                    key={b.code}
                    onClick={() => {
                      setBranch(b.code);
                      setTopic(TOPIC_SUGGESTIONS[b.code][0]);
                      if (fieldErrors.branch) setFieldErrors((prev) => ({ ...prev, branch: '' }));
                    }}
                    className={`p-3.5 rounded-xl cursor-pointer border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#EEF2FF] border-[#5145E5] text-[#17182B] ring-1 ring-[#5145E5]'
                        : 'bg-[#F7F7FC] border-[#E2E4EB] hover:border-[#5145E5]/40 text-[#17182B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-white text-[#5145E5] font-bold text-xs flex items-center justify-center font-mono border border-[#E2E4EB]">
                        {b.code}
                      </span>
                      <span className="text-xs font-semibold">{b.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#5145E5]" />}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block mb-1">
                  Current Semester
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-[#77788B] absolute left-3 top-2.5" />
                  <select
                    value={semester}
                    onChange={(e) => {
                      setSemester(Number(e.target.value));
                      if (fieldErrors.semester) setFieldErrors((prev) => ({ ...prev, semester: '' }));
                    }}
                    className={`w-full bg-[#F7F7FC] border ${fieldErrors.semester ? 'border-rose-400' : 'border-[#E2E4EB]'} rounded-xl pl-9 pr-3 py-2 text-xs text-[#17182B] focus:outline-none focus:border-[#5145E5]`}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
                {fieldErrors.semester && (
                  <p className="text-[10px] text-rose-600 font-medium mt-1">{fieldErrors.semester}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block mb-1">
                  Interview Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (fieldErrors.topic) setFieldErrors((prev) => ({ ...prev, topic: '' }));
                  }}
                  placeholder="e.g., Operating Systems, DBMS, VLSI CDC, Control Systems"
                  className={`w-full bg-[#F7F7FC] border ${fieldErrors.topic ? 'border-rose-400' : 'border-[#E2E4EB]'} rounded-xl px-3.5 py-2 text-xs text-[#17182B] focus:outline-none focus:border-[#5145E5]`}
                />
                {fieldErrors.topic && (
                  <p className="text-[10px] text-rose-600 font-medium mt-1">{fieldErrors.topic}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {TOPIC_SUGGESTIONS[branch]?.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setTopic(preset);
                    if (fieldErrors.topic) setFieldErrors((prev) => ({ ...prev, topic: '' }));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                    topic === preset
                      ? 'bg-[#EEF2FF] border-[#5145E5] text-[#5145E5] font-bold'
                      : 'bg-[#F7F7FC] border-[#E2E4EB] text-[#77788B] hover:text-[#17182B]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </section>

          {/* Section 04: Difficulty & Volume */}
          <section className="p-6 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-[#5145E5] font-bold bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#E0E7FF]">
                  04
                </span>
                <h2 className="text-base font-bold text-[#17182B]">Difficulty & Volume</h2>
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
                        ? 'bg-[#EEF2FF] border-[#5145E5] text-[#17182B] shadow-xs ring-1 ring-[#5145E5]'
                        : 'bg-[#F7F7FC] border-[#E2E4EB] hover:border-[#5145E5]/40 text-[#17182B]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17182B]">{d.level}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#5145E5]" />}
                    </div>
                    <p className="text-[11px] text-[#77788B] mt-1">{d.rigor}</p>
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
                        ? 'bg-[#EEF2FF] border-[#5145E5] text-[#17182B] shadow-xs ring-1 ring-[#5145E5]'
                        : 'bg-[#F7F7FC] border-[#E2E4EB] hover:border-[#5145E5]/40 text-[#17182B]'
                    }`}
                  >
                    <span className="text-base font-bold font-mono block text-[#17182B]">{opt.m} min</span>
                    <span className="text-[11px] text-[#5145E5] font-mono font-bold block">{opt.q} Questions</span>
                    <span className="text-[10px] text-[#77788B] mt-1 block">{opt.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 05: Optional Resume Context */}
          <section className="p-6 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-[#5145E5] font-bold bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#E0E7FF]">
                  05
                </span>
                <h2 className="text-base font-bold text-[#17182B]">Resume Contextualization</h2>
              </div>
              <NavLink
                to="/resume-analyzer"
                className="text-xs text-[#5145E5] hover:underline font-semibold"
              >
                Upload / Manage Resumes →
              </NavLink>
            </div>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] cursor-pointer">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#5145E5]" />
                <span className="text-xs text-[#17182B] font-medium">
                  Include parsed resume projects & skills in Gemini question generation
                </span>
              </div>
              <input
                type="checkbox"
                checked={resumeContext}
                onChange={(e) => setResumeContext(e.target.checked)}
                className="rounded border-[#E2E4EB] text-[#5145E5] focus:ring-[#5145E5]"
              />
            </label>

            {resumeContext && (
              <div className="pt-2">
                {resumes.length > 0 ? (
                  <div>
                    <label className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block mb-1">
                      Select Analyzed Candidate Resume
                    </label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3.5 py-2.5 text-xs text-[#17182B] focus:outline-none focus:border-[#5145E5]"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.fileName} ({new Date(r.createdAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    No analyzed resumes found.{' '}
                    <NavLink to="/resume-analyzer" className="text-[#5145E5] underline font-semibold">
                      Upload a resume
                    </NavLink>{' '}
                    to enable personalized project probes, or proceed with standard syllabus questions.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Sticky Session Blueprint */}
        <div className="xl:col-span-4 sticky top-24 space-y-4">
          <div className="rounded-2xl bg-white border border-[#E2E4EB] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E4EB]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#5145E5] font-bold">
                Session Blueprint
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                Ready to Configure
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F0F1F5]">
                <span className="text-[#77788B]">Target Track</span>
                <span className="text-[#17182B] font-semibold">{company}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F1F5]">
                <span className="text-[#77788B]">Interview Mode</span>
                <span className="text-[#5145E5] font-semibold font-mono">
                  {interviewMode === 'RESUME_BASED'
                    ? 'Resume-Based'
                    : interviewMode === 'COMPREHENSIVE'
                    ? 'Comprehensive'
                    : 'Topic-Focused'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F1F5]">
                <span className="text-[#77788B]">Evaluation Type</span>
                <span className="text-[#17182B] font-semibold capitalize">
                  {type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F1F5]">
                <span className="text-[#77788B]">Department & Sem</span>
                <span className="text-[#17182B] font-mono font-medium">
                  {branch} · Sem {semester}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F1F5]">
                <span className="text-[#77788B]">Topic</span>
                <span className="text-[#17182B] font-medium truncate max-w-[180px]">
                  {interviewMode === 'RESUME_BASED'
                    ? 'Candidate Resume Profile'
                    : interviewMode === 'COMPREHENSIVE'
                    ? 'Multi-Discipline Placement'
                    : topic || 'Core Fundamentals'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F1F5]">
                <span className="text-[#77788B]">Difficulty</span>
                <span className="text-[#5145E5] font-mono font-semibold">{difficulty}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F0F1F5]">
                <span className="text-[#77788B]">Initial Questions</span>
                <span className="text-[#17182B] font-mono font-medium">
                  {interviewMode === 'COMPREHENSIVE'
                    ? Object.values(categoryDistribution).reduce((a, b) => a + b, 0)
                    : questionCount}{' '}
                  (+ follow-ups)
                </span>
              </div>
              {interviewMode === 'COMPREHENSIVE' && (
                <div className="py-1 border-b border-[#F0F1F5] space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#5145E5] block">
                    Distribution
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-[#77788B] font-mono">
                    <span>DSA: {categoryDistribution.dsa}</span>
                    <span>Systems: {categoryDistribution.projects}</span>
                    <span>Core CS: {categoryDistribution.coreCs}</span>
                    <span>OOP: {categoryDistribution.programming}</span>
                    <span>Web/Tech: {categoryDistribution.technologies}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-[#77788B]">Resume Context</span>
                <span
                  className={
                    (interviewMode === 'RESUME_BASED' || resumeContext) && selectedResumeId
                      ? 'text-emerald-700 font-mono font-semibold'
                      : 'text-[#77788B]'
                  }
                >
                  {(interviewMode === 'RESUME_BASED' || resumeContext) && selectedResumeId
                    ? 'Attached'
                    : 'None'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunch}
              disabled={isLaunching}
              className="w-full py-3 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] disabled:opacity-60 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isLaunching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initializing Session with AI Examiner...</span>
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
