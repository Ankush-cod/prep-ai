// src/controllers/settings.controller.ts
import { NextFunction, Request, Response } from 'express';
import { settingsService } from '../services/settings.service';

export const settingsController = {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings(req.user!.userId);
      res.status(200).json({ settings });
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.updateSettings(req.user!.userId, req.body);
      res.status(200).json({ settings });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.changePassword(
        req.user!.userId,
        req.body.currentPassword,
        req.body.newPassword
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await settingsService.listActiveSessions(req.user!.userId);
      res.status(200).json({ sessions });
    } catch (error) {
      next(error);
    }
  },

  async logoutAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.logoutAllDevices(req.user!.userId);
      res.clearCookie('prepai_refresh_token', { path: '/api/auth' });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.deleteAccount(
        req.user!.userId,
        req.body.password
      );
      res.clearCookie('prepai_refresh_token', { path: '/api/auth' });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
