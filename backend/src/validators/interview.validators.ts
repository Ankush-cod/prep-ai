// src/validators/interview.validators.ts
import { z } from 'zod';

export const createInterviewSessionSchema = z.object({
  branch: z.enum(['CSE', 'ECE', 'EE', 'ME'], {
    required_error: 'Please select an engineering branch (CSE, ECE, EE, or ME).',
    invalid_type_error: 'Engineering branch must be one of: CSE, ECE, EE, or ME.',
  }),
  semester: z.coerce
    .number({
      required_error: 'Please select your current semester.',
      invalid_type_error: 'Semester must be an integer between 1 and 8.',
    })
    .int('Semester must be an integer.')
    .min(1, 'Semester must be between 1 and 8.')
    .max(8, 'Semester must be between 1 and 8.')
    .default(5),
  interviewType: z.enum(['TECHNICAL', 'BEHAVIORAL', 'HR', 'SYSTEM_DESIGN'], {
    required_error: 'Please select an interview type (Technical, System Design, Behavioral, or HR).',
    invalid_type_error: 'Invalid interview type specified.',
  }),
  mode: z.enum(['RESUME_BASED', 'TOPIC_BASED', 'COMPREHENSIVE']).default('TOPIC_BASED'),
  difficulty: z
    .string({
      required_error: 'Please specify interview difficulty.',
    })
    .trim()
    .min(2, 'Difficulty must be at least 2 characters.')
    .max(60)
    .default('Medium'),
  topic: z
    .string({
      required_error: 'Please select or enter an interview topic.',
    })
    .trim()
    .min(1, 'Please select or enter an interview topic.')
    .max(120, 'Topic must not exceed 120 characters.')
    .default('Core Fundamentals & Problem Solving'),
  companyName: z.string().trim().max(80).optional().nullable(),
  questionCount: z.coerce
    .number()
    .int('Question count must be an integer.')
    .min(2, 'Number of initial questions must be at least 2.')
    .max(15, 'Number of initial questions cannot exceed 15.')
    .default(4),
  durationMinutes: z.coerce
    .number()
    .int('Duration must be an integer.')
    .min(15, 'Interview duration must be at least 15 minutes.')
    .max(90, 'Interview duration cannot exceed 90 minutes.')
    .default(45),
  resumeId: z.string().trim().optional().nullable(),
  interviewMode: z.string().trim().optional().nullable(),
  subjects: z.array(z.string().trim()).optional(),
  topics: z.array(z.string().trim()).optional(),
  categoryDistribution: z
    .object({
      dsa: z.coerce.number().int().min(0).max(10).optional(),
      projects: z.coerce.number().int().min(0).max(10).optional(),
      coreCs: z.coerce.number().int().min(0).max(10).optional(),
      programming: z.coerce.number().int().min(0).max(10).optional(),
      technologies: z.coerce.number().int().min(0).max(10).optional(),
    })
    .optional(),
});

export const submitAnswerSchema = z.object({
  questionId: z.string({ required_error: 'Question identifier is required.' }).trim().min(1),
  answerText: z
    .string({ required_error: 'Answer text is required.' })
    .trim()
    .min(10, 'Please write at least 10 characters for a meaningful AI evaluation.')
    .max(12000, 'Answer exceeds the 12,000 character maximum limit.'),
});

export const flagSessionSchema = z.object({
  reason: z.string({ required_error: 'Please specify a reason for flagging.' }).trim().min(5, 'Reason must be at least 5 characters.').max(160),
  details: z.string().trim().max(2000).optional(),
});
