// src/validators/interview.validators.ts
import { z } from 'zod';

export const createInterviewSessionSchema = z.object({
  branch: z.enum(['CSE', 'ECE', 'EE', 'ME']),
  semester: z.coerce.number().int().min(1).max(8),
  interviewType: z.enum(['TECHNICAL', 'BEHAVIORAL', 'HR', 'SYSTEM_DESIGN']),
  difficulty: z.string().trim().min(2).max(60),
  topic: z.string().trim().min(2).max(120),
  companyName: z.string().trim().max(80).optional().nullable(),
  questionCount: z.coerce.number().int().min(2).max(8).default(4),
  durationMinutes: z.coerce.number().int().min(15).max(90).default(45),
  resumeId: z.string().trim().optional().nullable(),
});

export const submitAnswerSchema = z.object({
  questionId: z.string().trim().min(1),
  answerText: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters for a meaningful AI evaluation.')
    .max(12000),
});

export const flagSessionSchema = z.object({
  reason: z.string().trim().min(5).max(160),
  details: z.string().trim().max(2000).optional(),
});
