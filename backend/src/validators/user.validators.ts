// src/validators/user.validators.ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(30).optional().nullable(),
  bio: z.string().trim().max(1000).optional().nullable(),
  targetRoles: z.array(z.string().trim()).optional(),
  targetCompanies: z.array(z.string().trim()).optional(),
  targetCompensation: z.string().trim().max(80).optional().nullable(),
  skillsLanguages: z.any().optional(),
  skillsSystems: z.array(z.string().trim()).optional(),
  skillsTheory: z.array(z.string().trim()).optional(),
  institution: z.string().trim().min(2).max(200).optional(),
  rollNumber: z.string().trim().max(60).optional().nullable(),
  branch: z.enum(['CSE', 'ECE', 'EE', 'ME']).optional(),
  academicYear: z.coerce.number().int().min(1).max(4).optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  graduationYear: z.coerce.number().int().min(2020).max(2035).optional().nullable(),
  cgpa: z.coerce.number().min(0).max(10).optional().nullable(),
});

export const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  interviewReminders: z.boolean().optional(),
  interviewReportNotifications: z.boolean().optional(),
  preparationReminders: z.boolean().optional(),
  platformAnnouncements: z.boolean().optional(),
  preferredCodingLang: z.enum(['cpp', 'python', 'java', 'javascript', 'go']).optional(),
  preferredInterviewType: z
    .enum(['TECHNICAL', 'HR', 'DSA', 'SYSTEM_DESIGN', 'RESUME_BASED'])
    .optional(),
  defaultDifficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  preferredTopics: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  resumePersonalization: z.boolean().optional(),
  strictInterviewRubric: z.boolean().optional(),
  theme: z.enum(['dark', 'light', 'system']).optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete your account.'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long.')
    .regex(/[A-Z]/, 'New password must contain an uppercase letter.')
    .regex(/[a-z]/, 'New password must contain a lowercase letter.')
    .regex(/\d/, 'New password must contain a number.'),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

export const adminUpdateRequestSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  adminNote: z.string().trim().max(500).optional(),
});

export const adminResolveFlagSchema = z.object({
  status: z.enum(['OPEN', 'RESOLVED', 'DISMISSED']),
  resolution: z.string().trim().max(1000).optional(),
});
