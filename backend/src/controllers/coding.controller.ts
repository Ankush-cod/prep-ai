// src/controllers/coding.controller.ts
import { Difficulty } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { codingService } from '../services/coding.service';

export const codingController = {
  getLanguages(_req: Request, res: Response) {
    res.status(200).json({ languages: codingService.getSupportedLanguages() });
  },

  async listProblems(req: Request, res: Response, next: NextFunction) {
    try {
      const { difficulty, topic, company, search } = req.query as {
        difficulty?: Difficulty;
        topic?: string;
        company?: string;
        search?: string;
      };
      const problems = await codingService.listProblems(req.user?.userId, {
        difficulty,
        topic,
        company,
        search,
      });
      res.status(200).json({ problems });
    } catch (error) {
      next(error);
    }
  },

  async getProblem(req: Request, res: Response, next: NextFunction) {
    try {
      const problem = await codingService.getProblemById(
        String(req.params.id),
        req.user?.userId
      );
      res.status(200).json({ problem });
    } catch (error) {
      next(error);
    }
  },

  async runSample(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await codingService.runSampleTests(
        String(req.params.id),
        req.body.language,
        req.body.sourceCode,
        req.body.customInput
      );
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  },

  async submitSolution(req: Request, res: Response, next: NextFunction) {
    try {
      const submission = await codingService.submitSolution(
        req.user!.userId,
        String(req.params.id),
        req.body.language,
        req.body.sourceCode
      );
      res.status(201).json({ submission });
    } catch (error) {
      next(error);
    }
  },

  async listSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const problemId =
        typeof req.query.problemId === 'string' ? req.query.problemId : undefined;
      const submissions = await codingService.listUserSubmissions(
        req.user!.userId,
        problemId
      );
      res.status(200).json({ submissions });
    } catch (error) {
      next(error);
    }
  },
};
