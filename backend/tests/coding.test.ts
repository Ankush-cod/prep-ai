import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SubmissionStatus, UserRole } from '@prisma/client';
import app from '../src/app';
import { prisma } from '../src/config/database';
import { env, serviceStatus } from '../src/config/env';
import { signAccessToken } from '../src/utils/jwt';

const studentToken = signAccessToken({
  userId: 'usr_student',
  email: 'student@uni.edu',
  role: UserRole.USER,
});

const mockProblem = {
  id: 'prob_two_sum',
  timeLimitMs: 2000,
  memoryLimitKb: 262144,
  testCases: [
    { input: '2 7\n', expectedOutput: '9' },
    { input: '10 20\n', expectedOutput: '30' },
    { input: '-5 5\n', expectedOutput: '0' },
  ],
};

function mockAuthUser() {
  vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
    id: 'usr_student',
    email: 'student@uni.edu',
    role: UserRole.USER,
    isActive: true,
  } as never);
}

describe('OnlineCompiler.io Code Execution & Judging Integration', () => {
  const originalHasOnlineCompiler = serviceStatus.hasOnlineCompiler;
  const originalApiKey = env.onlineCompilerApiKey;

  beforeEach(() => {
    vi.restoreAllMocks();
    serviceStatus.hasOnlineCompiler = true;
    env.onlineCompilerApiKey = 'secret-onlinecompiler-key-123';
    mockAuthUser();
  });

  afterEach(() => {
    serviceStatus.hasOnlineCompiler = originalHasOnlineCompiler;
    env.onlineCompilerApiKey = originalApiKey;
    vi.unstubAllGlobals();
  });

  it('GET /api/coding/languages returns OnlineCompiler.io compiler IDs', async () => {
    const res = await request(app).get('/api/coding/languages');
    expect(res.status).toBe(200);
    expect(res.body.languages).toEqual(
      expect.arrayContaining([
        { id: 'cpp', compilerId: 'g++-15', available: true },
        { id: 'python', compilerId: 'python-3.14', available: true },
        { id: 'java', compilerId: 'openjdk-25', available: true },
        { id: 'javascript', compilerId: 'nodejs-24', available: true },
        { id: 'go', compilerId: 'go-1.26', available: true },
      ])
    );
  });

  it('executes sample test successfully and returns normalized stdout/metrics', async () => {
    vi.spyOn(prisma.codingProblem, 'findUnique').mockResolvedValueOnce(mockProblem as never);

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        output: '9\n',
        error: '',
        status: 'success',
        exit_code: 0,
        signal: null,
        truncated: false,
        time: '0.0248',
        memory: '8192',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app)
      .post('/api/coding/problems/prob_two_sum/run')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        language: 'python',
        sourceCode: 'a, b = map(int, input().split())\nprint(a + b)',
      });

    expect(res.status).toBe(200);
    expect(res.body.result).toMatchObject({
      mode: 'sample',
      passed: true,
      status: 'Accepted',
      stdout: '9\n',
      expectedOutput: '9',
      stderr: '',
      compileOutput: '',
      runtimeMs: 24.8,
      memoryKb: 8192,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${env.onlineCompilerApiUrl}/api/run-code-sync/`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'secret-onlinecompiler-key-123',
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('handles compilation errors for compiled languages', async () => {
    vi.spyOn(prisma.codingProblem, 'findUnique').mockResolvedValueOnce(mockProblem as never);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          output: '',
          error: "main.cpp:4:5: error: 'coutt' was not declared in this scope",
          status: 'error',
          exit_code: 1,
          signal: null,
          time: '0.0000',
          memory: '4096',
        }),
      })
    );

    const res = await request(app)
      .post('/api/coding/problems/prob_two_sum/run')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        language: 'cpp',
        sourceCode: '#include <iostream>\nint main(){ std::coutt << 1; }',
      });

    expect(res.status).toBe(200);
    expect(res.body.result.passed).toBe(false);
    expect(res.body.result.status).toBe('Compilation Error');
    expect(res.body.result.compileOutput).toContain('was not declared in this scope');
    expect(res.body.result.stderr).toBe('');
  });

  it('handles runtime errors cleanly', async () => {
    vi.spyOn(prisma.codingProblem, 'findUnique').mockResolvedValueOnce(mockProblem as never);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          output: '',
          error: 'ZeroDivisionError: division by zero',
          status: 'error',
          exit_code: 1,
          signal: null,
          time: '0.015',
          memory: '6144',
        }),
      })
    );

    const res = await request(app)
      .post('/api/coding/problems/prob_two_sum/run')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        language: 'python',
        sourceCode: 'print(1 // 0)',
      });

    expect(res.status).toBe(200);
    expect(res.body.result.passed).toBe(false);
    expect(res.body.result.status).toBe('Runtime Error');
    expect(res.body.result.stderr).toContain('ZeroDivisionError');
  });

  it('detects wrong answers when output does not match expected output', async () => {
    vi.spyOn(prisma.codingProblem, 'findUnique').mockResolvedValueOnce(mockProblem as never);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          output: '42\n',
          error: '',
          status: 'success',
          exit_code: 0,
          signal: null,
          time: '0.012',
          memory: '5120',
        }),
      })
    );

    const res = await request(app)
      .post('/api/coding/problems/prob_two_sum/run')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        language: 'javascript',
        sourceCode: 'console.log(42);',
      });

    expect(res.status).toBe(200);
    expect(res.body.result.passed).toBe(false);
    expect(res.body.result.status).toBe('Wrong Answer');
  });

  it('evaluates multiple test cases on submit and persists ACCEPTED submission', async () => {
    vi.spyOn(prisma.codingProblem, 'findUnique').mockResolvedValueOnce(mockProblem as never);
    const createSpy = vi
      .spyOn(prisma.codingSubmission, 'create')
      .mockImplementationOnce(async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'sub_1',
        ...data,
        createdAt: new Date().toISOString(),
        problem: { id: mockProblem.id, title: 'Two Sum', slug: 'two-sum', difficulty: 'EASY' },
      }) as never);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ output: '9\n', error: '', status: 'success', exit_code: 0, time: '0.010', memory: '4096' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ output: '30\n', error: '', status: 'success', exit_code: 0, time: '0.020', memory: '8192' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ output: '0\n', error: '', status: 'success', exit_code: 0, time: '0.015', memory: '6144' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app)
      .post('/api/coding/problems/prob_two_sum/submit')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        language: 'go',
        sourceCode: 'package main\nfunc main() {}',
      });

    expect(res.status).toBe(201);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          compilerId: 'go-1.26',
          status: SubmissionStatus.ACCEPTED,
          passedCount: 3,
          totalCount: 3,
          runtimeMs: 20,
          memoryKb: 8192,
        }),
      })
    );
  });

  it('stops on failing test case and records TIME_LIMIT_EXCEEDED (exit_code 124)', async () => {
    vi.spyOn(prisma.codingProblem, 'findUnique').mockResolvedValueOnce(mockProblem as never);
    const createSpy = vi
      .spyOn(prisma.codingSubmission, 'create')
      .mockImplementationOnce(async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'sub_2',
        ...data,
        createdAt: new Date().toISOString(),
      }) as never);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ output: '9\n', error: '', status: 'success', exit_code: 0, time: '0.010', memory: '4096' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ output: '', error: '', status: 'timeout', exit_code: 124, time: '2.001', memory: '10240' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app)
      .post('/api/coding/problems/prob_two_sum/submit')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        language: 'python',
        sourceCode: 'while True:\n    pass',
      });

    expect(res.status).toBe(201);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: SubmissionStatus.TIME_LIMIT_EXCEEDED,
          passedCount: 1,
          totalCount: 3,
        }),
      })
    );
  });

  it('rejects unsupported languages with 400 validation error', async () => {
    const res = await request(app)
      .post('/api/coding/problems/prob_two_sum/run')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        language: 'ruby',
        sourceCode: 'puts "hello"',
      });

    expect(res.status).toBe(400);
  });

  it('handles upstream OnlineCompiler.io API failures safely without leaking credentials', async () => {
    vi.spyOn(prisma.codingProblem, 'findUnique').mockResolvedValueOnce(mockProblem as never);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
      })
    );

    const res = await request(app)
      .post('/api/coding/problems/prob_two_sum/run')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        language: 'python',
        sourceCode: 'print(1)',
      });

    expect(res.status).toBe(503);
    expect(res.body.code).toBe('SERVICE_UNAVAILABLE');
    expect(JSON.stringify(res.body)).not.toContain('secret-onlinecompiler-key-123');
  });
});
