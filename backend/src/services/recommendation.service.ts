// src/services/recommendation.service.ts
import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export interface PersonalizedRecommendation {
  id: string;
  topic: string;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedHours: number;
  resources: {
    id: string;
    title: string;
    subject: string;
    format: string;
    difficulty: string;
    isGatePyq: boolean;
    contentUrl: string | null;
  }[];
  practiceProblems: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    topic: string;
    collection: string;
    rating: number | null;
  }[];
  companyQuestions: {
    id: string;
    title: string;
    companyName: string;
    difficulty: string;
    topic: string;
  }[];
}

export const recommendationService = {
  async getSessionRecommendations(sessionId: string, userId: string, isAdmin = false): Promise<PersonalizedRecommendation[]> {
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

    if (!session || (!isAdmin && session.userId !== userId)) {
      throw new NotFoundError('Interview session not found.');
    }

    // Extract weak areas and missing concepts
    const gaps: { topic: string; reason: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }[] = [];

    // 1. From question answers with low scores
    session.questions.forEach((q) => {
      if (q.answer) {
        if (q.answer.overallQuestionScore < 60) {
          const topicName = q.topic || session.topic;
          gaps.push({
            topic: topicName,
            reason: `Low evaluation score (${q.answer.overallQuestionScore.toFixed(0)}%) in Question: "${q.prompt.slice(0, 70)}..."`,
            priority: 'HIGH',
          });
        } else if (q.answer.overallQuestionScore < 75) {
          const topicName = q.topic || session.topic;
          gaps.push({
            topic: topicName,
            reason: `Moderate evaluation score (${q.answer.overallQuestionScore.toFixed(0)}%) in Question: "${q.prompt.slice(0, 70)}..."`,
            priority: 'MEDIUM',
          });
        }

        if (q.answer.missingConcepts && q.answer.missingConcepts.length > 0) {
          q.answer.missingConcepts.forEach((mc) => {
            gaps.push({
              topic: mc,
              reason: `Examiner flagged missing concept: "${mc}"`,
              priority: 'HIGH',
            });
          });
        }
      }
    });

    // 2. From session feedback
    if (session.feedback) {
      session.feedback.missingConcepts.forEach((mc) => {
        gaps.push({
          topic: mc,
          reason: `High-priority concept to strengthen from final evaluation`,
          priority: 'HIGH',
        });
      });
      session.feedback.weaknesses.forEach((w) => {
        gaps.push({
          topic: w,
          reason: `Examiner identified area to refine: "${w}"`,
          priority: 'MEDIUM',
        });
      });
      session.feedback.suggestedTopics.forEach((st) => {
        gaps.push({
          topic: st,
          reason: `Recommended topic for technical mastery roadmap`,
          priority: 'LOW',
        });
      });
    }

    // Fallback if no specific gaps were detected (e.g. perfect score or brief test)
    if (gaps.length === 0) {
      gaps.push({
        topic: session.topic,
        reason: `Target interview domain: ${session.topic}`,
        priority: 'MEDIUM',
      });
    }

    // Deduplicate gap topics
    const uniqueGaps: { topic: string; reason: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }[] = [];
    const seenTopics = new Set<string>();

    for (const g of gaps) {
      const clean = g.topic.trim();
      const norm = clean.toLowerCase();
      if (!seenTopics.has(norm) && clean.length > 1) {
        seenTopics.add(norm);
        uniqueGaps.push({
          topic: clean,
          reason: g.reason,
          priority: g.priority,
        });
      }
    }

    const recommendations: PersonalizedRecommendation[] = [];

    // Query Postgres database for matching materials
    for (const gap of uniqueGaps.slice(0, 6)) {
      const searchTerms = gap.topic.split(/\s+/).filter((w) => w.length > 2);
      const orConditions = searchTerms.map((term) => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' as const } },
          { topic: { contains: term, mode: 'insensitive' as const } },
          { subject: { contains: term, mode: 'insensitive' as const } },
        ],
      }));

      // 1. Preparation Resources from DB
      const resources = await prisma.preparationResource.findMany({
        where: {
          ...(orConditions.length > 0 ? { OR: orConditions.flatMap((c) => c.OR) } : {}),
        },
        take: 3,
        select: {
          id: true,
          title: true,
          subject: true,
          format: true,
          difficulty: true,
          isGatePyq: true,
          contentUrl: true,
        },
      });

      // 2. Coding Problems (Striver DSA / CP-31)
      const codingProblems = await prisma.codingProblem.findMany({
        where: {
          OR: [
            { title: { contains: gap.topic.split(' ')[0] || gap.topic, mode: 'insensitive' } },
            { topic: { contains: gap.topic.split(' ')[0] || gap.topic, mode: 'insensitive' } },
          ],
        },
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          topic: true,
          collection: true,
          rating: true,
        },
      });

      // 3. Company Interview Questions
      const companyQuestions = await prisma.companyQuestion.findMany({
        where: {
          OR: [
            { topic: { contains: gap.topic.split(' ')[0] || gap.topic, mode: 'insensitive' } },
            { title: { contains: gap.topic.split(' ')[0] || gap.topic, mode: 'insensitive' } },
          ],
        },
        take: 3,
        include: { company: true },
      });

      recommendations.push({
        id: `rec_${gap.topic.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
        topic: gap.topic,
        reason: gap.reason,
        priority: gap.priority,
        estimatedHours: gap.priority === 'HIGH' ? 4 : gap.priority === 'MEDIUM' ? 2.5 : 1.5,
        resources: resources.map((r) => ({
          id: r.id,
          title: r.title,
          subject: r.subject,
          format: r.format,
          difficulty: r.difficulty,
          isGatePyq: r.isGatePyq,
          contentUrl: r.contentUrl,
        })),
        practiceProblems: codingProblems.map((cp) => ({
          id: cp.id,
          title: cp.title,
          slug: cp.slug,
          difficulty: cp.difficulty,
          topic: cp.topic,
          collection: cp.collection,
          rating: cp.rating,
        })),
        companyQuestions: companyQuestions.map((cq) => ({
          id: cq.id,
          title: cq.title,
          companyName: cq.company.name,
          difficulty: cq.difficulty,
          topic: cq.topic,
        })),
      });
    }

    return recommendations;
  },
};
