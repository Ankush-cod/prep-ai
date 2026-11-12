// src/services/companyQuestion.service.ts
import { Difficulty, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export const companyQuestionService = {
  async listCompanies() {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { companyQuestions: true, codingProblems: true },
        },
      },
    });
    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      industry: c.industry,
      description: c.description,
      questionCount: c._count.companyQuestions,
      codingProblemCount: c._count.codingProblems,
    }));
  },

  async listQuestions(
    userId: string | undefined,
    filters: {
      company?: string;
      topic?: string;
      difficulty?: Difficulty;
      search?: string;
    }
  ) {
    const where: Prisma.CompanyQuestionWhereInput = {};

    if (filters.company && filters.company !== 'All') {
      where.company = {
        OR: [
          { name: { equals: filters.company, mode: 'insensitive' } },
          { slug: { equals: filters.company, mode: 'insensitive' } },
        ],
      };
    }
    if (filters.topic && filters.topic !== 'All') {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }
    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { questionText: { contains: filters.search, mode: 'insensitive' } },
        { topic: { contains: filters.search, mode: 'insensitive' } },
        { company: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const questions = await prisma.companyQuestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!userId) {
      return questions.map((q) => ({ ...q, isBookmarked: false }));
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId, companyQuestionId: { not: null } },
      select: { companyQuestionId: true },
    });
    const bookmarkedSet = new Set(bookmarks.map((b) => b.companyQuestionId!));

    return questions.map((q) => ({
      ...q,
      isBookmarked: bookmarkedSet.has(q.id),
    }));
  },

  async getQuestionById(id: string, userId?: string) {
    const question = await prisma.companyQuestion.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!question) {
      throw new NotFoundError('Company question not found.');
    }

    let isBookmarked = false;
    if (userId) {
      const bm = await prisma.bookmark.findFirst({
        where: { userId, companyQuestionId: id },
      });
      isBookmarked = Boolean(bm);
    }

    return { ...question, isBookmarked };
  },

  async createQuestion(input: {
    companyName: string;
    role: string;
    title: string;
    questionText: string;
    topic: string;
    difficulty: Difficulty;
    tags?: string[];
    frequency?: string;
    lastAsked?: string;
    provenance?: string;
    solutionSummary: string;
    keyConcepts?: string[];
    acceptanceRate?: string;
  }) {
    const slug = input.companyName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    const company = await prisma.company.upsert({
      where: { slug },
      update: {},
      create: {
        name: input.companyName.trim(),
        slug,
      },
    });

    return prisma.companyQuestion.create({
      data: {
        companyId: company.id,
        role: input.role,
        title: input.title,
        questionText: input.questionText,
        topic: input.topic,
        difficulty: input.difficulty,
        tags: input.tags || [],
        frequency: input.frequency || 'High',
        lastAsked: input.lastAsked || null,
        provenance: input.provenance || 'Verified Historical',
        solutionSummary: input.solutionSummary,
        keyConcepts: input.keyConcepts || [],
        acceptanceRate: input.acceptanceRate || null,
      },
      include: { company: true },
    });
  },

  async updateQuestion(id: string, data: Record<string, unknown>) {
    const existing = await prisma.companyQuestion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Company question not found.');
    }

    const updatePayload: Prisma.CompanyQuestionUpdateInput = {};
    if (typeof data.role === 'string') updatePayload.role = data.role;
    if (typeof data.title === 'string') updatePayload.title = data.title;
    if (typeof data.questionText === 'string') updatePayload.questionText = data.questionText;
    if (typeof data.topic === 'string') updatePayload.topic = data.topic;
    if (typeof data.difficulty === 'string') updatePayload.difficulty = data.difficulty as Difficulty;
    if (Array.isArray(data.tags)) updatePayload.tags = data.tags as string[];
    if (typeof data.frequency === 'string') updatePayload.frequency = data.frequency;
    if (typeof data.solutionSummary === 'string') updatePayload.solutionSummary = data.solutionSummary;
    if (Array.isArray(data.keyConcepts)) updatePayload.keyConcepts = data.keyConcepts as string[];

    return prisma.companyQuestion.update({
      where: { id },
      data: updatePayload,
      include: { company: true },
    });
  },

  async deleteQuestion(id: string) {
    const existing = await prisma.companyQuestion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Company question not found.');
    }
    await prisma.companyQuestion.delete({ where: { id } });
    return { message: 'Company question deleted successfully.' };
  },
};
