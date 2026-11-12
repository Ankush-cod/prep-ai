// src/validators/content.validators.ts
import { z } from 'zod';

export const companyQuestionCreateSchema = z.object({
  companyName: z.string().trim().min(1).max(80),
  role: z.string().trim().min(2).max(120),
  title: z.string().trim().min(4).max(200),
  questionText: z.string().trim().min(10).max(5000),
  topic: z.string().trim().min(2).max(100),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  tags: z.array(z.string().trim()).optional().default([]),
  frequency: z.string().trim().optional().default('High'),
  lastAsked: z.string().trim().optional(),
  provenance: z.string().trim().optional().default('Verified Historical'),
  solutionSummary: z.string().trim().min(10).max(5000),
  keyConcepts: z.array(z.string().trim()).optional().default([]),
  acceptanceRate: z.string().trim().optional(),
});

export const companyQuestionUpdateSchema = companyQuestionCreateSchema.partial();

export const resourceCreateSchema = z.object({
  branch: z.enum(['CSE', 'ECE', 'EE', 'ME']),
  semester: z.coerce.number().int().min(1).max(8),
  title: z.string().trim().min(4).max(200),
  subject: z.string().trim().min(2).max(120),
  topic: z.string().trim().min(2).max(150),
  format: z.enum(['PDF', 'COMPENDIUM', 'CHEATSHEET', 'NOTES', 'GATE_PYQS', 'LINK']),
  description: z.string().trim().min(10).max(4000),
  contentUrl: z.string().trim().url().optional().nullable(),
  contentBody: z.string().trim().optional().nullable(),
  fileSize: z.string().trim().optional(),
  pages: z.coerce.number().int().positive().optional(),
  author: z.string().trim().min(2).max(120).optional().default('PrepAI Editorial'),
  isGatePyq: z.boolean().optional().default(false),
  isVerified: z.boolean().optional().default(true),
});

export const resourceUpdateSchema = resourceCreateSchema.partial();

export const resourceRequestCreateSchema = z.object({
  branch: z.enum(['CSE', 'ECE', 'EE', 'ME']),
  title: z.string().trim().min(3).max(200),
  subject: z.string().trim().min(2).max(120),
  topic: z.string().trim().max(150).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const toggleBookmarkSchema = z.object({
  targetType: z.enum(['CODING_PROBLEM', 'COMPANY_QUESTION', 'PREPARATION_RESOURCE']),
  targetId: z.string().trim().min(1),
});
