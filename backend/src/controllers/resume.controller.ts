// src/controllers/resume.controller.ts
import { NextFunction, Request, Response } from 'express';
import { resumeService } from '../services/resume.service';
import { BadRequestError } from '../utils/errors';

export const resumeController = {
  async uploadAndAnalyze(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('Please attach a PDF or DOCX resume file.');
      }
      const resume = await resumeService.uploadAndAnalyze(req.user!.userId, req.file);
      res.status(201).json({ resume });
    } catch (error) {
      next(error);
    }
  },

  async listResumes(req: Request, res: Response, next: NextFunction) {
    try {
      const resumes = await resumeService.listUserResumes(req.user!.userId);
      res.status(200).json({ resumes });
    } catch (error) {
      next(error);
    }
  },

  async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.getLatestResume(req.user!.userId);
      res.status(200).json({ resume });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const resume = await resumeService.getResumeById(
        String(req.params.id),
        req.user!.userId
      );
      res.status(200).json({ resume });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await resumeService.deleteResume(
        String(req.params.id),
        req.user!.userId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
