// src/services/ai/aiProvider.ts
import { z } from 'zod';

export const generatedQuestionSchema = z.object({
  prompt: z.string().min(10),
  topic: z.string().min(2),
  expectedConcepts: z.array(z.string()).default([]),
  hint: z.string().optional().default(''),
});

export const generatedQuestionListSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(1),
});

export const answerEvaluationSchema = z.object({
  technicalScore: z.number().min(0).max(100),
  conceptualScore: z.number().min(0).max(100),
  clarityScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  completenessScore: z.number().min(0).max(100),
  problemSolvingScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missingConcepts: z.array(z.string()).default([]),
  examinerFeedback: z.string().min(10),
  followUpQuestion: z
    .object({
      prompt: z.string().min(10),
      topic: z.string().min(2),
      expectedConcepts: z.array(z.string()).default([]),
      hint: z.string().optional().default(''),
    })
    .nullable()
    .optional(),
});

export const resumeStructuredSchema = z.object({
  education: z
    .array(
      z.object({
        degree: z.string().default(''),
        institution: z.string().default(''),
        year: z.string().default(''),
        details: z.string().optional().default(''),
      })
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().default(''),
        technologies: z.array(z.string()).default([]),
      })
    )
    .default([]),
  experience: z
    .array(
      z.object({
        role: z.string(),
        organization: z.string().default(''),
        period: z.string().default(''),
        highlights: z.string().default(''),
      })
    )
    .default([]),
  certifications: z.array(z.string()).default([]),
  summary: z.string().default(''),
  personalizedQuestions: z
    .array(
      z.object({
        domain: z.string(),
        prompt: z.string(),
        difficulty: z.string().default('Medium'),
      })
    )
    .default([]),
  followUpQuestions: z
    .array(
      z.object({
        parentTopic: z.string(),
        prompt: z.string(),
      })
    )
    .default([]),
});

export const roadmapStepSchema = z.object({
  phase: z.string(),
  focusTopic: z.string(),
  actionItems: z.array(z.string()),
  estimatedHours: z.number().optional(),
});

export const finalReportSynthesisSchema = z.object({
  summary: z.string().min(15),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missingConcepts: z.array(z.string()).default([]),
  suggestedTopics: z.array(z.string()).default([]),
  preparationRoadmap: z.array(roadmapStepSchema).default([]),
  polishedReport: z.string().optional(),
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type AnswerEvaluation = z.infer<typeof answerEvaluationSchema>;
export type ResumeStructuredData = z.infer<typeof resumeStructuredSchema>;
export type FinalReportSynthesis = z.infer<typeof finalReportSynthesisSchema>;

export interface InterviewContextInput {
  branch: string;
  semester: number;
  interviewType: string;
  difficulty: string;
  topic: string;
  companyName?: string | null;
  questionCount: number;
  resumeSummary?: string | null;
  resumeSkills?: string[];
  resumeProjects?: unknown;
}

export interface EvaluateAnswerInput {
  branch: string;
  interviewType: string;
  difficulty: string;
  questionPrompt: string;
  expectedConcepts: string[];
  candidateAnswer: string;
  conversationHistory: { question: string; answer: string }[];
  shouldGenerateFollowUp: boolean;
}

export interface ReportSynthesisInput {
  branch: string;
  semester: number;
  interviewType: string;
  difficulty: string;
  topic: string;
  companyName?: string | null;
  overallScore: number;
  evaluations: {
    question: string;
    answer: string;
    overallQuestionScore: number;
    strengths: string[];
    weaknesses: string[];
    missingConcepts: string[];
    examinerFeedback: string;
  }[];
}

export interface PrimaryAiProvider {
  generateInitialQuestions(input: InterviewContextInput): Promise<GeneratedQuestion[]>;
  evaluateAnswer(input: EvaluateAnswerInput): Promise<AnswerEvaluation>;
  analyzeResumeText(rawText: string, branch?: string): Promise<ResumeStructuredData>;
  generateReportFallback(input: ReportSynthesisInput): Promise<FinalReportSynthesis>;
}

export interface ReportPolishProvider {
  polishInterviewReport(
    input: ReportSynthesisInput
  ): Promise<FinalReportSynthesis | null>;
}

export function extractAndParseJson<T>(
  rawText: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>
): T {
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const jsonCandidate =
    firstBrace !== -1 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned;

  const parsed = JSON.parse(jsonCandidate);
  return schema.parse(parsed);
}
