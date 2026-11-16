import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InterviewStatus, InterviewType, UserRole } from '@prisma/client';
import app from '../src/app';
import { prisma } from '../src/config/database';
import { signAccessToken } from '../src/utils/jwt';
import { geminiProvider } from '../src/services/ai/geminiProvider';

const studentToken = signAccessToken({
  userId: 'usr_student_interview',
  email: 'student@nitb.ac.in',
  role: UserRole.USER,
});

function mockAuth() {
  vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
    id: 'usr_student_interview',
    email: 'student@nitb.ac.in',
    role: UserRole.USER,
    isActive: true,
  } as never);
  vi.spyOn(prisma.branch, 'findUnique').mockResolvedValue({
    id: 'br_default',
    code: 'CSE',
    name: 'Computer Science',
  } as never);
  vi.spyOn(prisma.semester, 'findUnique').mockResolvedValue({
    id: 'sem_default',
    number: 5,
  } as never);
}

describe('Technical Mock Interview Session Initialization & AI Orchestration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockAuth();
  });

  it('rejects missing branch with a descriptive validation error instead of generic "Required"', async () => {
    const res = await request(app)
      .post('/api/interviews/sessions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        semester: 6,
        interviewType: 'TECHNICAL',
        difficulty: 'Medium',
        topic: 'Operating Systems & Concurrency',
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('BAD_REQUEST');
    expect(res.body.message).not.toBe('Required');
    expect(res.body.message).toMatch(/branch/i);
    expect(res.body.errors).toHaveProperty('branch');
    expect(res.body.errors.branch).not.toBe('Required');
  });

  it('initializes a Technical Deep-Dive interview for CSE with Gemini questions', async () => {
    const mockQuestions = [
      {
        prompt: 'Explain the difference between a process and a thread in Linux.',
        topic: 'Operating Systems',
        expectedConcepts: ['Virtual address space', 'Context switching overhead', 'Shared heap vs private stack'],
        hint: 'Think about memory spaces and scheduling units.',
      },
      {
        prompt: 'How does an inverted page table optimize memory compared to multi-level paging?',
        topic: 'Virtual Memory',
        expectedConcepts: ['Frame index mapping', 'Hash table lookup', 'Physical vs virtual ratio'],
        hint: 'Consider the size of physical memory versus 64-bit virtual memory.',
      },
    ];

    vi.spyOn(geminiProvider, 'generateInitialQuestions').mockResolvedValue(mockQuestions);
    vi.spyOn(prisma.branch, 'findUnique').mockResolvedValue({ id: 'br_cse', code: 'CSE', name: 'Computer Science' } as never);
    vi.spyOn(prisma.semester, 'findUnique').mockResolvedValue({ id: 'sem_6', number: 6 } as never);

    const mockCreatedSession = {
      id: 'sess_cse_os_1',
      userId: 'usr_student_interview',
      title: 'Google — Operating Systems (CSE)',
      companyName: 'Google',
      interviewType: InterviewType.TECHNICAL,
      difficulty: 'Medium',
      topic: 'Operating Systems & Concurrency',
      questionCount: 4,
      durationMinutes: 45,
      status: InterviewStatus.IN_PROGRESS,
      branchId: 'br_cse',
      semesterId: 'sem_6',
      resumeId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      branch: { code: 'CSE', name: 'Computer Science' },
      semester: { number: 6, label: 'Semester 6' },
      questions: mockQuestions.map((q, idx) => ({
        id: `q_${idx + 1}`,
        sessionId: 'sess_cse_os_1',
        orderIndex: idx + 1,
        prompt: q.prompt,
        topic: q.topic,
        expectedConcepts: q.expectedConcepts,
        hint: q.hint,
        isFollowUp: false,
        answer: null,
      })),
    };

    vi.spyOn(prisma.interviewSession, 'create').mockResolvedValue(mockCreatedSession as never);

    const res = await request(app)
      .post('/api/interviews/sessions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        branch: 'CSE',
        semester: 6,
        interviewType: 'TECHNICAL',
        difficulty: 'Medium',
        topic: 'Operating Systems & Concurrency',
        companyName: 'Google',
        questionCount: 4,
        durationMinutes: 45,
      });

    expect(res.status).toBe(201);
    expect(res.body.session).toHaveProperty('id', 'sess_cse_os_1');
    expect(res.body.session.interviewType).toBe('TECHNICAL');
    expect(res.body.session.questions).toHaveLength(2);
    expect(res.body.session.questions[0].prompt).toContain('process and a thread');
  });

  it('initializes a System Design Architecture interview for ECE with fallback defaults', async () => {
    const mockQuestions = [
      {
        prompt: 'Design a clock domain crossing (CDC) synchronizer for a multi-gigabit transceiver interface.',
        topic: 'Digital VLSI',
        expectedConcepts: ['Metastability window', 'Two-flop synchronizer', 'Gray-coded FIFO'],
        hint: 'Examine MTBF and multi-bit signal skew.',
      },
    ];

    vi.spyOn(geminiProvider, 'generateInitialQuestions').mockResolvedValue(mockQuestions);
    vi.spyOn(prisma.branch, 'findUnique').mockResolvedValue({ id: 'br_ece', code: 'ECE', name: 'Electronics' } as never);
    vi.spyOn(prisma.semester, 'findUnique').mockResolvedValue({ id: 'sem_5', number: 5 } as never);

    const mockSession = {
      id: 'sess_ece_sys_1',
      userId: 'usr_student_interview',
      title: 'ECE SYSTEM_DESIGN — Digital VLSI & CDC',
      companyName: null,
      interviewType: InterviewType.SYSTEM_DESIGN,
      difficulty: 'Hard',
      topic: 'Digital VLSI & CDC',
      questionCount: 4,
      durationMinutes: 45,
      status: InterviewStatus.IN_PROGRESS,
      branch: { code: 'ECE', name: 'Electronics' },
      questions: mockQuestions.map((q, idx) => ({
        id: `q_${idx + 1}`,
        sessionId: 'sess_ece_sys_1',
        orderIndex: idx + 1,
        prompt: q.prompt,
        topic: q.topic,
        expectedConcepts: q.expectedConcepts,
        hint: q.hint,
        isFollowUp: false,
        answer: null,
      })),
    };

    vi.spyOn(prisma.interviewSession, 'create').mockResolvedValue(mockSession as never);

    const res = await request(app)
      .post('/api/interviews/sessions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        branch: 'ECE',
        semester: 5,
        interviewType: 'SYSTEM_DESIGN',
        difficulty: 'Hard',
        topic: 'Digital VLSI & CDC',
      });

    expect(res.status).toBe(201);
    expect(res.body.session.interviewType).toBe('SYSTEM_DESIGN');
    expect(res.body.session.questions[0].topic).toBe('Digital VLSI');
  });

  it('handles Electrical (EE) and Mechanical (ME) disciplines cleanly', async () => {
    vi.spyOn(geminiProvider, 'generateInitialQuestions').mockResolvedValue([
      {
        prompt: 'Explain the Field-Oriented Control (FOC) algorithm for PMSM motors.',
        topic: 'Power Electronics & Drives',
        expectedConcepts: ['Clarke and Park transforms', 'PI current loops', 'SVPWM'],
        hint: 'Transform 3-phase AC into dq-coordinates.',
      },
    ]);

    vi.spyOn(prisma.interviewSession, 'create').mockResolvedValue({
      id: 'sess_ee_1',
      interviewType: InterviewType.TECHNICAL,
      topic: 'Power Electronics & Drives',
      questions: [{ id: 'q1', prompt: 'FOC algorithm' }],
    } as never);

    const res = await request(app)
      .post('/api/interviews/sessions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        branch: 'EE',
        semester: 7,
        interviewType: 'TECHNICAL',
        difficulty: 'Medium',
        topic: 'Power Electronics & Drives',
      });

    expect(res.status).toBe(201);
    expect(res.body.session.topic).toBe('Power Electronics & Drives');
  });

  it('handles resume-contextualized interviews when a valid resume is provided', async () => {
    vi.spyOn(prisma.resume, 'findUnique').mockResolvedValue({
      id: 'res_sample_123',
      userId: 'usr_student_interview',
      analysis: {
        summary: 'Undergrad engineer with distributed systems and Redis caching experience.',
        skills: ['Go', 'Docker', 'Redis', 'PostgreSQL'],
        projects: [{ name: 'Distributed Rate Limiter', tech: 'Go, Redis' }],
      },
    } as never);

    const generateSpy = vi.spyOn(geminiProvider, 'generateInitialQuestions').mockResolvedValue([
      {
        prompt: 'In your Distributed Rate Limiter project, how did you handle sliding window counters across multiple Redis nodes?',
        topic: 'Resume Probes / Distributed Systems',
        expectedConcepts: ['Sliding window log', 'Lua atomic script', 'Clock drift'],
        hint: 'Discuss atomic execution in Redis.',
      },
    ]);

    vi.spyOn(prisma.interviewSession, 'create').mockResolvedValue({
      id: 'sess_resume_1',
      interviewType: InterviewType.TECHNICAL,
      resumeId: 'res_sample_123',
      questions: [{ id: 'q1', prompt: 'In your Distributed Rate Limiter...' }],
    } as never);

    const res = await request(app)
      .post('/api/interviews/sessions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        branch: 'CSE',
        semester: 6,
        interviewType: 'TECHNICAL',
        difficulty: 'Hard',
        topic: 'Distributed Systems',
        resumeId: 'res_sample_123',
      });

    expect(res.status).toBe(201);
    expect(generateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        resumeSummary: expect.stringContaining('distributed systems'),
      })
    );
  });

  it('returns 503 Service Unavailable when Gemini AI service fails or times out', async () => {
    vi.spyOn(geminiProvider, 'generateInitialQuestions').mockRejectedValue(
      new Error('Gemini model quota exceeded / timeout')
    );

    const res = await request(app)
      .post('/api/interviews/sessions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        branch: 'CSE',
        semester: 5,
        interviewType: 'TECHNICAL',
        difficulty: 'Medium',
        topic: 'Data Structures & Algorithms',
      });

    expect(res.status).toBe(503);
    expect(res.body.code).toBe('SERVICE_UNAVAILABLE');
    expect(res.body.message).toContain('AI examiner is temporarily unable');
  });

  it('retrieves an active interview session and its initial questions by ID', async () => {
    vi.spyOn(prisma.interviewSession, 'findUnique').mockResolvedValue({
      id: 'sess_lookup_1',
      userId: 'usr_student_interview',
      status: InterviewStatus.IN_PROGRESS,
      questions: [
        {
          id: 'q_1',
          orderIndex: 1,
          prompt: 'What is the time complexity of building a heap from an unordered array?',
          expectedConcepts: ['O(N) proof', 'Sift-down vs sift-up'],
          answer: null,
        },
      ],
    } as never);

    const res = await request(app)
      .get('/api/interviews/sessions/sess_lookup_1')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.session.id).toBe('sess_lookup_1');
    expect(res.body.session.questions).toHaveLength(1);
    expect(res.body.session.questions[0].prompt).toContain('building a heap');
  });
});
