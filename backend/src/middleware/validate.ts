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
          let message = issue.message;
          if (message === 'Required') {
            message = `Please provide a valid ${path}.`;
          }
          if (!fieldErrors[path]) {
            fieldErrors[path] = message;
          }
        }
        let firstMessage = error.issues[0]?.message || 'Validation failed.';
        if (firstMessage === 'Required') {
          const firstField = error.issues[0]?.path.join('.') || 'configuration';
          firstMessage = `Please provide a valid ${firstField}.`;
        }
        return next(new BadRequestError(firstMessage, fieldErrors));
      }
      next(error);
    }
  };
}
