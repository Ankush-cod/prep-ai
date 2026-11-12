// src/types/auth.ts
import { Branch } from './prepai';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  branch: Branch;
  academicYear: number;
  semester: number;
  institution: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified?: boolean;
  branch?: Branch;
  academicYear?: number;
  semester?: number;
  institution?: string;
}

export interface AuthResponse {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
}
