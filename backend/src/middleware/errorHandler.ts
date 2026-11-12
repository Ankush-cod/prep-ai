// src/middleware/errorHandler.ts
import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'The requested API endpoint does not exist.',
  });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      ...(err.fieldErrors ? { errors: err.fieldErrors } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'form';
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: err.issues[0]?.message || 'Invalid request payload.',
      errors: fieldErrors,
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded file exceeds the 5 MB size limit.'
        : err.message;
    res.status(400).json({
      code: 'UPLOAD_ERROR',
      message: msg,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        code: 'CONFLICT',
        message: 'A record with this unique value already exists.',
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'The target record could not be found.',
      });
      return;
    }
  }

  if (!env.isProduction) {
    console.error('[PrepAI Error]', err);
  }

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: env.isProduction
      ? 'An unexpected server error occurred.'
      : err.message || 'An unexpected server error occurred.',
  });
}
