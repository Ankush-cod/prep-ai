// src/services/report.service.ts
import PDFDocument from 'pdfkit';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { prisma } from '../config/database';
import { geminiProvider } from './ai/geminiProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env, serviceStatus } from '../config/env';

export interface StudyNotesData {
  title: string;
  generatedAt: string;
  executiveSummary: string;
  keyDefinitions: { term: string; definition: string; keyTakeaway: string }[];
  coreConcepts: { concept: string; detailedExplanation: string; practicalExample: string; edgeCases?: string }[];
  algorithmsAndPatterns: {
    name: string;
    description: string;
    complexity: string;
    codeSnippet: string;
    language: string;
  }[];
  criticalInterviewQuestions: {
    question: string;
    idealAnswer: string;
    commonPitfalls: string;
  }[];
  practiceProblems: { problemName: string; difficulty: string; pattern: string; hint: string }[];
  revisionChecklist: string[];
}

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
        .fillColor('#5145E5')
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
      doc.fontSize(13).fillColor('#111827').text('Six-Dimensional Evaluation Summary');
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
          `Technical Depth: ${session.technicalScore?.toFixed(1) ?? 'N/A'}% | Conceptual Clarity: ${
            session.conceptualScore?.toFixed(1) ?? 'N/A'
          }% | Structure & Clarity: ${session.clarityScore?.toFixed(1) ?? 'N/A'}%`
        )
        .text(
          `Communication: ${session.communicationScore?.toFixed(1) ?? 'N/A'}% | Completeness: ${
            session.completenessScore?.toFixed(1) ?? 'N/A'
          }% | Problem Solving: ${session.problemSolvingScore?.toFixed(1) ?? 'N/A'}%`
        );

      if (session.feedback) {
        doc.moveDown(0.8);
        doc.fontSize(13).fillColor('#111827').text('Examiner Synthesis');
        doc.moveDown(0.3);
        doc
          .fontSize(10)
          .fillColor('#374151')
          .text(session.feedback.summary, { align: 'left' });

        if (session.feedback.strengths.length > 0) {
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor('#065f46').text('Key Strengths:');
          session.feedback.strengths.forEach((s) => {
            doc.fontSize(9.5).fillColor('#047857').text(`  • ${s}`);
          });
        }

        if (session.feedback.weaknesses.length > 0) {
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor('#92400e').text('Identified Areas for Refinement:');
          session.feedback.weaknesses.forEach((w) => {
            doc.fontSize(9.5).fillColor('#b45309').text(`  • ${w}`);
          });
        }

        if (session.feedback.missingConcepts.length > 0) {
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor('#991b1b').text('Missing Technical Concepts:');
          session.feedback.missingConcepts.forEach((m) => {
            doc.fontSize(9.5).fillColor('#b91c1c').text(`  • ${m}`);
          });
        }

        const roadmap = Array.isArray(session.feedback.preparationRoadmap)
          ? (session.feedback.preparationRoadmap as { phase?: string; focusTopic?: string; actionItems?: string[] }[])
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
          .text(`Q${idx + 1}${q.isFollowUp ? ' (Follow-Up Probe)' : ''}: ${q.prompt}`);
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

  async generateStudyNotes(sessionId: string, userId: string, regenerate = false): Promise<StudyNotesData> {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        branch: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { answer: true },
        },
        feedback: true,
      },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundError('Interview session not found.');
    }

    if (!regenerate && session.feedback?.studyNotes) {
      return session.feedback.studyNotes as unknown as StudyNotesData;
    }

    // Build context of missed items
    const missedContext = session.questions
      .map((q, idx) => {
        return `Question ${idx + 1}: ${q.prompt}\nTopic: ${q.topic || session.topic}\nCandidate Answer: ${
          q.answer?.answerText || 'None'
        }\nScore: ${q.answer?.overallQuestionScore ?? 0}%\nMissing Concepts: ${(
          q.answer?.missingConcepts || []
        ).join(', ')}\nFeedback: ${q.answer?.examinerFeedback || 'None'}`;
      })
      .join('\n---\n');

    const prompt = `You are a Principal Software Engineer and Technical Educator.
Create a comprehensive, high-yield Personalized Technical Study Dossier for a B.Tech engineer based on their mock interview gaps.

Interview Domain: ${session.topic} (${session.branch?.code || 'CSE'})
Target Bar: ${session.companyName || 'Tier-1 Tech'}
Session Overall Score: ${session.overallScore?.toFixed(1) ?? '60'}%

Session Evaluation Details & Missed Concepts:
${missedContext}

Return strict JSON matching this exact structure:
{
  "title": "Comprehensive Mastery Dossier: ${session.topic}",
  "generatedAt": "${new Date().toISOString()}",
  "executiveSummary": "2-3 paragraphs analyzing the core technical gaps, architectural misconceptions, and how mastering them elevates placement performance.",
  "keyDefinitions": [
    {
      "term": "Term or Principle",
      "definition": "Rigorous, production-grade definition",
      "keyTakeaway": "Single-sentence mental model"
    }
  ],
  "coreConcepts": [
    {
      "concept": "Core Concept Name",
      "detailedExplanation": "Deep dive into internals, memory models, hardware interactions, or system trade-offs",
      "practicalExample": "Real-world engineering application scenario",
      "edgeCases": "Critical boundary conditions, concurrency hazards, or failure modes"
    }
  ],
  "algorithmsAndPatterns": [
    {
      "name": "Algorithm / Design Pattern",
      "description": "How it solves the problem optimally",
      "complexity": "Time: O(...), Space: O(...)",
      "codeSnippet": "Clean production-ready implementation in C++, Python, or Java",
      "language": "cpp"
    }
  ],
  "criticalInterviewQuestions": [
    {
      "question": "Realistic Senior/SDE-1 Interview Question",
      "idealAnswer": "Ideal high-scoring candidate response with trade-offs",
      "commonPitfalls": "What weak candidates do wrong"
    }
  ],
  "practiceProblems": [
    {
      "problemName": "Standard Problem Name",
      "difficulty": "Medium",
      "pattern": "Core Algorithmic Pattern",
      "hint": "Non-spoiler invariant hint"
    }
  ],
  "revisionChecklist": [
    "Checklist item 1",
    "Checklist item 2",
    "Checklist item 3"
  ]
}`;

    let notes: StudyNotesData;

    try {
      if (!serviceStatus.hasGemini) {
        throw new Error('Gemini API key not configured.');
      }
      const genAI = new GoogleGenerativeAI(env.geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: env.geminiModel || 'gemini-3.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.35,
        },
      });

      const res = await model.generateContent(prompt);
      const rawText = res.response.text();
      notes = JSON.parse(rawText) as StudyNotesData;
    } catch (aiErr) {
      console.warn(`[PrepAI StudyNotes] AI generation failed, using deterministic synthesis:`, aiErr);
      // Deterministic fallback
      notes = {
        title: `Technical Mastery Guide: ${session.topic}`,
        generatedAt: new Date().toISOString(),
        executiveSummary: `This targeted study dossier was compiled from your ${session.interviewType} interview on ${session.topic}. Review the highlighted concepts, edge cases, and design patterns below to strengthen technical accuracy.`,
        keyDefinitions: session.feedback?.missingConcepts.map((mc) => ({
          term: mc,
          definition: `Core engineering concept in ${session.topic} requiring precise formal explanation during technical cross-examinations.`,
          keyTakeaway: `Understand the fundamental time/space tradeoffs and implementation invariants of ${mc}.`,
        })) || [
          {
            term: session.topic,
            definition: `Foundational B.Tech subject area covering core data structures, operating mechanisms, and systemic invariants.`,
            keyTakeaway: `Practice explaining trade-offs verbally while drafting optimal solutions.`,
          },
        ],
        coreConcepts: [
          {
            concept: `${session.topic} Invariants & Tradeoffs`,
            detailedExplanation: `In technical interviews, examiners evaluate not just whether your solution works, but your awareness of memory layouts, CPU cache friendliness, algorithmic complexity bounds, and concurrent edge cases.`,
            practicalExample: `Designing scalable services with bounded memory utilization and predictable latency SLAs.`,
            edgeCases: `Handling empty inputs, integer overflow, cyclic graphs, and deadlock-prone synchronization blocks.`,
          },
        ],
        algorithmsAndPatterns: [
          {
            name: `Optimal ${session.topic} Pattern`,
            description: `State-of-the-art approach to solving questions in this domain with minimal overhead.`,
            complexity: `Time: O(N log N) or O(N), Space: O(1) auxiliary`,
            codeSnippet: `// Idiomatic implementation\nvoid solve() {\n    // 1. Validate inputs\n    // 2. Execute optimal traversal\n    // 3. Return bounded result\n}`,
            language: 'cpp',
          },
        ],
        criticalInterviewQuestions: session.questions.slice(0, 3).map((q) => ({
          question: q.prompt,
          idealAnswer: `A comprehensive answer defines the invariant, steps through time/space complexity, addresses edge cases, and discusses production trade-offs.`,
          commonPitfalls: `Failing to consider memory limits, ignoring concurrency hazards, or presenting sub-optimal brute-force solutions.`,
        })),
        practiceProblems: [
          {
            problemName: `${session.topic} Placement Benchmark Problem`,
            difficulty: 'Medium',
            pattern: 'Optimal Substructure / Sliding Window / In-Memory Indexing',
            hint: 'Identify invariants before allocating dynamic structures.',
          },
        ],
        revisionChecklist: [
          `Review all missing concepts flagged in question evaluations`,
          `Re-implement algorithmic patterns from scratch without IDE autocomplete`,
          `Practice explaining solutions verbally using the STAR and Trade-Off rubrics`,
        ],
      };
    }

    if (session.feedback) {
      await prisma.interviewFeedback.update({
        where: { id: session.feedback.id },
        data: {
          studyNotes: notes as any,
        },
      });
    }

    return notes;
  },

  async getStudyNotes(sessionId: string, userId: string): Promise<StudyNotesData | null> {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { feedback: true },
    });
    if (!session || session.userId !== userId) {
      throw new NotFoundError('Interview session not found.');
    }
    return (session.feedback?.studyNotes as unknown as StudyNotesData) || null;
  },

  async generateStudyNotesPdf(sessionId: string, userId: string, isAdmin = false): Promise<Buffer> {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { feedback: true },
    });
    if (!session || (!isAdmin && session.userId !== userId)) {
      throw new NotFoundError('Interview session not found.');
    }

    let notes = (session.feedback?.studyNotes as unknown as StudyNotesData) || null;
    if (!notes) {
      notes = await this.generateStudyNotes(sessionId, userId, false);
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 48, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header Banner
      doc
        .fontSize(20)
        .fillColor('#5145E5')
        .text('PrepAI — Personalized Technical Study Dossier', { align: 'left' });
      doc.moveDown(0.3);
      doc
        .fontSize(12)
        .fillColor('#111827')
        .text(notes.title)
        .fontSize(9.5)
        .fillColor('#4b5563')
        .text(`Topic: ${session.topic} | Target: ${session.companyName || 'General Engineering'} | Generated: ${new Date(notes.generatedAt).toLocaleDateString()}`);

      doc.moveDown(0.8);
      doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor('#d1d5db').stroke();
      doc.moveDown(0.8);

      // Executive Summary
      doc.fontSize(13).fillColor('#111827').text('Executive Analysis & Gap Synthesis');
      doc.moveDown(0.3);
      doc.fontSize(9.5).fillColor('#374151').text(notes.executiveSummary, { align: 'left' });

      // Key Definitions
      if (notes.keyDefinitions && notes.keyDefinitions.length > 0) {
        doc.moveDown(0.8);
        doc.fontSize(13).fillColor('#111827').text('Key Technical Definitions');
        notes.keyDefinitions.forEach((kd) => {
          doc.moveDown(0.4);
          doc.fontSize(10).fillColor('#5145E5').text(`• ${kd.term}: `, { continued: true });
          doc.fontSize(9.5).fillColor('#1f2937').text(kd.definition);
          if (kd.keyTakeaway) {
            doc.fontSize(8.5).fillColor('#059669').text(`   Mental Model: ${kd.keyTakeaway}`);
          }
        });
      }

      // Core Concepts
      if (notes.coreConcepts && notes.coreConcepts.length > 0) {
        doc.moveDown(0.8);
        doc.fontSize(13).fillColor('#111827').text('Core Concept Deep-Dives');
        notes.coreConcepts.forEach((cc) => {
          doc.moveDown(0.4);
          doc.fontSize(10.5).fillColor('#111827').text(cc.concept);
          doc.fontSize(9.5).fillColor('#374151').text(cc.detailedExplanation);
          if (cc.practicalExample) {
            doc.fontSize(9).fillColor('#4b5563').text(`Example: ${cc.practicalExample}`);
          }
          if (cc.edgeCases) {
            doc.fontSize(9).fillColor('#b91c1c').text(`Edge Cases & Hazards: ${cc.edgeCases}`);
          }
        });
      }

      // Algorithms and Code Snippets
      if (notes.algorithmsAndPatterns && notes.algorithmsAndPatterns.length > 0) {
        doc.moveDown(0.8);
        doc.fontSize(13).fillColor('#111827').text('Algorithmic Patterns & Code Snippets');
        notes.algorithmsAndPatterns.forEach((ap) => {
          doc.moveDown(0.4);
          doc.fontSize(10.5).fillColor('#5145E5').text(`${ap.name} (${ap.complexity})`);
          doc.fontSize(9.5).fillColor('#374151').text(ap.description);
          if (ap.codeSnippet) {
            doc.moveDown(0.2);
            doc.font('Courier').fontSize(8.5).fillColor('#111827').text(ap.codeSnippet);
            doc.font('Helvetica'); // restore standard font
          }
        });
      }

      // Critical Interview Questions
      if (notes.criticalInterviewQuestions && notes.criticalInterviewQuestions.length > 0) {
        doc.moveDown(0.8);
        doc.fontSize(13).fillColor('#111827').text('Critical Interview Questions & Model Answers');
        notes.criticalInterviewQuestions.forEach((q, i) => {
          doc.moveDown(0.4);
          doc.fontSize(10).fillColor('#111827').text(`Q${i + 1}: ${q.question}`);
          doc.fontSize(9).fillColor('#047857').text(`Ideal Answer: ${q.idealAnswer}`);
          if (q.commonPitfalls) {
            doc.fontSize(9).fillColor('#b91c1c').text(`Common Pitfall: ${q.commonPitfalls}`);
          }
        });
      }

      // Revision Checklist
      if (notes.revisionChecklist && notes.revisionChecklist.length > 0) {
        doc.moveDown(0.8);
        doc.fontSize(13).fillColor('#111827').text('High-Yield Revision Checklist');
        notes.revisionChecklist.forEach((item) => {
          doc.moveDown(0.2);
          doc.fontSize(9.5).fillColor('#1f2937').text(`[  ]  ${item}`);
        });
      }

      doc.end();
    });
  },
};
