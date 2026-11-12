// src/middleware/validate.ts
import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

export function validate(schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || 'form';
          if (!fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        }
        const firstMessage = error.issues[0]?.message || 'Validation failed.';
        return next(new BadRequestError(firstMessage, fieldErrors));
      }
      next(error);
    }
  };
}
