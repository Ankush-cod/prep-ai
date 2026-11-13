// src/pages/ResumeAnalyzer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  Cpu,
  Sparkles,
  ArrowRight,
  FileCheck,
  Check,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BackendResume, resumeService } from '../services/resumeService';

export const ResumeAnalyzer: React.FC = () => {
  const { showToast, setActiveInterviewConfig } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [resumes, setResumes] = useState<BackendResume[]>([]);
  const [selectedResume, setSelectedResume] = useState<BackendResume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    resumeService
      .listResumes()
      .then((list) => {
        setResumes(list);
        setSelectedResume(list[0] || null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load resumes.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleFileSelect = async (file?: File | null) => {
    if (!file) return;
    setError(null);

    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.pdf') && !ext.endsWith('.docx')) {
      setError('Only PDF and DOCX files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5 MB limit.');
      return;
    }

    setIsUploading(true);
    try {
      const analyzed = await resumeService.uploadAndAnalyze(file);
      setResumes((prev) => [analyzed, ...prev]);
      setSelectedResume(analyzed);
      showToast('Resume parsed and structured by Gemini!');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to analyze uploaded resume.';
      setError(msg);
      showToast(msg, 'warning');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async (id: string) => {
    try {
      await resumeService.deleteResume(id);
      const next = resumes.filter((r) => r.id !== id);
      setResumes(next);
      if (selectedResume?.id === id) {
        setSelectedResume(next[0] || null);
      }
      showToast('Resume removed');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete resume', 'warning');
    }
  };

  const handleStartInterviewWithProbes = () => {
    setActiveInterviewConfig((prev) => ({
      ...prev,
      type: 'technical',
      resumeContext: true,
    }));
    navigate('/mock-interviews');
  };

  const analysis = selectedResume?.analysis || null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#353946] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>AI RESUME INTELLIGENCE & GEMINI PROBE PIPELINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Resume Analyzer & Interview Question Generator
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Upload a text-based PDF or DOCX resume to extract structured education, skills, technologies, projects, experience, certifications, and personalized Gemini interview probes.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />
      </section>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-300">Resume Processing Notice</p>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Upload & Extraction Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
          {selectedResume ? (
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedResume.fileName}</h3>
                  <span className="text-[11px] font-mono text-gray-400">
                    {(selectedResume.fileSize / 1024).toFixed(1)} KB • Uploaded{' '}
                    {new Date(selectedResume.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteResume(selectedResume.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Delete resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!isUploading) handleFileSelect(e.dataTransfer.files?.[0]);
            }}
            className="p-6 rounded-xl bg-[#20232C] border border-dashed border-white/20 hover:border-purple-500/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-2" />
                <span className="text-xs font-semibold text-white">
                  Extracting text and structuring with Gemini...
                </span>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs font-medium text-white">
                  Drag and drop a PDF or DOCX resume here, or click to browse
                </span>
                <span className="text-[10px] text-gray-500 mt-1">
                  Text-selectable PDF or DOCX only (Max 5 MB). Scanned image PDFs without selectable text are rejected clearly.
                </span>
              </>
            )}
          </div>

          {resumes.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {resumes.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedResume(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono border cursor-pointer ${
                    selectedResume?.id === r.id
                      ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                      : 'bg-[#20232C] border-[#353946] text-gray-400 hover:text-white'
                  }`}
                >
                  {r.fileName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Structured Extraction Telemetry */}
        <div className="lg:col-span-4 bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
              Extraction Summary
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-mono text-xs font-semibold">
              {analysis ? 'Gemini Parsed' : 'Awaiting Upload'}
            </span>
          </div>

          {analysis ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#20232C] border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block">SKILLS</span>
                <span className="text-xl font-bold font-mono text-cyan-400">
                  {analysis.skills.length}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#20232C] border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block">TECH STACK</span>
                <span className="text-xl font-bold font-mono text-purple-400">
                  {analysis.technologies.length}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#20232C] border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block">PROJECTS</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {analysis.projects.length}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#20232C] border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block">PROBES</span>
                <span className="text-xl font-bold font-mono text-white">
                  {analysis.generatedQuestions.length}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 leading-relaxed">
              Upload a resume to inspect extracted academic, skill, project, and experience sections.
            </p>
          )}
        </div>
      </section>

      {isLoading ? (
        <div className="py-12 flex items-center justify-center gap-2 text-xs font-mono text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <span>Loading saved resume analyses...</span>
        </div>
      ) : analysis ? (
        <>
          <section className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-[#353946] pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-bold text-white">Structured Candidate Dossier</h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Extracted via {analysis.aiProvider}
              </span>
            </div>

            {analysis.summary && (
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-[#20232C] p-4 rounded-xl border border-white/5">
                {analysis.summary}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono">
                  1. Education
                </span>
                <div className="space-y-2">
                  {analysis.education.length > 0 ? (
                    analysis.education.map((edu, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-[#20232C] border border-white/5 space-y-1 text-xs"
                      >
                        <div className="font-bold text-white">{edu.degree || 'Degree'}</div>
                        <div className="text-gray-400">{edu.institution}</div>
                        <div className="text-[11px] font-mono text-gray-500">
                          {edu.year} {edu.details ? `· ${edu.details}` : ''}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-[#20232C] border border-white/5 text-xs text-gray-500">
                      No education entries extracted.
                    </div>
                  )}
                </div>
              </div>

              {/* Skills & Technologies */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
                  2. Skills & Technologies
                </span>
                <div className="p-4 rounded-xl bg-[#20232C] border border-white/5 flex flex-wrap gap-1.5 min-h-[90px]">
                  {[...analysis.skills, ...analysis.technologies].map((skill, idx) => (
                    <span
                      key={`${skill}-${idx}`}
                      className="px-2 py-0.5 rounded bg-white/5 text-gray-200 border border-white/5 font-mono text-xs flex items-center gap-1"
                    >
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono">
                  3. Projects
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysis.projects.map((proj, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#20232C] border border-white/5 space-y-2 text-xs"
                    >
                      <h4 className="font-bold text-white">{proj.name}</h4>
                      <p className="text-gray-400 leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience & Certifications */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                  4. Experience
                </span>
                {analysis.experience.length > 0 ? (
                  analysis.experience.map((exp, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#20232C] border border-white/5 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-white">{exp.role}</span>
                        <span className="text-[11px] font-mono text-gray-400">{exp.period}</span>
                      </div>
                      <div className="text-purple-400 font-medium">{exp.organization}</div>
                      <p className="text-gray-400 pt-1 leading-relaxed">{exp.highlights}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-[#20232C] border border-white/5 text-xs text-gray-500">
                    No experience entries found.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono">
                  5. Certifications
                </span>
                <div className="p-4 rounded-xl bg-[#20232C] border border-white/5 text-xs space-y-1.5">
                  {analysis.certifications.length > 0 ? (
                    analysis.certifications.map((cert, i) => (
                      <div key={i} className="text-gray-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500">No certifications extracted.</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Personalized Technical Interview Questions */}
          <section className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#353946] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h2 className="text-base font-bold text-white">
                    Personalized Technical & Follow-Up Questions
                  </h2>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Generated by Gemini from your uploaded resume projects and technical stack.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartInterviewWithProbes}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Use in AI Mock Interview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysis.generatedQuestions.map((probe, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#20232C] border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-purple-300 font-semibold text-[10px] uppercase">
                      {probe.domain}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-[10px]">
                      {probe.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-gray-200 font-medium leading-relaxed">
                    {probe.prompt}
                  </p>
                </div>
              ))}
            </div>

            {analysis.followUpQuestions.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold block">
                  Follow-Up Probes
                </span>
                <div className="space-y-2">
                  {analysis.followUpQuestions.map((fu, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#20232C] border border-white/5 text-xs text-gray-300"
                    >
                      <span className="font-mono text-cyan-300 mr-2">[{fu.parentTopic}]</span>
                      {fu.prompt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
};
