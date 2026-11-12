// src/controllers/companyQuestion.controller.ts
import { Difficulty } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { companyQuestionService } from '../services/companyQuestion.service';

export const companyQuestionController = {
  async listCompanies(_req: Request, res: Response, next: NextFunction) {
    try {
      const companies = await companyQuestionService.listCompanies();
      res.status(200).json({ companies });
    } catch (error) {
      next(error);
    }
  },

  async listQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { company, topic, difficulty, search } = req.query as {
        company?: string;
        topic?: string;
        difficulty?: Difficulty;
        search?: string;
      };
      const questions = await companyQuestionService.listQuestions(req.user?.userId, {
        company,
        topic,
        difficulty,
        search,
      });
      res.status(200).json({ questions });
    } catch (error) {
      next(error);
    }
  },

  async getQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const question = await companyQuestionService.getQuestionById(
        String(req.params.id),
        req.user?.userId
      );
      res.status(200).json({ question });
    } catch (error) {
      next(error);
    }
  },

  async createQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const question = await companyQuestionService.createQuestion(req.body);
      res.status(201).json({ question });
    } catch (error) {
      next(error);
    }
  },

  async updateQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const question = await companyQuestionService.updateQuestion(
        String(req.params.id),
        req.body
      );
      res.status(200).json({ question });
    } catch (error) {
      next(error);
    }
  },

  async deleteQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await companyQuestionService.deleteQuestion(String(req.params.id));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
