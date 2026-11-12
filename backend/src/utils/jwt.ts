// src/utils/jwt.ts
import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { UnauthorizedError } from './errors';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  type: 'refresh';
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is not configured.');
  }
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign({ ...payload, type: 'access' }, env.jwtSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
    if (decoded.type !== 'access' || !decoded.userId) {
      throw new UnauthorizedError('Invalid access token.');
    }
    return decoded;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token.');
  }
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  if (!env.jwtRefreshSecret) {
    throw new Error('JWT_REFRESH_SECRET is not configured.');
  }
  const options: SignOptions = {
    expiresIn: env.jwtRefreshExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign({ ...payload, type: 'refresh' }, env.jwtRefreshSecret, options);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
    if (decoded.type !== 'refresh' || !decoded.userId) {
      throw new UnauthorizedError('Invalid refresh token.');
    }
    return decoded;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token.');
  }
}

export function generateOpaqueToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
