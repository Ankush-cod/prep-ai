// src/services/analytics.service.ts
import { InterviewStatus, SubmissionStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

function computeStreakDays(activityDates: Date[]): number {
  if (activityDates.length === 0) return 0;

  const uniqueDays = new Set(
    activityDates.map((d) => {
      const copy = new Date(d);
      copy.setUTCHours(0, 0, 0, 0);
      return copy.getTime();
    })
  );

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const oneDayMs = 24 * 60 * 60 * 1000;

  let cursor = today.getTime();
  if (!uniqueDays.has(cursor)) {
    cursor -= oneDayMs;
    if (!uniqueDays.has(cursor)) {
      return 0;
    }
  }

  let streak = 0;
  while (uniqueDays.has(cursor)) {
    streak += 1;
    cursor -= oneDayMs;
  }
  return streak;
}

export const analyticsService = {
  async getDashboardData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        academicDetails: {
          include: { branch: true, semester: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const [sessions, submissions, totalProblems, bookmarkCount] = await Promise.all([
      prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          branch: true,
          semester: true,
          feedback: true,
        },
      }),
      prisma.codingSubmission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          problem: { select: { id: true, title: true, difficulty: true, topic: true } },
        },
      }),
      prisma.codingProblem.count(),
      prisma.bookmark.count({ where: { userId } }),
    ]);

    const completedSessions = sessions.filter(
      (s) => s.status === InterviewStatus.COMPLETED && s.overallScore !== null
    );

    const averageInterviewScore =
      completedSessions.length > 0
        ? Number(
            (
              completedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) /
              completedSessions.length
            ).toFixed(1)
          )
        : 0;

    const solvedProblemIds = new Set(
      submissions
        .filter((s) => s.status === SubmissionStatus.ACCEPTED)
        .map((s) => s.problemId)
    );

    const activityDates = [
      ...sessions.map((s) => s.createdAt),
      ...submissions.map((s) => s.createdAt),
    ];
    const streakDays = computeStreakDays(activityDates);

    // Recent activity feed from real database actions
    const recentActivity = [
      ...sessions.slice(0, 5).map((s) => ({
        id: `session-${s.id}`,
        type: 'INTERVIEW' as const,
        title: s.title,
        status: s.status,
        score: s.overallScore,
        timestamp: s.createdAt,
      })),
      ...submissions.slice(0, 5).map((sub) => ({
        id: `sub-${sub.id}`,
        type: 'CODING' as const,
        title: `${sub.problem.title} (${sub.language})`,
        status: sub.status,
        score: null,
        timestamp: sub.createdAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);

    // Recommended topics derived from feedback suggestedTopics or branch resources
    const suggestedFromFeedback = completedSessions
      .flatMap((s) => s.feedback?.suggestedTopics || [])
      .filter(Boolean);

    let recommendedTopics = Array.from(new Set(suggestedFromFeedback)).slice(0, 5);

    if (recommendedTopics.length === 0 && user.academicDetails?.branchId) {
      const branchResources = await prisma.preparationResource.findMany({
        where: { branchId: user.academicDetails.branchId },
        take: 5,
        select: { subject: true, topic: true },
      });
      recommendedTopics = Array.from(
        new Set(branchResources.map((r) => `${r.subject}: ${r.topic}`))
      );
    }

    return {
      academicInfo: {
        fullName: user.profile?.fullName || user.email.split('@')[0],
        email: user.email,
        institution: user.academicDetails?.institution || null,
        degree: user.academicDetails?.degree || 'B.Tech',
        branch: user.academicDetails?.branch.code || null,
        branchName: user.academicDetails?.branch.name || null,
        academicYear: user.academicDetails?.academicYear || null,
        semester: user.academicDetails?.semester.number || null,
        cgpa: user.academicDetails?.cgpa ?? null,
      },
      summaryMetrics: {
        totalInterviews: sessions.length,
        completedInterviews: completedSessions.length,
        averageInterviewScore,
        solvedProblemsCount: solvedProblemIds.size,
        totalProblemsCount: totalProblems,
        totalSubmissions: submissions.length,
        bookmarkCount,
        streakDays,
      },
      recentInterviews: sessions.slice(0, 5),
      recentActivity,
      recommendedTopics,
    };
  },

  async getAnalytics(userId: string) {
    const [sessions, answers, submissions, totalProblems] = await Promise.all([
      prisma.interviewSession.findMany({
        where: { userId, status: InterviewStatus.COMPLETED },
        orderBy: { completedAt: 'asc' },
        include: { branch: true, feedback: true },
      }),
      prisma.interviewAnswer.findMany({
        where: {
          question: {
            session: { userId },
          },
        },
        include: {
          question: {
            select: { topic: true },
          },
        },
      }),
      prisma.codingSubmission.findMany({
        where: { userId },
        include: {
          problem: { select: { id: true, difficulty: true, topic: true } },
        },
      }),
      prisma.codingProblem.count(),
    ]);

    const scoreTrend = sessions.map((s) => ({
      sessionId: s.id,
      title: s.title,
      date: (s.completedAt || s.createdAt).toISOString(),
      overallScore: s.overallScore ?? 0,
      interviewType: s.interviewType,
    }));

    // Dimension averages across all evaluated answers
    const dimensionAverages =
      answers.length > 0
        ? {
            technical: Number(
              (
                answers.reduce((acc, a) => acc + a.technicalScore, 0) / answers.length
              ).toFixed(1)
            ),
            conceptual: Number(
              (
                answers.reduce((acc, a) => acc + a.conceptualScore, 0) / answers.length
              ).toFixed(1)
            ),
            clarity: Number(
              (
                answers.reduce((acc, a) => acc + a.clarityScore, 0) / answers.length
              ).toFixed(1)
            ),
            communication: Number(
              (
                answers.reduce((acc, a) => acc + a.communicationScore, 0) / answers.length
              ).toFixed(1)
            ),
            completeness: Number(
              (
                answers.reduce((acc, a) => acc + a.completenessScore, 0) / answers.length
              ).toFixed(1)
            ),
            problemSolving: Number(
              (
                answers.reduce((acc, a) => acc + a.problemSolvingScore, 0) / answers.length
              ).toFixed(1)
            ),
          }
        : null;

    // Topic-wise aggregation
    const topicBucket = new Map<string, { sum: number; count: number }>();
    for (const ans of answers) {
      const topic = ans.question.topic || 'General';
      const entry = topicBucket.get(topic) || { sum: 0, count: 0 };
      entry.sum += ans.overallQuestionScore;
      entry.count += 1;
      topicBucket.set(topic, entry);
    }

    const topicBreakdown = Array.from(topicBucket.entries())
      .map(([topic, { sum, count }]) => ({
        topic,
        averageScore: Number((sum / count).toFixed(1)),
        attempts: count,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    const strengths = topicBreakdown.filter((t) => t.averageScore >= 70).slice(0, 5);
    const weaknesses = [...topicBreakdown]
      .reverse()
      .filter((t) => t.averageScore < 70)
      .slice(0, 5);

    const acceptedSubmissions = submissions.filter(
      (s) => s.status === SubmissionStatus.ACCEPTED
    );
    const solvedByDifficulty = {
      EASY: new Set(
        acceptedSubmissions
          .filter((s) => s.problem.difficulty === 'EASY')
          .map((s) => s.problemId)
      ).size,
      MEDIUM: new Set(
        acceptedSubmissions
          .filter((s) => s.problem.difficulty === 'MEDIUM')
          .map((s) => s.problemId)
      ).size,
      HARD: new Set(
        acceptedSubmissions
          .filter((s) => s.problem.difficulty === 'HARD')
          .map((s) => s.problemId)
      ).size,
    };

    const uniqueSolvedCount =
      solvedByDifficulty.EASY + solvedByDifficulty.MEDIUM + solvedByDifficulty.HARD;

    return {
      completedInterviewsCount: sessions.length,
      evaluatedAnswersCount: answers.length,
      scoreTrend,
      dimensionAverages,
      topicBreakdown,
      strengths,
      weaknesses,
      codingStats: {
        totalSubmissions: submissions.length,
        acceptedSubmissions: acceptedSubmissions.length,
        acceptanceRate:
          submissions.length > 0
            ? Number(((acceptedSubmissions.length / submissions.length) * 100).toFixed(1))
            : 0,
        uniqueSolvedCount,
        totalProblems,
        completionRate:
          totalProblems > 0
            ? Number(((uniqueSolvedCount / totalProblems) * 100).toFixed(1))
            : 0,
        solvedByDifficulty,
      },
    };
  },
};
