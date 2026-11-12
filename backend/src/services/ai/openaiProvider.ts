// src/services/ai/openaiProvider.ts
import OpenAI from 'openai';
import { env, serviceStatus } from '../../config/env';
import {
  extractAndParseJson,
  FinalReportSynthesis,
  finalReportSynthesisSchema,
  ReportPolishProvider,
  ReportSynthesisInput,
} from './aiProvider';

export const openaiProvider: ReportPolishProvider = {
  async polishInterviewReport(
    input: ReportSynthesisInput
  ): Promise<FinalReportSynthesis | null> {
    if (!serviceStatus.hasOpenAi) {
      return null;
    }

    try {
      const client = new OpenAI({ apiKey: env.openAiApiKey });
      const completion = await client.chat.completions.create({
        model: env.openAiModel,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a senior engineering mentor writing a polished, concise technical interview report and personalized preparation roadmap grounded strictly in the provided evaluation scores and notes.',
          },
          {
            role: 'user',
            content: `Create a polished written report and study roadmap for this interview session.
Branch: ${input.branch}, Semester: ${input.semester}
Type: ${input.interviewType}, Difficulty: ${input.difficulty}, Topic: ${input.topic}
Target Company Style: ${input.companyName || 'General Engineering'}
Overall Score: ${input.overallScore.toFixed(1)}/100

Evaluations:
${JSON.stringify(input.evaluations, null, 2)}

Return strict JSON:
{
  "summary": "Polished executive summary paragraph",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingConcepts": ["..."],
  "suggestedTopics": ["..."],
  "preparationRoadmap": [
    { "phase": "Week 1", "focusTopic": "...", "actionItems": ["..."], "estimatedHours": 6 }
  ],
  "polishedReport": "Detailed markdown report covering overall impression, per-topic diagnostics, and step-by-step preparation plan."
}`,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return null;
      }

      return extractAndParseJson(content, finalReportSynthesisSchema);
    } catch (err) {
      console.warn(
        '[PrepAI OpenAI] Report polishing failed; falling back to Gemini report.',
        err instanceof Error ? err.message : err
      );
      return null;
    }
  },
};
