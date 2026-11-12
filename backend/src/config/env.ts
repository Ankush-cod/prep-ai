// src/config/env.ts
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const backendEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else {
  dotenv.config();
}

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeSmtpPassword = (host: string, rawPassword: string | undefined): string => {
  const trimmed = (rawPassword || '').trim();
  // Google displays 16-character App Passwords with spaces for readability (xxxx xxxx xxxx xxxx).
  if (host.toLowerCase() === 'smtp.gmail.com') {
    return trimmed.replace(/\s+/g, '');
  }
  return trimmed;
};

const smtpHost = (process.env.SMTP_HOST || '').trim();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: toNumber(process.env.PORT, 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  databaseUrl: process.env.DATABASE_URL || '',

  jwtSecret:
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'dev-only-jwt-secret-change-in-production'),
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'dev-only-refresh-secret-change-in-production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',

  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',

  onlineCompilerApiUrl: (
    process.env.ONLINECOMPILER_API_URL || 'https://api.onlinecompiler.io'
  ).replace(/\/$/, ''),
  onlineCompilerApiKey: process.env.ONLINECOMPILER_API_KEY || '',

  smtpHost,
  smtpPort: toNumber(process.env.SMTP_PORT, 587),
  smtpUser: (process.env.SMTP_USER || '').trim(),
  smtpPassword: normalizeSmtpPassword(smtpHost, process.env.SMTP_PASSWORD),
  smtpFrom: (process.env.SMTP_FROM || 'PrepAI <no-reply@prepai.local>').trim(),
};

export const serviceStatus = {
  hasGemini: Boolean(env.geminiApiKey && !env.geminiApiKey.startsWith('your-')),
  hasOpenAi: Boolean(env.openAiApiKey && !env.openAiApiKey.startsWith('your-')),
  hasCloudinary: Boolean(
    env.cloudinaryCloudName &&
      env.cloudinaryApiKey &&
      env.cloudinaryApiSecret &&
      !env.cloudinaryCloudName.startsWith('your-')
  ),
  hasOnlineCompiler: Boolean(
    env.onlineCompilerApiUrl &&
      env.onlineCompilerApiKey &&
      !env.onlineCompilerApiKey.startsWith('your-')
  ),
  hasSmtp: Boolean(
    env.smtpHost &&
      env.smtpUser &&
      env.smtpPassword &&
      !env.smtpUser.startsWith('your-')
  ),
};
