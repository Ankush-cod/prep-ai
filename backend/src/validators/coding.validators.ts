// src/validators/coding.validators.ts
import { z } from 'zod';

export const executeCodeSchema = z.object({
  language: z.enum(['cpp', 'python', 'java', 'javascript', 'go']),
  sourceCode: z
    .string()
    .trim()
    .min(5, 'Source code cannot be empty.')
    .max(50000, 'Source code exceeds the 50 KB maximum limit.'),
  customInput: z.string().max(10000).optional(),
});

export const listProblemsQuerySchema = z.object({
  collection: z.enum(['STRIVER_A2Z', 'CP_31', 'ALL']).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  topic: z.string().trim().optional(),
  company: z.string().trim().optional(),
  rating: z.coerce.number().int().optional(),
  status: z.enum(['all', 'solved', 'unsolved']).optional(),
  search: z.string().trim().optional(),
});
