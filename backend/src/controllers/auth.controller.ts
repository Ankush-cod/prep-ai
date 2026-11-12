// src/controllers/auth.controller.ts
import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { authService } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe = true
) {
  const cookieBase = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: (env.isProduction ? 'none' : 'lax') as 'none' | 'lax',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieBase,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieBase,
    maxAge: (rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response) {
  const cookieBase = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: (env.isProduction ? 'none' : 'lax') as 'none' | 'lax',
  };
  res.clearCookie('accessToken', cookieBase);
  res.clearCookie('refreshToken', cookieBase);
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      setAuthCookies(res, result.accessToken, result.refreshToken, req.body.rememberMe);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await authService.refreshAccessToken(token);
      setAuthCookies(res, result.accessToken, result.refreshToken, true);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await authService.logout(token);
      clearAuthCookies(res);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyEmail(req.body.token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resendVerification(req.body.email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      clearAuthCookies(res);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const user = await authService.getCurrentUser(req.user.userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  },
};
