// src/controllers/resource.controller.ts
import { BranchCode, ResourceFormat } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { resourceService } from '../services/resource.service';

export const resourceController = {
  async listResources(req: Request, res: Response, next: NextFunction) {
    try {
      const { branch, semester, subject, topic, format, isGatePyq, search } =
        req.query as Record<string, string | undefined>;

      const parsedSemester = semester ? Number(semester) : undefined;
      const parsedGate =
        isGatePyq === 'true' ? true : isGatePyq === 'false' ? false : undefined;

      const resources = await resourceService.listResources(req.user?.userId, {
        branch: branch as BranchCode | undefined,
        semester: Number.isFinite(parsedSemester) ? parsedSemester : undefined,
        subject,
        topic,
        format: format as ResourceFormat | undefined,
        isGatePyq: parsedGate,
        search,
      });

      res.status(200).json({ resources });
    } catch (error) {
      next(error);
    }
  },

  async createResource(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await resourceService.createResource(req.body);
      res.status(201).json({ resource });
    } catch (error) {
      next(error);
    }
  },

  async updateResource(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await resourceService.updateResource(
        String(req.params.id),
        req.body
      );
      res.status(200).json({ resource });
    } catch (error) {
      next(error);
    }
  },

  async deleteResource(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await resourceService.deleteResource(String(req.params.id));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async upvote(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await resourceService.incrementUpvote(String(req.params.id));
      res.status(200).json({ resource });
    } catch (error) {
      next(error);
    }
  },

  async trackDownload(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await resourceService.incrementDownload(String(req.params.id));
      res.status(200).json({ resource });
    } catch (error) {
      next(error);
    }
  },

  async requestResource(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await resourceService.submitResourceRequest(
        req.user!.userId,
        req.body
      );
      res.status(201).json({ request });
    } catch (error) {
      next(error);
    }
  },
};
