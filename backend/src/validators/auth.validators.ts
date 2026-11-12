// src/validators/auth.validators.ts
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .max(128, 'Password must not exceed 128 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/\d/, 'Password must contain at least one number.');

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(120),
  email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),
  password: passwordSchema,
  branch: z.enum(['CSE', 'ECE', 'EE', 'ME'], {
    errorMap: () => ({ message: 'Branch must be one of CSE, ECE, EE, or ME.' }),
  }),
  academicYear: z.coerce.number().int().min(1).max(4),
  semester: z.coerce.number().int().min(1).max(8),
  institution: z
    .string()
    .trim()
    .min(2, 'College or university name must be at least 2 characters.')
    .max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean().optional().default(true),
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(10, 'Invalid verification token.'),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(10, 'Invalid password reset token.'),
  password: passwordSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10).optional(),
});
