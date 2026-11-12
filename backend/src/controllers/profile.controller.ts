// src/controllers/profile.controller.ts
import { NextFunction, Request, Response } from 'express';
import { profileService } from '../services/profile.service';

export const profileController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await profileService.getProfile(req.user!.userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await profileService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  },
};
