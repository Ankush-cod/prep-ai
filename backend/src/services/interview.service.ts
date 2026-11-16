// src/services/interview.service.ts
import { BranchCode, InterviewStatus, InterviewType, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { BadRequestError, ForbiddenError, NotFoundError, ServiceUnavailableError } from '../utils/errors';
import { geminiProvider } from './ai/geminiProvider';
import { openaiProvider } from './ai/openaiProvider';

export interface CreateSessionInput {
  branch: BranchCode;
  semester: number;
  interviewType: InterviewType;
  difficulty: string;
  topic: string;
  companyName?: string | null;
  questionCount: number;
  durationMinutes: number;
  resumeId?: string | null;
  interviewMode?: string | null;
  mode?: 'RESUME_BASED' | 'TOPIC_BASED' | 'COMPREHENSIVE' | string | null;
  categoryDistribution?: {
    dsa?: number;
    projects?: number;
    coreCs?: number;
    programming?: number;
    technologies?: number;
  };
  subjects?: string[];
  topics?: string[];
}

export const interviewService = {
  async createSession(userId: string, input: CreateSessionInput) {
    const branch = await prisma.branch.findUnique({ where: { code: input.branch } });
    const semester = await prisma.semester.findUnique({ where: { number: input.semester } });

    let resumeContext: {
      id: string;
      summary: string | null;
      skills: string[];
      projects: unknown;
    } | null = null;

    if (input.resumeId) {
      const resume = await prisma.resume.findUnique({
        where: { id: input.resumeId },
        include: { analysis: true },
      });
      if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Selected resume was not found.');
      }
      if (resume.analysis) {
        resumeContext = {
          id: resume.id,
          summary: resume.analysis.summary,
          skills: resume.analysis.skills,
          projects: resume.analysis.projects,
        };
      }
    }

    // Generate initial questions with Gemini
    const initialQuestionsCount = Math.max(1, Math.min(input.questionCount, 15));
    let generated;
    try {
      generated = await geminiProvider.generateInitialQuestions({
        branch: input.branch,
        semester: input.semester,
        interviewType: input.interviewType,
        difficulty: input.difficulty,
        topic: input.topic,
        companyName: input.companyName,
        questionCount: initialQuestionsCount,
        resumeSummary: resumeContext?.summary,
        resumeSkills: resumeContext?.skills,
        resumeProjects: resumeContext?.projects,
        mode: input.mode || 'TOPIC_BASED',
        categoryDistribution: input.categoryDistribution,
        subjects: input.subjects,
        topics: input.topics,
      });
    } catch (aiErr) {
      const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
      console.error(`[PrepAI Interview] AI question generation failed: ${msg}`);
      throw new ServiceUnavailableError(
        'AI examiner is temporarily unable to generate initial interview questions. Please try again.'
      );
    }

    if (!generated || generated.length === 0) {
      throw new ServiceUnavailableError(
        'AI examiner did not produce any questions for this session. Please try again.'
      );
    }

    const title = input.companyName
      ? `${input.companyName} — ${input.topic} (${input.branch})`
      : `${input.branch} ${input.interviewType} — ${input.topic}`;

    const session = await prisma.interviewSession.create({
      data: {
        userId,
        branchId: branch?.id || null,
        semesterId: semester?.id || null,
        resumeId: resumeContext?.id || null,
        title,
        companyName: input.companyName || null,
        interviewType: input.interviewType,
        difficulty: input.difficulty,
        topic: input.topic,
        questionCount: input.questionCount,
        durationMinutes: input.durationMinutes,
        status: InterviewStatus.IN_PROGRESS,
        mode: (input.mode as any) || 'TOPIC_BASED',
        questions: {
          create: generated.map((q, idx) => ({
            orderIndex: idx + 1,
            prompt: q.prompt,
            topic: q.topic,
            expectedConcepts: q.expectedConcepts,
            hint: q.hint || null,
            isFollowUp: false,
          })),
        },
      },
      include: {
        branch: true,
        semester: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { answer: true },
        },
        feedback: true,
      },
    });

    return session;
  },

  async listUserSessions(userId: string) {
    return prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        branch: true,
        semester: true,
        feedback: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { answer: true },
        },
      },
    });
  },

  async getSessionById(sessionId: string, userId: string, isAdmin = false) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        branch: true,
        semester: true,
        resume: { include: { analysis: true } },
        feedback: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { answer: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Interview session not found.');
    }
    if (!isAdmin && session.userId !== userId) {
      throw new ForbiddenError('You do not have access to this interview session.');
    }

    return session;
  },

  async submitAnswer(
    sessionId: string,
    userId: string,
    questionId: string,
    answerText: string
  ) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        branch: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { answer: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Interview session not found.');
    }
    if (session.userId !== userId) {
      throw new ForbiddenError('You do not have access to this interview session.');
    }
    if (session.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestError('This interview session is already finalized.');
    }

    const targetQuestion = session.questions.find((q) => q.id === questionId);
    if (!targetQuestion) {
      throw new NotFoundError('Interview question not found in this session.');
    }

    const conversationHistory = session.questions
      .filter((q) => q.answer && q.orderIndex < targetQuestion.orderIndex)
      .map((q) => ({
        question: q.prompt,
        answer: q.answer!.answerText,
      }));

    // Allow follow-up when current question isn't already a follow-up, not an edit, and session hasn't exceeded max total questions
    const maxTotalQuestions = session.questionCount + 2;
    const isEdit = !!targetQuestion.answer;
    const shouldGenerateFollowUp =
      !isEdit && !targetQuestion.isFollowUp && session.questions.length < maxTotalQuestions;

    const evaluation = await geminiProvider.evaluateAnswer({
      branch: session.branch?.code || 'CSE',
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      questionPrompt: targetQuestion.prompt,
      expectedConcepts: targetQuestion.expectedConcepts,
      candidateAnswer: answerText,
      conversationHistory,
      shouldGenerateFollowUp,
    });

    const result = await prisma.$transaction(async (tx) => {
      const savedAnswer = await tx.interviewAnswer.upsert({
        where: { questionId: targetQuestion.id },
        create: {
          questionId: targetQuestion.id,
          answerText,
          technicalScore: evaluation.technicalScore,
          conceptualScore: evaluation.conceptualScore,
          clarityScore: evaluation.clarityScore,
          communicationScore: evaluation.communicationScore,
          completenessScore: evaluation.completenessScore,
          problemSolvingScore: evaluation.problemSolvingScore,
          overallQuestionScore: evaluation.overallScore,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          missingConcepts: evaluation.missingConcepts,
          examinerFeedback: evaluation.examinerFeedback,
        },
        update: {
          answerText,
          technicalScore: evaluation.technicalScore,
          conceptualScore: evaluation.conceptualScore,
          clarityScore: evaluation.clarityScore,
          communicationScore: evaluation.communicationScore,
          completenessScore: evaluation.completenessScore,
          problemSolvingScore: evaluation.problemSolvingScore,
          overallQuestionScore: evaluation.overallScore,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          missingConcepts: evaluation.missingConcepts,
          examinerFeedback: evaluation.examinerFeedback,
        },
      });

      let followUpRecord = null;
      const existingFollowUp = await tx.interviewQuestion.findFirst({
        where: { parentQuestionId: targetQuestion.id },
      });

      if (!existingFollowUp && evaluation.followUpQuestion && shouldGenerateFollowUp) {
        // Shift subsequent questions' orderIndex so follow-up appears immediately next
        const subsequent = await tx.interviewQuestion.findMany({
          where: {
            sessionId: session.id,
            orderIndex: { gt: targetQuestion.orderIndex },
          },
          orderBy: { orderIndex: 'desc' },
        });

        for (const q of subsequent) {
          await tx.interviewQuestion.update({
            where: { id: q.id },
            data: { orderIndex: q.orderIndex + 1 },
          });
        }

        followUpRecord = await tx.interviewQuestion.create({
          data: {
            sessionId: session.id,
            orderIndex: targetQuestion.orderIndex + 1,
            prompt: evaluation.followUpQuestion.prompt,
            topic: evaluation.followUpQuestion.topic,
            expectedConcepts: evaluation.followUpQuestion.expectedConcepts,
            hint: evaluation.followUpQuestion.hint || null,
            isFollowUp: true,
            parentQuestionId: targetQuestion.id,
          },
        });
      } else if (existingFollowUp) {
        followUpRecord = existingFollowUp;
      }

      return { savedAnswer, followUpRecord };
    });

    const updatedSession = await this.getSessionById(session.id, userId);

    return {
      evaluation: result.savedAnswer,
      followUpQuestion: result.followUpRecord,
      session: updatedSession,
    };
  },

  async completeSession(sessionId: string, userId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        branch: true,
        semester: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { answer: true },
        },
        feedback: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Interview session not found.');
    }
    if (session.userId !== userId) {
      throw new ForbiddenError('You do not have access to this interview session.');
    }
    if (session.status === InterviewStatus.COMPLETED && session.feedback) {
      return session;
    }

    const answered = session.questions.filter((q) => q.answer);
    if (answered.length === 0) {
      throw new BadRequestError(
        'Cannot complete an interview session without at least one answered question.'
      );
    }

    const avg = (getter: (a: NonNullable<(typeof answered)[number]['answer']>) => number) =>
      Number(
        (answered.reduce((acc, q) => acc + getter(q.answer!), 0) / answered.length).toFixed(1)
      );

    const overallScore = avg((a) => a.overallQuestionScore);
    const technicalScore = avg((a) => a.technicalScore);
    const conceptualScore = avg((a) => a.conceptualScore);
    const clarityScore = avg((a) => a.clarityScore);
    const communicationScore = avg((a) => a.communicationScore);
    const completenessScore = avg((a) => a.completenessScore);
    const problemSolvingScore = avg((a) => a.problemSolvingScore);

    // Calculate category breakdown
    const categories: Record<string, { total: number; count: number }> = {
      'Data Structures & Algorithms': { total: 0, count: 0 },
      'System Design & Architecture': { total: 0, count: 0 },
      'Core Computer Science': { total: 0, count: 0 },
      'Object-Oriented Programming': { total: 0, count: 0 },
      'Web & Modern Technologies': { total: 0, count: 0 },
    };

    for (const q of answered) {
      const t = `${q.topic || ''} ${q.prompt}`.toLowerCase();
      let cat = 'Core Computer Science';
      if (
        t.includes('dsa') ||
        t.includes('data structure') ||
        t.includes('algorithm') ||
        t.includes('tree') ||
        t.includes('graph') ||
        t.includes('array') ||
        t.includes('heap') ||
        t.includes('trie') ||
        t.includes('binary') ||
        t.includes('dynamic programming') ||
        t.includes('sliding window')
      ) {
        cat = 'Data Structures & Algorithms';
      } else if (
        t.includes('design') ||
        t.includes('architecture') ||
        t.includes('microservice') ||
        t.includes('scalab') ||
        t.includes('system') ||
        t.includes('load balancer') ||
        t.includes('cache')
      ) {
        cat = 'System Design & Architecture';
      } else if (
        t.includes('oop') ||
        t.includes('object') ||
        t.includes('polymorphism') ||
        t.includes('inheritance') ||
        t.includes('encapsulation') ||
        t.includes('solid') ||
        t.includes('pattern')
      ) {
        cat = 'Object-Oriented Programming';
      } else if (
        t.includes('web') ||
        t.includes('api') ||
        t.includes('react') ||
        t.includes('node') ||
        t.includes('backend') ||
        t.includes('frontend') ||
        t.includes('cloud') ||
        t.includes('rest')
      ) {
        cat = 'Web & Modern Technologies';
      }

      categories[cat].total += q.answer!.overallQuestionScore;
      categories[cat].count += 1;
    }

    const categoryScores: Record<string, number> = {};
    for (const [key, val] of Object.entries(categories)) {
      if (val.count > 0) {
        categoryScores[key] = Math.round(val.total / val.count);
      }
    }

    const synthesisInput = {
      branch: session.branch?.code || 'CSE',
      semester: session.semester?.number || 5,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      topic: session.topic,
      companyName: session.companyName,
      overallScore,
      evaluations: answered.map((q) => ({
        question: q.prompt,
        answer: q.answer!.answerText,
        overallQuestionScore: q.answer!.overallQuestionScore,
        strengths: q.answer!.strengths,
        weaknesses: q.answer!.weaknesses,
        missingConcepts: q.answer!.missingConcepts,
        examinerFeedback: q.answer!.examinerFeedback,
      })),
    };

    // Use OpenAI only for polished report & roadmap; fall back cleanly to Gemini if OpenAI key is missing or fails
    let reportProvider = 'openai';
    let reportData = null;
    try {
      reportData = await openaiProvider.polishInterviewReport(synthesisInput);
    } catch (e) {
      console.warn('[PrepAI Interview] OpenAI report polishing skipped or failed:', e);
    }

    if (!reportData) {
      try {
        reportProvider = 'gemini';
        reportData = await geminiProvider.generateReportFallback(synthesisInput);
      } catch (geminiErr) {
        console.warn('[PrepAI Interview] Gemini report fallback failed, using deterministic summary:', geminiErr);
        reportProvider = 'deterministic';
        const allStrengths = Array.from(new Set(answered.flatMap((q) => q.answer!.strengths)));
        const allWeaknesses = Array.from(new Set(answered.flatMap((q) => q.answer!.weaknesses)));
        const allMissing = Array.from(new Set(answered.flatMap((q) => q.answer!.missingConcepts)));

        reportData = {
          summary: `The candidate completed the ${session.topic} technical mock interview with an overall score of ${overallScore}%. Technical responses demonstrated structured problem solving with specific opportunities identified in deeper edge-case handling and rigorous architectural explanations.`,
          strengths: allStrengths.length > 0 ? allStrengths.slice(0, 5) : ['Logical structured approach', 'Good technical communication'],
          weaknesses: allWeaknesses.length > 0 ? allWeaknesses.slice(0, 5) : ['Consider clarifying edge cases upfront', 'Deepen runtime complexity trade-offs'],
          missingConcepts: allMissing.length > 0 ? allMissing.slice(0, 6) : [session.topic],
          suggestedTopics: [session.topic, 'Data Structures & Algorithms', 'System Architecture'],
          preparationRoadmap: [
            { week: 'Week 1', focus: `Deepen ${session.topic} core invariants`, tasks: ['Review identified missing concepts', 'Solve 5 medium benchmark problems'] },
            { week: 'Week 2', focus: 'System Design & Tradeoffs', tasks: ['Practice mock verbal explanations', 'Review concurrency and scaling patterns'] }
          ],
          polishedReport: `Comprehensive technical evaluation for ${session.title}. Overall score: ${overallScore}%.`,
        };
      }
    }

    const completed = await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        status: InterviewStatus.COMPLETED,
        completedAt: new Date(),
        overallScore,
        technicalScore,
        conceptualScore,
        clarityScore,
        communicationScore,
        completenessScore,
        problemSolvingScore,
        feedback: {
          upsert: {
            create: {
              overallScore,
              summary: reportData.summary,
              strengths: reportData.strengths,
              weaknesses: reportData.weaknesses,
              missingConcepts: reportData.missingConcepts,
              suggestedTopics: reportData.suggestedTopics,
              preparationRoadmap: reportData.preparationRoadmap as Prisma.InputJsonValue,
              polishedReport: reportData.polishedReport || reportData.summary,
              reportProvider,
              categoryScores: categoryScores as Prisma.InputJsonValue,
            },
            update: {
              overallScore,
              summary: reportData.summary,
              strengths: reportData.strengths,
              weaknesses: reportData.weaknesses,
              missingConcepts: reportData.missingConcepts,
              suggestedTopics: reportData.suggestedTopics,
              preparationRoadmap: reportData.preparationRoadmap as Prisma.InputJsonValue,
              polishedReport: reportData.polishedReport || reportData.summary,
              reportProvider,
              categoryScores: categoryScores as Prisma.InputJsonValue,
            },
          },
        },
      },
      include: {
        branch: true,
        semester: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { answer: true },
        },
        feedback: true,
      },
    });

    return completed;
  },

  async flagSessionForReview(
    sessionId: string,
    userId: string,
    reason: string,
    details?: string
  ) {
    const session = await prisma.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundError('Interview session not found.');
    }
    if (session.userId !== userId) {
      throw new ForbiddenError('You can only flag your own interview session.');
    }

    return prisma.aiReviewFlag.create({
      data: {
        sessionId,
        reportedBy: userId,
        reason,
        details: details || null,
      },
    });
  },
};
