// src/services/coding.service.ts
import { Difficulty, Prisma, SubmissionStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { serviceStatus } from '../config/env';
import { BadRequestError, NotFoundError } from '../utils/errors';
import {
  codeExecutionService,
  ExecutionVerdict,
  JUDGE0_LANGUAGE_IDS,
  ONLINECOMPILER_COMPILERS,
  SupportedLanguage,
} from './codeExecution.service';

export type { SupportedLanguage };

interface ProblemTestCase {
  input: string;
  expectedOutput: string;
}

function normalizeOutput(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

function mapVerdictToSubmissionStatus(
  verdict: ExecutionVerdict,
  outputMatched: boolean
): SubmissionStatus {
  switch (verdict) {
    case 'EXECUTED':
      return outputMatched ? SubmissionStatus.ACCEPTED : SubmissionStatus.WRONG_ANSWER;
    case 'COMPILATION_ERROR':
      return SubmissionStatus.COMPILATION_ERROR;
    case 'TIME_LIMIT_EXCEEDED':
      return SubmissionStatus.TIME_LIMIT_EXCEEDED;
    case 'MEMORY_LIMIT_EXCEEDED':
      return SubmissionStatus.MEMORY_LIMIT_EXCEEDED;
    case 'RUNTIME_ERROR':
    default:
      return SubmissionStatus.RUNTIME_ERROR;
  }
}

export const codingService = {
  getSupportedLanguages() {
    return Object.entries(ONLINECOMPILER_COMPILERS).map(([key, compilerId]) => ({
      id: key,
      compilerId,
      judge0LangId: JUDGE0_LANGUAGE_IDS[key as SupportedLanguage],
      available: serviceStatus.hasOnlineCompiler || serviceStatus.hasJudge0,
    }));
  },

  async listProblems(
    userId: string | undefined,
    filters: {
      collection?: 'STRIVER_A2Z' | 'CP_31' | 'ALL';
      difficulty?: Difficulty;
      topic?: string;
      company?: string;
      rating?: number;
      status?: 'all' | 'solved' | 'unsolved';
      search?: string;
    }
  ) {
    const where: Prisma.CodingProblemWhereInput = {};

    if (filters.collection && filters.collection !== 'ALL') {
      where.collection = filters.collection;
    }
    if (filters.rating) {
      where.rating = filters.rating;
    }
    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }
    if (filters.topic && filters.topic !== 'All') {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }
    if (filters.company && filters.company !== 'All') {
      where.company = {
        OR: [
          { name: { equals: filters.company, mode: 'insensitive' } },
          { slug: { equals: filters.company, mode: 'insensitive' } },
        ],
      };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { topic: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { problemIdentifier: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [allProblems, acceptedSubmissions, userProgressList, bookmarks] = await Promise.all([
      prisma.codingProblem.findMany({
        where,
        orderBy: [{ orderIndex: 'asc' }, { difficulty: 'asc' }, { createdAt: 'asc' }],
        include: {
          company: { select: { id: true, name: true, slug: true } },
        },
      }),
      userId
        ? prisma.codingSubmission.findMany({
            where: { userId, status: SubmissionStatus.ACCEPTED },
            select: { problemId: true },
            distinct: ['problemId'],
          })
        : Promise.resolve([]),
      userId
        ? prisma.userCodingProgress.findMany({
            where: { userId },
          })
        : Promise.resolve([]),
      userId
        ? prisma.bookmark.findMany({
            where: { userId, codingProblemId: { not: null } },
            select: { codingProblemId: true },
          })
        : Promise.resolve([]),
    ]);

    const solvedSet = new Set([
      ...acceptedSubmissions.map((s) => s.problemId),
      ...userProgressList.filter((p) => p.status === 'SOLVED').map((p) => p.problemId),
    ]);
    const progressMap = new Map(userProgressList.map((p) => [p.problemId, p]));
    const bookmarkedSet = new Set(bookmarks.map((b) => b.codingProblemId!));

    let mapped = allProblems.map((p) => ({
      ...p,
      solved: solvedSet.has(p.id),
      isBookmarked: bookmarkedSet.has(p.id),
      progress: progressMap.get(p.id) || null,
    }));

    if (filters.status === 'solved') {
      mapped = mapped.filter((p) => p.solved);
    } else if (filters.status === 'unsolved') {
      mapped = mapped.filter((p) => !p.solved);
    }

    const striverProblems = mapped.filter((p) => p.collection === 'STRIVER_A2Z');
    const cp31Problems = mapped.filter((p) => p.collection === 'CP_31');

    return {
      problems: mapped,
      stats: {
        total: mapped.length,
        solved: mapped.filter((p) => p.solved).length,
        striverTotal: striverProblems.length,
        striverSolved: striverProblems.filter((p) => p.solved).length,
        cp31Total: cp31Problems.length,
        cp31Solved: cp31Problems.filter((p) => p.solved).length,
      },
    };
  },

  async getProblemById(problemId: string, userId?: string) {
    const problem = await prisma.codingProblem.findUnique({
      where: { id: problemId },
      include: {
        company: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!problem) {
      throw new NotFoundError('Coding problem not found.');
    }

    if (!userId) {
      return { ...problem, solved: false, isBookmarked: false, recentSubmissions: [] };
    }

    const [submissions, bookmark] = await Promise.all([
      prisma.codingSubmission.findMany({
        where: { userId, problemId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.bookmark.findFirst({
        where: { userId, codingProblemId: problemId },
      }),
    ]);

    return {
      ...problem,
      solved: submissions.some((s) => s.status === SubmissionStatus.ACCEPTED),
      isBookmarked: Boolean(bookmark),
      recentSubmissions: submissions,
    };
  },

  async runSampleTests(
    problemId: string,
    language: SupportedLanguage,
    sourceCode: string,
    customInput?: string
  ) {
    const problem = await prisma.codingProblem.findUnique({ where: { id: problemId } });
    if (!problem) {
      throw new NotFoundError('Coding problem not found.');
    }

    codeExecutionService.getCompilerId(language);

    const testCases = Array.isArray(problem.testCases)
      ? (problem.testCases as unknown as ProblemTestCase[])
      : [];

    if (customInput !== undefined && customInput.trim().length > 0) {
      const result = await codeExecutionService.executeCode({
        language,
        sourceCode,
        stdin: customInput,
        timeLimitSec: Math.ceil(problem.timeLimitMs / 1000),
        memoryLimitKb: problem.memoryLimitKb,
      });

      return {
        mode: 'custom',
        status: result.statusLabel,
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        runtimeMs: result.runtimeMs,
        memoryKb: result.memoryKb,
      };
    }

    const sampleCase = testCases[0];
    if (!sampleCase) {
      throw new BadRequestError('No sample test cases configured for this problem.');
    }

    const result = await codeExecutionService.executeCode({
      language,
      sourceCode,
      stdin: sampleCase.input,
      timeLimitSec: Math.ceil(problem.timeLimitMs / 1000),
      memoryLimitKb: problem.memoryLimitKb,
    });

    const outputMatched =
      normalizeOutput(result.stdout) === normalizeOutput(sampleCase.expectedOutput);
    const passed = result.verdict === 'EXECUTED' && outputMatched;
    const status =
      result.verdict === 'EXECUTED'
        ? passed
          ? 'Accepted'
          : 'Wrong Answer'
        : result.statusLabel;

    return {
      mode: 'sample',
      passed,
      status,
      stdout: result.stdout,
      expectedOutput: sampleCase.expectedOutput,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      runtimeMs: result.runtimeMs,
      memoryKb: result.memoryKb,
    };
  },

  async submitSolution(
    userId: string,
    problemId: string,
    language: SupportedLanguage,
    sourceCode: string
  ) {
    const problem = await prisma.codingProblem.findUnique({ where: { id: problemId } });
    if (!problem) {
      throw new NotFoundError('Coding problem not found.');
    }

    const compilerId = codeExecutionService.getCompilerId(language);

    const testCases = Array.isArray(problem.testCases)
      ? (problem.testCases as unknown as ProblemTestCase[])
      : [];

    if (testCases.length === 0) {
      throw new BadRequestError('No evaluation test cases exist for this problem.');
    }

    let passedCount = 0;
    let finalStatus: SubmissionStatus = SubmissionStatus.ACCEPTED;
    let maxRuntimeMs = 0;
    let maxMemoryKb = 0;
    let lastStdout = '';
    let lastStderr = '';
    let lastCompileOutput = '';

    for (const tc of testCases) {
      const exec = await codeExecutionService.executeCode({
        language,
        sourceCode,
        stdin: tc.input,
        timeLimitSec: Math.ceil(problem.timeLimitMs / 1000),
        memoryLimitKb: problem.memoryLimitKb,
      });

      lastStdout = exec.stdout;
      lastStderr = exec.stderr;
      lastCompileOutput = exec.compileOutput;

      if (exec.runtimeMs !== null && exec.runtimeMs > maxRuntimeMs) {
        maxRuntimeMs = exec.runtimeMs;
      }
      if (exec.memoryKb !== null && exec.memoryKb > maxMemoryKb) {
        maxMemoryKb = exec.memoryKb;
      }

      const outputMatched =
        normalizeOutput(exec.stdout) === normalizeOutput(tc.expectedOutput);
      const caseStatus = mapVerdictToSubmissionStatus(exec.verdict, outputMatched);

      if (caseStatus === SubmissionStatus.ACCEPTED) {
        passedCount += 1;
      } else {
        finalStatus = caseStatus;
        break;
      }
    }

    const submission = await prisma.codingSubmission.create({
      data: {
        userId,
        problemId: problem.id,
        language,
        compilerId,
        judge0LangId: JUDGE0_LANGUAGE_IDS[language],
        sourceCode,
        stdout: lastStdout,
        stderr: lastStderr,
        compileOutput: lastCompileOutput,
        status: finalStatus,
        runtimeMs: Number(maxRuntimeMs.toFixed(2)),
        memoryKb: maxMemoryKb || null,
        passedCount,
        totalCount: testCases.length,
      },
      include: {
        problem: { select: { id: true, title: true, slug: true, difficulty: true } },
      },
    });

    try {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (userExists) {
        const isAccepted = finalStatus === SubmissionStatus.ACCEPTED;
        await prisma.userCodingProgress.upsert({
          where: { userId_problemId: { userId, problemId: problem.id } },
          update: {
            ...(isAccepted ? { status: 'SOLVED', solvedAt: new Date() } : {}),
            lastLanguage: language,
            lastAttemptAt: new Date(),
          },
          create: {
            userId,
            problemId: problem.id,
            status: isAccepted ? 'SOLVED' : 'ATTEMPTED',
            solvedAt: isAccepted ? new Date() : null,
            lastLanguage: language,
          },
        });
      }
    } catch {
      // Non-blocking progress update
    }

    return submission;
  },

  async saveUserProgress(
    userId: string,
    problemId: string,
    input: {
      status?: 'ATTEMPTED' | 'SOLVED';
      codeDrafts?: Record<string, string>;
      lastLanguage?: string;
      notes?: string;
    }
  ) {
    const existing = await prisma.userCodingProgress.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });

    const status = input.status || existing?.status || 'ATTEMPTED';
    const mergedDrafts = {
      ...((existing?.codeDrafts as Record<string, string>) || {}),
      ...(input.codeDrafts || {}),
    };

    return prisma.userCodingProgress.upsert({
      where: { userId_problemId: { userId, problemId } },
      update: {
        status,
        codeDrafts: mergedDrafts,
        ...(input.lastLanguage ? { lastLanguage: input.lastLanguage } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(status === 'SOLVED' && !existing?.solvedAt ? { solvedAt: new Date() } : {}),
        lastAttemptAt: new Date(),
      },
      create: {
        userId,
        problemId,
        status,
        codeDrafts: input.codeDrafts || {},
        lastLanguage: input.lastLanguage || 'cpp',
        notes: input.notes,
        solvedAt: status === 'SOLVED' ? new Date() : null,
      },
    });
  },

  async toggleProblemSolved(userId: string, problemId: string, solved?: boolean) {
    const existing = await prisma.userCodingProgress.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });

    const shouldBeSolved = solved !== undefined ? solved : existing?.status !== 'SOLVED';
    const status = shouldBeSolved ? 'SOLVED' : 'ATTEMPTED';

    return prisma.userCodingProgress.upsert({
      where: { userId_problemId: { userId, problemId } },
      update: {
        status,
        solvedAt: shouldBeSolved ? (existing?.solvedAt || new Date()) : null,
      },
      create: {
        userId,
        problemId,
        status,
        solvedAt: shouldBeSolved ? new Date() : null,
      },
    });
  },

  async getUserProgress(userId: string, problemId: string) {
    return prisma.userCodingProgress.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });
  },

  async listUserSubmissions(userId: string, problemId?: string) {
    return prisma.codingSubmission.findMany({
      where: {
        userId,
        ...(problemId ? { problemId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        problem: {
          select: { id: true, title: true, slug: true, difficulty: true, topic: true },
        },
      },
    });
  },
};
