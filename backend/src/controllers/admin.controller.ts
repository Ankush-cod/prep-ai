// src/controllers/admin.controller.ts
import { NextFunction, Request, Response } from 'express';
import { adminService } from '../services/admin.service';

export const adminController = {
  async getOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await adminService.getOverview();
      res.status(200).json(overview);
    } catch (error) {
      next(error);
    }
  },

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const users = await adminService.listUsers(search);
      res.status(200).json({ users });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminService.updateUser(
        req.user!.userId,
        String(req.params.id),
        req.body
      );
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async listResourceRequests(_req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await adminService.listResourceRequests();
      res.status(200).json({ requests });
    } catch (error) {
      next(error);
    }
  },

  async updateResourceRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await adminService.updateResourceRequest(
        String(req.params.id),
        req.body.status,
        req.body.adminNote
      );
      res.status(200).json({ request });
    } catch (error) {
      next(error);
    }
  },

  async listAiReviews(_req: Request, res: Response, next: NextFunction) {
    try {
      const flags = await adminService.listAiReviewFlags();
      res.status(200).json({ flags });
    } catch (error) {
      next(error);
    }
  },

  async resolveAiReview(req: Request, res: Response, next: NextFunction) {
    try {
      const flag = await adminService.resolveAiReviewFlag(
        String(req.params.id),
        req.user!.userId,
        req.body.status,
        req.body.resolution
      );
      res.status(200).json({ flag });
    } catch (error) {
      next(error);
    }
  },

  async getAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await adminService.getPlatformAnalytics();
      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  },
};
