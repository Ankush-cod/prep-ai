// src/services/ai/geminiProvider.ts
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env, serviceStatus } from '../../config/env';
import { AppError, ServiceUnavailableError } from '../../utils/errors';
import {
  AnswerEvaluation,
  answerEvaluationSchema,
  EvaluateAnswerInput,
  extractAndParseJson,
  FinalReportSynthesis,
  finalReportSynthesisSchema,
  GeneratedQuestion,
  generatedQuestionListSchema,
  InterviewContextInput,
  PrimaryAiProvider,
  ReportSynthesisInput,
  ResumeStructuredData,
  resumeStructuredSchema,
} from './aiProvider';

function getModelCandidates(): string[] {
  const models = [
    env.geminiModel,
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];
  return Array.from(new Set(models.filter(Boolean)));
}

async function generateValidatedJson<T>(
  prompt: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>
): Promise<T> {
  if (!serviceStatus.hasGemini) {
    throw new ServiceUnavailableError(
      'GEMINI_API_KEY is not configured. Add a valid GEMINI_API_KEY to backend/.env to enable AI interview evaluation and resume analysis.'
    );
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const candidateModels = getModelCandidates();
  let lastError: Error | null = null;

  for (const modelName of candidateModels) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.35,
      },
    });

    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return extractAndParseJson(text, schema);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const status = (err as { status?: number })?.status;
        const msg = lastError.message.slice(0, 140);
        console.warn(
          `[PrepAI Gemini] Attempt ${attempt} failed on model=${modelName} (status=${status || 'N/A'}): ${msg}`
        );

        // If retired 404, break to next candidate model immediately
        if (status === 404) {
          break;
        }

        // If 503 or 429, wait briefly and retry once
        if (attempt < maxAttempts && (status === 503 || status === 429)) {
          await new Promise((r) => setTimeout(r, 1200 * attempt));
        }
      }
    }
  }

  const message = lastError ? lastError.message : 'Unknown Gemini failure';
  throw new ServiceUnavailableError(
    `Gemini AI could not produce a valid structured response: ${message}`
  );
}

