// src/services/admin.service.ts
import {
  InterviewStatus,
  ResourceRequestStatus,
  ReviewFlagStatus,
  UserRole,
} from '@prisma/client';
import { prisma } from '../config/database';
import { serviceStatus } from '../config/env';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const adminService = {
  async getOverview() {
    const [
      totalUsers,
      activeUsers,
      totalSessions,
      completedSessions,
      totalResources,
      totalCodingProblems,
      totalCompanyQuestions,
      pendingResourceRequests,
      openReviewFlags,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.interviewSession.count(),
      prisma.interviewSession.count({ where: { status: InterviewStatus.COMPLETED } }),
      prisma.preparationResource.count(),
      prisma.codingProblem.count(),
      prisma.companyQuestion.count(),
      prisma.resourceRequest.count({ where: { status: ResourceRequestStatus.PENDING } }),
      prisma.aiReviewFlag.count({ where: { status: ReviewFlagStatus.OPEN } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          email: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          profile: { select: { fullName: true } },
          academicDetails: { include: { branch: true, semester: true } },
        },
      }),
    ]);

    return {
      metrics: {
        totalUsers,
        activeUsers,
        totalSessions,
        completedSessions,
        totalResources,
        totalCodingProblems,
        totalCompanyQuestions,
        pendingResourceRequests,
        openReviewFlags,
      },
      integrations: serviceStatus,
      recentUsers,
    };
  },

  async listUsers(search?: string) {
    return prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { profile: { fullName: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        profile: { select: { fullName: true } },
        academicDetails: {
          include: { branch: true, semester: true },
        },
        _count: {
          select: { interviewSessions: true, codingSubmissions: true },
        },
      },
    });
  },

  async updateUser(
    adminUserId: string,
    targetUserId: string,
    input: { role?: UserRole; isActive?: boolean }
  ) {
    if (adminUserId === targetUserId && (input.role === UserRole.USER || input.isActive === false)) {
      throw new BadRequestError('Administrators cannot demote or deactivate their own account.');
    }

    const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!existing) {
      throw new NotFoundError('User not found.');
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(input.role ? { role: input.role } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
      },
    });
  },

  async listResourceRequests() {
    return prisma.resourceRequest.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        branch: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });
  },

  async updateResourceRequest(
    requestId: string,
    status: ResourceRequestStatus,
    adminNote?: string
  ) {
    const existing = await prisma.resourceRequest.findUnique({ where: { id: requestId } });
    if (!existing) {
      throw new NotFoundError('Resource request not found.');
    }

    return prisma.resourceRequest.update({
      where: { id: requestId },
      data: {
        status,
        ...(adminNote !== undefined ? { adminNote } : {}),
      },
      include: { branch: true },
    });
  },

  async listAiReviewFlags() {
    return prisma.aiReviewFlag.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        session: {
          select: {
            id: true,
            title: true,
            interviewType: true,
            overallScore: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });
  },

  async resolveAiReviewFlag(
    flagId: string,
    adminUserId: string,
    status: ReviewFlagStatus,
    resolution?: string
  ) {
    const existing = await prisma.aiReviewFlag.findUnique({ where: { id: flagId } });
    if (!existing) {
      throw new NotFoundError('AI review flag not found.');
    }

    return prisma.aiReviewFlag.update({
      where: { id: flagId },
      data: {
        status,
        resolvedBy: adminUserId,
        resolution: resolution || null,
      },
    });
  },

  async getPlatformAnalytics() {
    const [branches, completedSessions, totalSubmissions, acceptedSubmissions] =
      await Promise.all([
        prisma.branch.findMany({
          include: {
            _count: {
              select: {
                academicDetails: true,
                interviewSessions: true,
                preparationResources: true,
              },
            },
          },
        }),
        prisma.interviewSession.findMany({
          where: { status: InterviewStatus.COMPLETED, overallScore: { not: null } },
          select: { overallScore: true, interviewType: true },
        }),
        prisma.codingSubmission.count(),
        prisma.codingSubmission.count({ where: { status: 'ACCEPTED' } }),
      ]);

    const avgSessionScore =
      completedSessions.length > 0
        ? Number(
            (
              completedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) /
              completedSessions.length
            ).toFixed(1)
          )
        : 0;

    return {
      branchDistribution: branches.map((b) => ({
        code: b.code,
        name: b.name,
        studentsCount: b._count.academicDetails,
        interviewsCount: b._count.interviewSessions,
        resourcesCount: b._count.preparationResources,
      })),
      averageInterviewScore: avgSessionScore,
      completedInterviewsCount: completedSessions.length,
      codingSubmissions: {
        total: totalSubmissions,
        accepted: acceptedSubmissions,
      },
    };
  },
};
