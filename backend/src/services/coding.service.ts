// src/services/coding.service.ts
import { Difficulty, Prisma, SubmissionStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { serviceStatus } from '../config/env';
import { BadRequestError, NotFoundError } from '../utils/errors';
import {
  codeExecutionService,
  ExecutionVerdict,
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
      available: serviceStatus.hasOnlineCompiler,
    }));
  },

  async listProblems(
    userId: string | undefined,
    filters: {
      difficulty?: Difficulty;
      topic?: string;
      company?: string;
      search?: string;
    }
  ) {
    const where: Prisma.CodingProblemWhereInput = {};

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
      ];
    }

    const problems = await prisma.codingProblem.findMany({
      where,
      orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
      include: {
        company: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!userId) {
      return problems.map((p) => ({ ...p, solved: false, isBookmarked: false }));
    }

    const [acceptedSubmissions, bookmarks] = await Promise.all([
      prisma.codingSubmission.findMany({
        where: { userId, status: SubmissionStatus.ACCEPTED },
        select: { problemId: true },
        distinct: ['problemId'],
      }),
      prisma.bookmark.findMany({
        where: { userId, codingProblemId: { not: null } },
        select: { codingProblemId: true },
      }),
    ]);

    const solvedSet = new Set(acceptedSubmissions.map((s) => s.problemId));
    const bookmarkedSet = new Set(bookmarks.map((b) => b.codingProblemId!));

    return problems.map((p) => ({
      ...p,
      solved: solvedSet.has(p.id),
      isBookmarked: bookmarkedSet.has(p.id),
    }));
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

    return submission;
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
