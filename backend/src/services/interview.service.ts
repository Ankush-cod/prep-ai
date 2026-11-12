// src/services/interview.service.ts
import { BranchCode, InterviewStatus, InterviewType, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
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
    const initialQuestionsCount = Math.max(1, Math.min(input.questionCount, 6));
    const generated = await geminiProvider.generateInitialQuestions({
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
    });

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
    if (targetQuestion.answer) {
      throw new BadRequestError('An answer has already been submitted for this question.');
    }

    const conversationHistory = session.questions
      .filter((q) => q.answer && q.orderIndex < targetQuestion.orderIndex)
      .map((q) => ({
        question: q.prompt,
        answer: q.answer!.answerText,
      }));

    // Allow follow-up when current question isn't already a follow-up and session hasn't exceeded max total questions
    const maxTotalQuestions = session.questionCount + 2;
    const shouldGenerateFollowUp =
      !targetQuestion.isFollowUp && session.questions.length < maxTotalQuestions;

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
      const savedAnswer = await tx.interviewAnswer.create({
        data: {
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
      });

      let followUpRecord = null;
      if (evaluation.followUpQuestion && shouldGenerateFollowUp) {
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
    let reportData = await openaiProvider.polishInterviewReport(synthesisInput);

    if (!reportData) {
      reportProvider = 'gemini';
      reportData = await geminiProvider.generateReportFallback(synthesisInput);
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
