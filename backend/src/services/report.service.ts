// src/services/report.service.ts
import PDFDocument from 'pdfkit';
import { NotFoundError } from '../utils/errors';
import { prisma } from '../config/database';

export const reportService = {
  async generateInterviewPdf(sessionId: string, userId: string, isAdmin = false): Promise<Buffer> {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: {
            profile: true,
            academicDetails: { include: { branch: true, semester: true } },
          },
        },
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

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 48, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .fillColor('#4f46e5')
        .text('PrepAI — Technical Interview Report', { align: 'left' });
      doc.moveDown(0.3);
      doc
        .fontSize(11)
        .fillColor('#111827')
        .text(session.title)
        .fontSize(9.5)
        .fillColor('#4b5563')
        .text(
          `Candidate: ${session.user.profile?.fullName || session.user.email} | Branch: ${
            session.branch?.code || session.user.academicDetails?.branch.code || 'N/A'
          } | Sem: ${
            session.semester?.number || session.user.academicDetails?.semester.number || 'N/A'
          }`
        )
        .text(
          `Type: ${session.interviewType} | Difficulty: ${session.difficulty} | Topic: ${
            session.topic
          } | Status: ${session.status}`
        )
        .text(`Generated: ${new Date().toISOString()}`);

      doc.moveDown(0.8);
      doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor('#d1d5db').stroke();
      doc.moveDown(0.8);

      // Score Breakdown
      doc.fontSize(13).fillColor('#111827').text('Evaluation Score Summary');
      doc.moveDown(0.3);
      doc
        .fontSize(10)
        .fillColor('#1f2937')
        .text(
          `Overall Score: ${
            session.overallScore != null ? `${session.overallScore.toFixed(1)} / 100` : 'Not finalized'
          }`
        )
        .text(
          `Technical: ${session.technicalScore?.toFixed(1) ?? 'N/A'} | Conceptual: ${
            session.conceptualScore?.toFixed(1) ?? 'N/A'
          } | Clarity: ${session.clarityScore?.toFixed(1) ?? 'N/A'}`
        )
        .text(
          `Communication: ${session.communicationScore?.toFixed(1) ?? 'N/A'} | Completeness: ${
            session.completenessScore?.toFixed(1) ?? 'N/A'
          } | Problem Solving: ${session.problemSolvingScore?.toFixed(1) ?? 'N/A'}`
        );

      if (session.feedback) {
        doc.moveDown(0.8);
        doc.fontSize(13).fillColor('#111827').text('Overall Assessment');
        doc.moveDown(0.3);
        doc
          .fontSize(10)
          .fillColor('#374151')
          .text(session.feedback.summary, { align: 'left' });

        if (session.feedback.strengths.length > 0) {
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor('#047857').text('Strengths');
          session.feedback.strengths.forEach((item) => {
            doc.fontSize(9.5).fillColor('#374151').text(`• ${item}`);
          });
        }

        if (session.feedback.weaknesses.length > 0) {
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor('#b45309').text('Areas to Improve');
          session.feedback.weaknesses.forEach((item) => {
            doc.fontSize(9.5).fillColor('#374151').text(`• ${item}`);
          });
        }

        if (session.feedback.missingConcepts.length > 0) {
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor('#b91c1c').text('Missing Concepts');
          session.feedback.missingConcepts.forEach((item) => {
            doc.fontSize(9.5).fillColor('#374151').text(`• ${item}`);
          });
        }

        if (session.feedback.suggestedTopics.length > 0) {
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor('#4f46e5').text('Suggested Revision Topics');
          doc
            .fontSize(9.5)
            .fillColor('#374151')
            .text(session.feedback.suggestedTopics.join(', '));
        }

        const roadmap = Array.isArray(session.feedback.preparationRoadmap)
          ? (session.feedback.preparationRoadmap as {
              phase?: string;
              focusTopic?: string;
              actionItems?: string[];
            }[])
          : [];

        if (roadmap.length > 0) {
          doc.moveDown(0.6);
          doc.fontSize(12).fillColor('#111827').text('Personalized Preparation Roadmap');
          roadmap.forEach((step) => {
            doc.moveDown(0.3);
            doc
              .fontSize(10)
              .fillColor('#1f2937')
              .text(`${step.phase || 'Step'}: ${step.focusTopic || ''}`);
            (step.actionItems || []).forEach((action) => {
              doc.fontSize(9).fillColor('#4b5563').text(`   - ${action}`);
            });
          });
        }
      }

      // Per-question breakdown
      doc.moveDown(0.8);
      doc.fontSize(13).fillColor('#111827').text('Question-by-Question Breakdown');
      session.questions.forEach((q, idx) => {
        doc.moveDown(0.5);
        doc
          .fontSize(10.5)
          .fillColor('#111827')
          .text(`Q${idx + 1}${q.isFollowUp ? ' (Follow-Up)' : ''}: ${q.prompt}`);
        if (q.answer) {
          doc
            .fontSize(9.5)
            .fillColor('#4b5563')
            .text(`Score: ${q.answer.overallQuestionScore.toFixed(1)} / 100`)
            .text(`Candidate Response: ${q.answer.answerText}`)
            .text(`Examiner Feedback: ${q.answer.examinerFeedback}`);
        } else {
          doc.fontSize(9.5).fillColor('#9ca3af').text('No answer submitted.');
        }
      });

      doc.end();
    });
  },
};
