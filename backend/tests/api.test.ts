import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { UserRole } from '@prisma/client';
import { prisma } from '../src/config/database';
import app from '../src/app';
import { comparePassword, hashPassword } from '../src/utils/password';
import { hashToken, signAccessToken, verifyAccessToken } from '../src/utils/jwt';
import {
  answerEvaluationSchema,
  extractAndParseJson,
} from '../src/services/ai/aiProvider';
import { openaiProvider } from '../src/services/ai/openaiProvider';
import { getMailTransporter, verifyMailTransporter } from '../src/config/email';
import { env, serviceStatus } from '../src/config/env';

describe('PrepAI Backend Core Security, Validation & API Tests', () => {
  beforeAll(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/health returns service status and integration flags', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('prepai-backend');
    expect(res.body.integrations).toHaveProperty('hasGemini');
    expect(res.body.integrations).toHaveProperty('hasOnlineCompiler');
  });

  it('hashes and verifies passwords with bcrypt safely', async () => {
    const hash = await hashPassword('StrongPass123');
    expect(hash).not.toBe('StrongPass123');
    expect(await comparePassword('StrongPass123', hash)).toBe(true);
    expect(await comparePassword('WrongPass123', hash)).toBe(false);
  });

  it('signs and verifies access JWTs and SHA-256 token hashes', () => {
    const token = signAccessToken({
      userId: 'user_123',
      email: 'student@college.edu',
      role: UserRole.USER,
    });
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe('user_123');
    expect(decoded.role).toBe(UserRole.USER);
    expect(hashToken('sample-token')).toHaveLength(64);
  });

  it('rejects invalid registration payload via Zod validation', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'A',
      email: 'not-an-email',
      password: 'weak',
      branch: 'INVALID',
      academicYear: 9,
      semester: 12,
      institution: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('blocks unauthenticated requests to protected routes with 401', async () => {
    const endpoints = [
      { method: 'get' as const, path: '/api/auth/me' },
      { method: 'get' as const, path: '/api/dashboard' },
      { method: 'get' as const, path: '/api/analytics' },
      { method: 'get' as const, path: '/api/bookmarks' },
      { method: 'get' as const, path: '/api/interviews/sessions' },
      { method: 'get' as const, path: '/api/profile' },
      { method: 'get' as const, path: '/api/admin/overview' },
    ];

    for (const ep of endpoints) {
      const res = await request(app)[ep.method](ep.path);
      expect(res.status).toBe(401);
    }
  });

  it('forbids normal USER accounts from accessing ADMIN routes with 403', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'usr_student',
      email: 'student@uni.edu',
      role: UserRole.USER,
      isActive: true,
    } as never);

    const studentToken = signAccessToken({
      userId: 'usr_student',
      email: 'student@uni.edu',
      role: UserRole.USER,
    });

    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('allows ADMIN accounts through authorization middleware to admin overview', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'usr_admin',
      email: 'admin@uni.edu',
      role: UserRole.ADMIN,
      isActive: true,
    } as never);
    vi.spyOn(prisma.user, 'count').mockResolvedValue(0);
    vi.spyOn(prisma.interviewSession, 'count').mockResolvedValue(0);
    vi.spyOn(prisma.preparationResource, 'count').mockResolvedValue(0);
    vi.spyOn(prisma.codingProblem, 'count').mockResolvedValue(0);
    vi.spyOn(prisma.companyQuestion, 'count').mockResolvedValue(0);
    vi.spyOn(prisma.resourceRequest, 'count').mockResolvedValue(0);
    vi.spyOn(prisma.aiReviewFlag, 'count').mockResolvedValue(0);
    vi.spyOn(prisma.user, 'findMany').mockResolvedValueOnce([]);

    const adminToken = signAccessToken({
      userId: 'usr_admin',
      email: 'admin@uni.edu',
      role: UserRole.ADMIN,
    });

    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics).toBeDefined();
  });

  it('parses fenced AI JSON payloads and rejects malformed evaluations', () => {
    const valid = extractAndParseJson(
      '```json\n{"technicalScore":85,"conceptualScore":82,"clarityScore":88,"communicationScore":84,"completenessScore":80,"problemSolvingScore":86,"overallScore":84.2,"strengths":["Clear tradeoffs"],"weaknesses":["Edge cases"],"missingConcepts":["Backpressure"],"examinerFeedback":"Solid systems response with minor omissions.","followUpQuestion":null}\n```',
      answerEvaluationSchema
    );
    expect(valid.overallScore).toBe(84.2);

    expect(() =>
      extractAndParseJson('{"technicalScore": 150}', answerEvaluationSchema)
    ).toThrow();
  });

  it('returns null from OpenAI report polisher when OPENAI_API_KEY is not configured', async () => {
    const result = await openaiProvider.polishInterviewReport({
      branch: 'CSE',
      semester: 5,
      interviewType: 'TECHNICAL',
      difficulty: 'Medium',
      topic: 'Operating Systems',
      overallScore: 78,
      evaluations: [],
    });
    expect(result).toBeNull();
  });

  it('refuses code execution safely with 503 when code execution engines are unconfigured', async () => {
    const origOnline = serviceStatus.hasOnlineCompiler;
    const origJudge0 = serviceStatus.hasJudge0;
    serviceStatus.hasOnlineCompiler = false;
    serviceStatus.hasJudge0 = false;

    try {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'usr_student',
        email: 'student@uni.edu',
        role: UserRole.USER,
        isActive: true,
      } as never);
      vi.spyOn(prisma.codingProblem, 'findUnique').mockResolvedValueOnce({
        id: 'prob_1',
        timeLimitMs: 2000,
        memoryLimitKb: 262144,
        testCases: [{ input: '1', expectedOutput: '1' }],
      } as never);

      const studentToken = signAccessToken({
        userId: 'usr_student',
        email: 'student@uni.edu',
        role: UserRole.USER,
      });

      const res = await request(app)
        .post('/api/coding/problems/prob_1/run')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          language: 'python',
          sourceCode: 'print(input())',
        });

      expect(res.status).toBe(503);
      expect(res.body.code).toBe('SERVICE_UNAVAILABLE');
    } finally {
      serviceStatus.hasOnlineCompiler = origOnline;
      serviceStatus.hasJudge0 = origJudge0;
    }
  });

  it('verifyMailTransporter logs sanitized 535 auth error without leaking SMTP_PASSWORD', async () => {
    const origHasSmtp = serviceStatus.hasSmtp;
    const origPass = env.smtpPassword;
    serviceStatus.hasSmtp = true;
    env.smtpPassword = 'super-secret-smtp-password';

    const transporter = getMailTransporter();
    expect(transporter).not.toBeNull();
    const verifySpy = vi
      .spyOn(transporter!, 'verify')
      .mockRejectedValueOnce(
        Object.assign(new Error('Invalid login: 535-5.7.8 Username and Password not accepted'), {
          code: 'EAUTH',
          responseCode: 535,
        })
      );
    const errLogSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ok = await verifyMailTransporter();
    expect(ok).toBe(false);
    expect(verifySpy).toHaveBeenCalledTimes(1);
    const logged = errLogSpy.mock.calls.flat().join(' ');
    expect(logged).toContain('535');
    expect(logged).not.toContain('super-secret-smtp-password');

    errLogSpy.mockRestore();
    serviceStatus.hasSmtp = origHasSmtp;
    env.smtpPassword = origPass;
  });

  it('POST /api/auth/forgot-password reports meaningful 503 error when SMTP rejects credentials', async () => {
    const origHasSmtp = serviceStatus.hasSmtp;
    const origPass = env.smtpPassword;
    serviceStatus.hasSmtp = true;
    env.smtpPassword = 'super-secret-smtp-password';

    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'usr_student',
      email: 'student@uni.edu',
      isActive: true,
      profile: { fullName: 'Student User' },
    } as never);
    vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([] as never);

    const transporter = getMailTransporter();
    expect(transporter).not.toBeNull();
    vi.spyOn(transporter!, 'sendMail').mockRejectedValueOnce(
      Object.assign(new Error('Invalid login: 535-5.7.8'), {
        code: 'EAUTH',
        responseCode: 535,
      })
    );
    const errLogSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'student@uni.edu' });

    expect(res.status).toBe(503);
    expect(res.body.code).toBe('SERVICE_UNAVAILABLE');
    expect(res.body.message).toContain('SMTP authentication failed (535)');
    expect(JSON.stringify(res.body)).not.toContain('super-secret-smtp-password');

    errLogSpy.mockRestore();
    serviceStatus.hasSmtp = origHasSmtp;
    env.smtpPassword = origPass;
  });
});
