// src/services/resource.service.ts
import { BranchCode, Prisma, ResourceFormat } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export const resourceService = {
  async listResources(
    userId: string | undefined,
    filters: {
      branch?: BranchCode;
      semester?: number;
      subject?: string;
      topic?: string;
      format?: ResourceFormat;
      isGatePyq?: boolean;
      search?: string;
    }
  ) {
    const where: Prisma.PreparationResourceWhereInput = {};

    if (filters.branch) {
      where.branch = { code: filters.branch };
    }
    if (filters.semester) {
      where.semester = { number: filters.semester };
    }
    if (filters.subject && filters.subject !== 'All') {
      where.subject = { contains: filters.subject, mode: 'insensitive' };
    }
    if (filters.topic && filters.topic !== 'All') {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }
    if (filters.format) {
      where.format = filters.format;
    }
    if (filters.isGatePyq !== undefined) {
      where.isGatePyq = filters.isGatePyq;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { topic: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const resources = await prisma.preparationResource.findMany({
      where,
      orderBy: [{ isVerified: 'desc' }, { upvotes: 'desc' }, { createdAt: 'desc' }],
      include: {
        branch: true,
        semester: true,
      },
    });

    if (!userId) {
      return resources.map((r) => ({ ...r, isBookmarked: false }));
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId, preparationResourceId: { not: null } },
      select: { preparationResourceId: true },
    });
    const bookmarkedSet = new Set(bookmarks.map((b) => b.preparationResourceId!));

    return resources.map((r) => ({
      ...r,
      isBookmarked: bookmarkedSet.has(r.id),
    }));
  },

  async createResource(input: {
    branch: BranchCode;
    semester: number;
    title: string;
    subject: string;
    topic: string;
    format: ResourceFormat;
    description: string;
    contentUrl?: string | null;
    contentBody?: string | null;
    fileSize?: string;
    pages?: number;
    author?: string;
    isGatePyq?: boolean;
    isVerified?: boolean;
  }) {
    const branch = await prisma.branch.findUnique({ where: { code: input.branch } });
    const semester = await prisma.semester.findUnique({ where: { number: input.semester } });
    if (!branch || !semester) {
      throw new NotFoundError('Invalid branch or semester reference.');
    }

    return prisma.preparationResource.create({
      data: {
        branchId: branch.id,
        semesterId: semester.id,
        title: input.title,
        subject: input.subject,
        topic: input.topic,
        format: input.format,
        description: input.description,
        contentUrl: input.contentUrl || null,
        contentBody: input.contentBody || null,
        fileSize: input.fileSize || null,
        pages: input.pages || null,
        author: input.author || 'PrepAI Editorial',
        isGatePyq: input.isGatePyq ?? input.format === ResourceFormat.GATE_PYQS,
        isVerified: input.isVerified ?? true,
      },
      include: { branch: true, semester: true },
    });
  },

  async updateResource(id: string, data: Record<string, unknown>) {
    const existing = await prisma.preparationResource.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Preparation resource not found.');
    }

    const updatePayload: Prisma.PreparationResourceUpdateInput = {};
    if (typeof data.title === 'string') updatePayload.title = data.title;
    if (typeof data.subject === 'string') updatePayload.subject = data.subject;
    if (typeof data.topic === 'string') updatePayload.topic = data.topic;
    if (typeof data.format === 'string') updatePayload.format = data.format as ResourceFormat;
    if (typeof data.description === 'string') updatePayload.description = data.description;
    if (typeof data.contentUrl === 'string' || data.contentUrl === null) {
      updatePayload.contentUrl = data.contentUrl;
    }
    if (typeof data.contentBody === 'string' || data.contentBody === null) {
      updatePayload.contentBody = data.contentBody;
    }
    if (typeof data.isVerified === 'boolean') updatePayload.isVerified = data.isVerified;
    if (typeof data.isGatePyq === 'boolean') updatePayload.isGatePyq = data.isGatePyq;

    if (typeof data.branch === 'string') {
      const b = await prisma.branch.findUnique({ where: { code: data.branch as BranchCode } });
      if (b) updatePayload.branch = { connect: { id: b.id } };
    }
    if (typeof data.semester === 'number') {
      const s = await prisma.semester.findUnique({ where: { number: data.semester } });
      if (s) updatePayload.semester = { connect: { id: s.id } };
    }

    return prisma.preparationResource.update({
      where: { id },
      data: updatePayload,
      include: { branch: true, semester: true },
    });
  },

  async deleteResource(id: string) {
    const existing = await prisma.preparationResource.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Preparation resource not found.');
    }
    await prisma.preparationResource.delete({ where: { id } });
    return { message: 'Preparation resource deleted successfully.' };
  },

  async incrementUpvote(id: string) {
    return prisma.preparationResource.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
      include: { branch: true, semester: true },
    });
  },

  async incrementDownload(id: string) {
    return prisma.preparationResource.update({
      where: { id },
      data: { downloads: { increment: 1 } },
      include: { branch: true, semester: true },
    });
  },

  async submitResourceRequest(
    userId: string,
    input: { branch: BranchCode; title: string; subject: string; topic?: string; notes?: string }
  ) {
    const branch = await prisma.branch.findUnique({ where: { code: input.branch } });
    if (!branch) {
      throw new NotFoundError('Branch not found.');
    }

    return prisma.resourceRequest.create({
      data: {
        userId,
        branchId: branch.id,
        title: input.title,
        subject: input.subject,
        topic: input.topic || null,
        notes: input.notes || null,
      },
      include: { branch: true },
    });
  },
};
