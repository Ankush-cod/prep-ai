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
      {/* 1. HEADER SECTION */}
      <section className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#5145E5] mb-1 font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#5145E5] animate-pulse" />
              <span>AI RESUME INTELLIGENCE &amp; GEMINI QUESTION GENERATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17182B]">
              Resume Analyzer &amp; Socratic Question Generator
            </h1>
            <p className="text-sm text-[#77788B] mt-1 max-w-3xl leading-relaxed">
              Upload your academic CV (PDF or DOCX) to extract structured education, technical skills, project stacks, and generate personalized Gemini interview cross-examination probes.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 text-xs text-rose-800 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">Resume Processing Notice</p>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Upload & Extraction Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          {selectedResume ? (
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#5145E5] flex items-center justify-center border border-[#E0E7FF]">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17182B]">{selectedResume.fileName}</h3>
                  <span className="text-[11px] font-mono text-[#77788B]">
                    {(selectedResume.fileSize / 1024).toFixed(1)} KB • Uploaded{' '}
                    {new Date(selectedResume.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteResume(selectedResume.id)}
                className="p-2 rounded-lg text-[#77788B] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
            className="p-8 rounded-xl bg-[#F7F7FC] border border-dashed border-[#CBD0E0] hover:border-[#5145E5] transition-all flex flex-col items-center justify-center text-center cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-[#5145E5] animate-spin mb-2" />
                <span className="text-xs font-semibold text-[#17182B]">
                  Extracting text and structuring with Gemini...
                </span>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-[#5145E5] mb-2" />
                <span className="text-xs font-bold text-[#17182B]">
                  Drag and drop a PDF or DOCX resume here, or click to browse
                </span>
                <span className="text-[11px] text-[#77788B] mt-1">
                  Text-selectable PDF or DOCX only (Max 5 MB).
                </span>
              </>
            )}
          </div>

          {resumes.length > 1 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {resumes.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedResume(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono border cursor-pointer ${
                    selectedResume?.id === r.id
                      ? 'bg-[#EEF2FF] border-[#5145E5] text-[#5145E5] font-bold'
                      : 'bg-[#F7F7FC] border-[#E2E4EB] text-[#77788B] hover:text-[#17182B]'
                  }`}
                >
                  {r.fileName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Structured Extraction Telemetry */}
        <div className="lg:col-span-4 bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#77788B] font-mono">
              Extraction Metrics
            </span>
            <span className="px-2 py-0.5 rounded bg-[#EEF2FF] text-[#5145E5] font-mono text-xs font-bold border border-[#E0E7FF]">
              {analysis ? 'Parsed' : 'Idle'}
            </span>
          </div>

          {analysis ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB]">
                <span className="text-[10px] font-mono text-[#77788B] block font-semibold">SKILLS</span>
                <span className="text-xl font-bold font-mono text-[#5145E5]">
                  {analysis.skills.length}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB]">
                <span className="text-[10px] font-mono text-[#77788B] block font-semibold">TECH STACK</span>
                <span className="text-xl font-bold font-mono text-cyan-600">
                  {analysis.technologies.length}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB]">
                <span className="text-[10px] font-mono text-[#77788B] block font-semibold">PROJECTS</span>
                <span className="text-xl font-bold font-mono text-emerald-600">
                  {analysis.projects.length}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB]">
                <span className="text-[10px] font-mono text-[#77788B] block font-semibold">PROBES</span>
                <span className="text-xl font-bold font-mono text-[#17182B]">
                  {analysis.generatedQuestions.length}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#77788B] leading-relaxed">
              Upload a resume to inspect extracted academic, skill, project, and experience sections.
            </p>
          )}
        </div>
      </section>

      {isLoading ? (
        <div className="py-12 flex items-center justify-center gap-2 text-xs font-mono text-[#77788B]">
          <Loader2 className="w-5 h-5 animate-spin text-[#5145E5]" />
          <span>Loading saved resume analyses...</span>
        </div>
      ) : analysis ? (
        <>
          <section className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#5145E5]" />
                <h2 className="text-base font-bold text-[#17182B]">Structured Candidate Dossier</h2>
              </div>
              <span className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Extracted via {analysis.aiProvider}
              </span>
            </div>

            {analysis.summary && (
              <p className="text-xs sm:text-sm text-[#17182B] leading-relaxed bg-[#F7F7FC] p-4 rounded-xl border border-[#E2E4EB]">
                {analysis.summary}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5145E5] font-mono">
                  1. Education
                </span>
                <div className="space-y-2">
                  {analysis.education.length > 0 ? (
                    analysis.education.map((edu, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-1 text-xs"
                      >
                        <div className="font-bold text-[#17182B]">{edu.degree || 'Degree'}</div>
                        <div className="text-[#77788B]">{edu.institution}</div>
                        <div className="text-[11px] font-mono text-[#77788B]">
                          {edu.year} {edu.details ? `· ${edu.details}` : ''}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] text-xs text-[#77788B]">
                      No education entries extracted.
                    </div>
                  )}
                </div>
              </div>

              {/* Skills & Technologies */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 font-mono">
                  2. Skills &amp; Technologies
                </span>
                <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] flex flex-wrap gap-1.5 min-h-[90px]">
                  {[...analysis.skills, ...analysis.technologies].map((skill, idx) => (
                    <span
                      key={`${skill}-${idx}`}
                      className="px-2.5 py-1 rounded-lg bg-white text-[#17182B] border border-[#E2E4EB] font-mono text-xs flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                  3. Projects
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysis.projects.map((proj, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-2 text-xs"
                    >
                      <h4 className="font-bold text-[#17182B]">{proj.name}</h4>
                      <p className="text-[#77788B] leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#5145E5] text-[10px] font-mono font-semibold"
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
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
                  4. Experience
                </span>
                {analysis.experience.length > 0 ? (
                  analysis.experience.map((exp, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] text-xs space-y-1"
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-[#17182B]">{exp.role}</span>
                        <span className="text-[11px] font-mono text-[#77788B]">{exp.period}</span>
                      </div>
                      <div className="text-[#5145E5] font-medium">{exp.organization}</div>
                      <p className="text-[#77788B] pt-1 leading-relaxed">{exp.highlights}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] text-xs text-[#77788B]">
                    No experience entries found.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5145E5] font-mono">
                  5. Certifications
                </span>
                <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] text-xs space-y-1.5">
                  {analysis.certifications.length > 0 ? (
                    analysis.certifications.map((cert, i) => (
                      <div key={i} className="text-[#17182B] flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[#77788B]">No certifications extracted.</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Personalized Technical Interview Questions */}
          <section className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E4EB] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#5145E5]" />
                  <h2 className="text-base font-bold text-[#17182B]">
                    Personalized Technical Interview Probes
                  </h2>
                </div>
                <p className="text-xs text-[#77788B] mt-0.5">
                  Generated by Gemini from your uploaded resume projects and technical stack.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartInterviewWithProbes}
                className="px-4 py-2.5 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Use in AI Mock Interview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysis.generatedQuestions.map((probe, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#5145E5] font-semibold text-[10px] uppercase">
                      {probe.domain}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#EEF2FF] text-[#5145E5] font-mono text-[10px] font-bold">
                      {probe.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-[#17182B] font-medium leading-relaxed">
                    {probe.prompt}
                  </p>
                </div>
              ))}
            </div>

            {analysis.followUpQuestions.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#5145E5] font-bold block">
                  Follow-Up Probes
                </span>
                <div className="space-y-2">
                  {analysis.followUpQuestions.map((fu, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] text-xs text-[#17182B]"
                    >
                      <span className="font-mono text-[#5145E5] mr-2 font-bold">[{fu.parentTopic}]</span>
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
