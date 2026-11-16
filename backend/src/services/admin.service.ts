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

  async listCodingProblems(filters?: { search?: string; collection?: string; difficulty?: string }) {
    const where: any = {};
    if (filters?.collection && filters.collection !== 'ALL') {
      where.collection = filters.collection;
    }
    if (filters?.difficulty && filters.difficulty !== 'All') {
      where.difficulty = filters.difficulty;
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { topic: { contains: filters.search, mode: 'insensitive' } },
        { problemIdentifier: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.codingProblem.findMany({
      where,
      orderBy: [{ collection: 'asc' }, { orderIndex: 'asc' }, { createdAt: 'desc' }],
      include: {
        company: { select: { name: true } },
        _count: { select: { submissions: true } },
      },
    });
  },

  async createCodingProblem(data: any) {
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    return prisma.codingProblem.create({
      data: {
        title: data.title,
        slug,
        difficulty: data.difficulty || 'MEDIUM',
        topic: data.topic || 'General DSA',
        track: data.track || 'Core DSA',
        collection: data.collection || 'STRIVER_A2Z',
        problemIdentifier: data.problemIdentifier || null,
        contestNumber: data.contestNumber ? Number(data.contestNumber) : null,
        rating: data.rating ? Number(data.rating) : null,
        externalUrl: data.externalUrl || null,
        orderIndex: data.orderIndex ? Number(data.orderIndex) : 0,
        description: data.description || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        constraints: Array.isArray(data.constraints) ? data.constraints : [],
        examples: data.examples || [],
        starterCode: data.starterCode || {
          cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
          python: 'def solve():\n    pass\n\nif __name__ == "__main__":\n    solve()\n',
          java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n    }\n}',
          javascript: 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8");\n',
          c: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
          go: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println()\n}',
        },
        testCases: data.testCases || [{ input: '1', expectedOutput: '1' }],
      },
    });
  },

  async updateCodingProblem(id: string, data: any) {
    const existing = await prisma.codingProblem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Coding problem not found.');

    return prisma.codingProblem.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.difficulty ? { difficulty: data.difficulty } : {}),
        ...(data.topic ? { topic: data.topic } : {}),
        ...(data.collection ? { collection: data.collection } : {}),
        ...(data.problemIdentifier !== undefined ? { problemIdentifier: data.problemIdentifier } : {}),
        ...(data.contestNumber !== undefined
          ? { contestNumber: data.contestNumber ? Number(data.contestNumber) : null }
          : {}),
        ...(data.rating !== undefined ? { rating: data.rating ? Number(data.rating) : null } : {}),
        ...(data.externalUrl !== undefined ? { externalUrl: data.externalUrl } : {}),
        ...(data.orderIndex !== undefined ? { orderIndex: Number(data.orderIndex) } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(Array.isArray(data.tags) ? { tags: data.tags } : {}),
        ...(Array.isArray(data.constraints) ? { constraints: data.constraints } : {}),
        ...(data.examples ? { examples: data.examples } : {}),
        ...(data.starterCode ? { starterCode: data.starterCode } : {}),
        ...(data.testCases ? { testCases: data.testCases } : {}),
      },
    });
  },

  async deleteCodingProblem(id: string) {
    const existing = await prisma.codingProblem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Coding problem not found.');
    await prisma.codingProblem.delete({ where: { id } });
    return { message: 'Coding problem deleted successfully.' };
  },

  async listInterviewSessions(filters?: { search?: string; status?: string }) {
    const where: any = {};
    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { user: { profile: { fullName: { contains: filters.search, mode: 'insensitive' } } } },
      ];
    }

    return prisma.interviewSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        branch: true,
        _count: { select: { questions: true } },
      },
    });
  },
};
