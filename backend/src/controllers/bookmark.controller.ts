// src/controllers/bookmark.controller.ts
import { NextFunction, Request, Response } from 'express';
import { bookmarkService } from '../services/bookmark.service';

export const bookmarkController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const bookmarks = await bookmarkService.listBookmarks(req.user!.userId);
      res.status(200).json({ bookmarks });
    } catch (error) {
      next(error);
    }
  },

  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookmarkService.toggleBookmark(
        req.user!.userId,
        req.body.targetType,
        req.body.targetId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookmarkService.removeBookmark(
        req.user!.userId,
        String(req.params.id)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