export const geminiProvider: PrimaryAiProvider = {
  async generateInitialQuestions(input: InterviewContextInput): Promise<GeneratedQuestion[]> {
    const resumeContextBlock = input.resumeSummary
      ? `Candidate Resume Summary: ${input.resumeSummary}\nSkills: ${(input.resumeSkills || []).join(', ')}\nProjects: ${JSON.stringify(input.resumeProjects || [])}`
      : 'No resume provided.';

    const prompt = `You are a senior technical interviewer conducting a realistic B.Tech engineering mock interview.
Candidate Context:
- Branch: ${input.branch}
- Current Semester: ${input.semester}
- Interview Type: ${input.interviewType}
- Difficulty: ${input.difficulty}
- Focus Topic: ${input.topic}
- Target Company Style: ${input.companyName || 'General Tier-1 Engineering'}
- Number of Initial Questions to Generate: ${input.questionCount}
- ${resumeContextBlock}

Generate ${input.questionCount} clear, distinct, realistic text-based technical/interview questions suitable for this candidate. Incorporate relevant resume projects if provided.
Return strict JSON matching:
{
  "questions": [
    {
      "prompt": "Detailed interview question text",
      "topic": "Specific sub-topic",
      "expectedConcepts": ["concept 1", "concept 2", "concept 3"],
      "hint": "Concise non-spoiler hint"
    }
  ]
}`;

    const parsed = await generateValidatedJson(prompt, generatedQuestionListSchema);
    return parsed.questions.slice(0, input.questionCount);
  },

  async evaluateAnswer(input: EvaluateAnswerInput): Promise<AnswerEvaluation> {
    const historyText =
      input.conversationHistory.length > 0
        ? input.conversationHistory
            .map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`)
            .join('\n\n')
        : 'None';

    const prompt = `You are a strict, fair technical interviewer evaluating a B.Tech candidate answer.
Context:
- Branch: ${input.branch}
- Interview Type: ${input.interviewType}
- Difficulty: ${input.difficulty}
- Prior Conversation History:
${historyText}

Current Question: ${input.questionPrompt}
Expected Concepts: ${input.expectedConcepts.join(', ') || 'Core engineering accuracy'}
Candidate Answer:
"""
${input.candidateAnswer}
"""

Score each of the 6 dimensions from 0 to 100 honestly based strictly on what the candidate wrote (do not inflate empty or vague answers):
1. technicalScore (technical correctness)
2. conceptualScore (conceptual understanding)
3. clarityScore (clarity)
4. communicationScore (communication)
5. completenessScore (completeness)
6. problemSolvingScore (problem-solving approach)
Compute overallScore (0-100).

${
  input.shouldGenerateFollowUp
    ? 'Also generate 1 targeted followUpQuestion that probes a weak spot, missing edge case, or deeper architectural detail in the candidate answer.'
    : 'Set followUpQuestion to null because enough questions have already been asked.'
}

Return strict JSON matching:
{
  "technicalScore": 0-100,
  "conceptualScore": 0-100,
  "clarityScore": 0-100,
  "communicationScore": 0-100,
  "completenessScore": 0-100,
  "problemSolvingScore": 0-100,
  "overallScore": 0-100,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingConcepts": ["..."],
  "examinerFeedback": "Constructive paragraph evaluating the answer",
  "followUpQuestion": ${
    input.shouldGenerateFollowUp
      ? '{ "prompt": "...", "topic": "...", "expectedConcepts": ["..."], "hint": "..." }'
      : 'null'
  }
}`;

    return generateValidatedJson(prompt, answerEvaluationSchema);
  },

  async analyzeResumeText(rawText: string, branch?: string): Promise<ResumeStructuredData> {
    const trimmedText = rawText.slice(0, 18000);
    const prompt = `You are an engineering technical interviewer extracting structured facts from a candidate resume for engineering technical interview preparation (do NOT produce an ATS score or job match score).
Candidate Branch Hint: ${branch || 'Engineering'}

Extracted Resume Text:
"""
${trimmedText}
"""

Extract only facts present in the text into structured sections, then generate 4 personalized technical interview questions grounded in their actual projects/skills/experience and 3 follow-up probe questions.
Return strict JSON matching:
{
  "education": [{ "degree": "...", "institution": "...", "year": "...", "details": "..." }],
  "skills": ["..."],
  "technologies": ["..."],
  "projects": [{ "name": "...", "description": "...", "technologies": ["..."] }],
  "experience": [{ "role": "...", "organization": "...", "period": "...", "highlights": "..." }],
  "certifications": ["..."],
  "summary": "2-3 sentence factual technical profile summary",
  "personalizedQuestions": [{ "domain": "...", "prompt": "...", "difficulty": "Medium|Hard" }],
  "followUpQuestions": [{ "parentTopic": "...", "prompt": "..." }]
}`;

    return generateValidatedJson(prompt, resumeStructuredSchema);
  },

  async generateReportFallback(input: ReportSynthesisInput): Promise<FinalReportSynthesis> {
    const prompt = `Synthesize an honest, actionable final mock interview report from these real question evaluations.
Session Metadata:
- Branch: ${input.branch}, Semester: ${input.semester}
- Interview Type: ${input.interviewType}, Difficulty: ${input.difficulty}, Topic: ${input.topic}
- Company Style: ${input.companyName || 'General Technical'}
- Computed Overall Score: ${input.overallScore.toFixed(1)}/100

Evaluated Questions & Answers:
${JSON.stringify(input.evaluations, null, 2)}

Return strict JSON matching:
{
  "summary": "Concise executive evaluation summary",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingConcepts": ["..."],
  "suggestedTopics": ["..."],
  "preparationRoadmap": [
    {
      "phase": "Week 1",
      "focusTopic": "...",
      "actionItems": ["..."],
      "estimatedHours": 6
    }
  ],
  "polishedReport": "Well-structured markdown written report summarizing performance and next steps."
}`;

    return generateValidatedJson(prompt, finalReportSynthesisSchema);
  },
};
