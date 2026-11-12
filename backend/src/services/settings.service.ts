// src/services/settings.service.ts
import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { comparePassword, hashPassword } from '../utils/password';

export const settingsService = {
  async getSettings(userId: string) {
    return prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  },

  async updateSettings(
    userId: string,
    input: {
      emailNotifications?: boolean;
      interviewReminders?: boolean;
      interviewReportNotifications?: boolean;
      preparationReminders?: boolean;
      platformAnnouncements?: boolean;
      preferredCodingLang?: string;
      preferredInterviewType?: string;
      defaultDifficulty?: string;
      preferredTopics?: string[];
      resumePersonalization?: boolean;
      strictInterviewRubric?: boolean;
      theme?: string;
    }
  ) {
    return prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        emailNotifications: input.emailNotifications ?? true,
        interviewReminders: input.interviewReminders ?? true,
        interviewReportNotifications: input.interviewReportNotifications ?? true,
        preparationReminders: input.preparationReminders ?? true,
        platformAnnouncements: input.platformAnnouncements ?? false,
        preferredCodingLang: input.preferredCodingLang ?? 'cpp',
        preferredInterviewType: input.preferredInterviewType ?? 'TECHNICAL',
        defaultDifficulty: input.defaultDifficulty ?? 'Medium',
        preferredTopics: input.preferredTopics ?? [],
        resumePersonalization: input.resumePersonalization ?? true,
        strictInterviewRubric: input.strictInterviewRubric ?? true,
        theme: input.theme ?? 'dark',
      },
      update: {
        ...(input.emailNotifications !== undefined
          ? { emailNotifications: input.emailNotifications }
          : {}),
        ...(input.interviewReminders !== undefined
          ? { interviewReminders: input.interviewReminders }
          : {}),
        ...(input.interviewReportNotifications !== undefined
          ? { interviewReportNotifications: input.interviewReportNotifications }
          : {}),
        ...(input.preparationReminders !== undefined
          ? { preparationReminders: input.preparationReminders }
          : {}),
        ...(input.platformAnnouncements !== undefined
          ? { platformAnnouncements: input.platformAnnouncements }
          : {}),
        ...(input.preferredCodingLang !== undefined
          ? { preferredCodingLang: input.preferredCodingLang }
          : {}),
        ...(input.preferredInterviewType !== undefined
          ? { preferredInterviewType: input.preferredInterviewType }
          : {}),
        ...(input.defaultDifficulty !== undefined
          ? { defaultDifficulty: input.defaultDifficulty }
          : {}),
        ...(input.preferredTopics !== undefined
          ? { preferredTopics: input.preferredTopics }
          : {}),
        ...(input.resumePersonalization !== undefined
          ? { resumePersonalization: input.resumePersonalization }
          : {}),
        ...(input.strictInterviewRubric !== undefined
          ? { strictInterviewRubric: input.strictInterviewRubric }
          : {}),
        ...(input.theme !== undefined ? { theme: input.theme } : {}),
      },
    });
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const matches = await comparePassword(currentPassword, user.passwordHash);
    if (!matches) {
      throw new BadRequestError('Current password is incorrect.');
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password updated successfully.' };
  },

  async listActiveSessions(userId: string) {
    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return sessions;
  },

  async logoutAllDevices(userId: string) {
    const result = await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return {
      message: 'All active sessions have been signed out.',
      revokedCount: result.count,
    };
  },

  async deleteAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const matches = await comparePassword(password, user.passwordHash);
    if (!matches) {
      throw new BadRequestError('Password is incorrect.');
    }

    await prisma.user.delete({ where: { id: userId } });
    return { message: 'Your account has been permanently deleted.' };
  },
};
