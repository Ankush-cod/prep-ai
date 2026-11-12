// src/controllers/interview.controller.ts
import { NextFunction, Request, Response } from 'express';
import { interviewService } from '../services/interview.service';
import { reportService } from '../services/report.service';

export const interviewController = {
  async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await interviewService.createSession(req.user!.userId, req.body);
      res.status(201).json({ session });
    } catch (error) {
      next(error);
    }
  },

  async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await interviewService.listUserSessions(req.user!.userId);
      res.status(200).json({ sessions });
    } catch (error) {
      next(error);
    }
  },

  async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await interviewService.getSessionById(
        String(req.params.id),
        req.user!.userId,
        req.user!.role === 'ADMIN'
      );
      res.status(200).json({ session });
    } catch (error) {
      next(error);
    }
  },

  async submitAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await interviewService.submitAnswer(
        String(req.params.id),
        req.user!.userId,
        req.body.questionId,
        req.body.answerText
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async completeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await interviewService.completeSession(
        String(req.params.id),
        req.user!.userId
      );
      res.status(200).json({ session });
    } catch (error) {
      next(error);
    }
  },

  async downloadReportPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const pdfBuffer = await reportService.generateInterviewPdf(
        String(req.params.id),
        req.user!.userId,
        req.user!.role === 'ADMIN'
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="prepai-interview-report-${req.params.id}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  },

  async flagSession(req: Request, res: Response, next: NextFunction) {
    try {
      const flag = await interviewService.flagSessionForReview(
        String(req.params.id),
        req.user!.userId,
        req.body.reason,
        req.body.details
      );
      res.status(201).json({ flag });
    } catch (error) {
      next(error);
    }
  },
};
