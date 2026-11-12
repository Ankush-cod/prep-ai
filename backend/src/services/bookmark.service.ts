// src/services/bookmark.service.ts
import { BookmarkTargetType } from '@prisma/client';
import { prisma } from '../config/database';
import { ForbiddenError, NotFoundError } from '../utils/errors';

export const bookmarkService = {
  async listBookmarks(userId: string) {
    const rows = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        codingProblem: {
          include: { company: { select: { name: true } } },
        },
        companyQuestion: {
          include: { company: { select: { name: true } } },
        },
        preparationResource: {
          include: { branch: true, semester: true },
        },
      },
    });

    return rows.map((row) => {
      if (row.targetType === BookmarkTargetType.CODING_PROBLEM && row.codingProblem) {
        return {
          id: row.id,
          targetId: row.codingProblem.id,
          targetType: row.targetType,
          category: 'Coding Practice' as const,
          title: row.codingProblem.title,
          branch: 'CSE',
          difficulty: row.codingProblem.difficulty,
          tags: row.codingProblem.tags,
          targetCompany: row.codingProblem.company?.name,
          createdAt: row.createdAt,
        };
      }
      if (row.targetType === BookmarkTargetType.COMPANY_QUESTION && row.companyQuestion) {
        return {
          id: row.id,
          targetId: row.companyQuestion.id,
          targetType: row.targetType,
          category: 'Company Questions' as const,
          title: row.companyQuestion.title,
          branch: 'Cross-Track',
          difficulty: row.companyQuestion.difficulty,
          tags: row.companyQuestion.tags,
          targetCompany: row.companyQuestion.company.name,
          createdAt: row.createdAt,
        };
      }
      return {
        id: row.id,
        targetId: row.preparationResource?.id || '',
        targetType: row.targetType,
        category: 'Preparation Resources' as const,
        title: row.preparationResource?.title || 'Saved Resource',
        branch: row.preparationResource?.branch.code || 'CSE',
        tags: row.preparationResource
          ? [row.preparationResource.subject, row.preparationResource.format]
          : [],
        createdAt: row.createdAt,
      };
    });
  },

  async toggleBookmark(
    userId: string,
    targetType: BookmarkTargetType,
    targetId: string
  ) {
    if (targetType === BookmarkTargetType.CODING_PROBLEM) {
      const target = await prisma.codingProblem.findUnique({ where: { id: targetId } });
      if (!target) throw new NotFoundError('Coding problem not found.');

      const existing = await prisma.bookmark.findUnique({
        where: { userId_codingProblemId: { userId, codingProblemId: targetId } },
      });
      if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        return { bookmarked: false };
      }
      const created = await prisma.bookmark.create({
        data: { userId, targetType, codingProblemId: targetId },
      });
      return { bookmarked: true, bookmark: created };
    }

    if (targetType === BookmarkTargetType.COMPANY_QUESTION) {
      const target = await prisma.companyQuestion.findUnique({ where: { id: targetId } });
      if (!target) throw new NotFoundError('Company question not found.');

      const existing = await prisma.bookmark.findUnique({
        where: { userId_companyQuestionId: { userId, companyQuestionId: targetId } },
      });
      if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        return { bookmarked: false };
      }
      const created = await prisma.bookmark.create({
        data: { userId, targetType, companyQuestionId: targetId },
      });
      return { bookmarked: true, bookmark: created };
    }

    const target = await prisma.preparationResource.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundError('Preparation resource not found.');

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_preparationResourceId: { userId, preparationResourceId: targetId },
      },
    });
    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }
    const created = await prisma.bookmark.create({
      data: { userId, targetType, preparationResourceId: targetId },
    });
    return { bookmarked: true, bookmark: created };
  },

  async removeBookmark(userId: string, bookmarkId: string) {
    const bm = await prisma.bookmark.findUnique({ where: { id: bookmarkId } });
    if (!bm) {
      throw new NotFoundError('Bookmark not found.');
    }
    if (bm.userId !== userId) {
      throw new ForbiddenError('Cannot remove another user bookmark.');
    }
    await prisma.bookmark.delete({ where: { id: bookmarkId } });
    return { message: 'Bookmark removed.' };
  },
};
