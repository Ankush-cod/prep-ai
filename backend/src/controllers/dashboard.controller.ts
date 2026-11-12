// src/controllers/dashboard.controller.ts
import { NextFunction, Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

export const dashboardController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getDashboardData(req.user!.userId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getAnalytics(req.user!.userId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },
};
