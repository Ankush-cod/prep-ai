// src/services/resume.service.ts
import path from 'path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { uploadResumeToCloudinary } from '../config/cloudinary';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { geminiProvider } from './ai/geminiProvider';

const MIN_MEANINGFUL_CHARS = 60;

async function extractDocumentText(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<{ text: string; isPdf: boolean }> {
  const ext = path.extname(originalName).toLowerCase();
  const isPdf = mimeType === 'application/pdf' || ext === '.pdf';

  if (isPdf) {
    const parsed = await pdfParse(buffer);
    return {
      text: (parsed.text || '').trim(),
      isPdf: true,
    };
  }

  const docxResult = await mammoth.extractRawText({ buffer });
  return {
    text: (docxResult.value || '').trim(),
    isPdf: false,
  };
}

export const resumeService = {
  async uploadAndAnalyze(
    userId: string,
    file: Express.Multer.File
  ) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestError('Please upload a non-empty PDF or DOCX resume.');
    }

    const { text, isPdf } = await extractDocumentText(
      file.buffer,
      file.mimetype,
      file.originalname
    );

    const nonWhitespaceCount = text.replace(/\s+/g, '').length;
    if (nonWhitespaceCount < MIN_MEANINGFUL_CHARS) {
      if (isPdf) {
        throw new BadRequestError(
          'No selectable text could be extracted from this PDF. It appears to be a scanned image PDF, and OCR is not enabled in Semester 1. Please upload a text-based PDF or DOCX resume.'
        );
      }
      throw new BadRequestError(
        'The uploaded DOCX document contains insufficient readable text to analyze.'
      );
    }

    const userAcademic = await prisma.academicDetails.findUnique({
      where: { userId },
      include: { branch: true },
    });

    // Optional Cloudinary backup (non-blocking if not configured)
    let cloudinaryResult: { url: string; publicId: string } | null = null;
    try {
      cloudinaryResult = await uploadResumeToCloudinary(
        file.buffer,
        file.originalname,
        userId
      );
    } catch (err) {
      console.warn(
        '[PrepAI Cloudinary] Resume file upload skipped/failed; storing extracted text in PostgreSQL.',
        err instanceof Error ? err.message : err
      );
    }

    // Call Gemini before persisting analysis so failed AI calls don't save fabricated analyses
    const structured = await geminiProvider.analyzeResumeText(
      text,
      userAcademic?.branch.code
    );

    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        storageUrl: cloudinaryResult?.url || null,
        cloudinaryPublicId: cloudinaryResult?.publicId || null,
        extractedText: text,
        isScannedPdf: false,
        analysis: {
          create: {
            education: structured.education as Prisma.InputJsonValue,
            skills: structured.skills,
            technologies: structured.technologies,
            projects: structured.projects as Prisma.InputJsonValue,
            experience: structured.experience as Prisma.InputJsonValue,
            certifications: structured.certifications,
            summary: structured.summary,
            generatedQuestions: structured.personalizedQuestions as Prisma.InputJsonValue,
            followUpQuestions: structured.followUpQuestions as Prisma.InputJsonValue,
            aiProvider: 'gemini',
          },
        },
      },
      include: {
        analysis: true,
      },
    });

    return resume;
  },

  async listUserResumes(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { analysis: true },
    });
  },

  async getLatestResume(userId: string) {
    return prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { analysis: true },
    });
  },

  async getResumeById(resumeId: string, userId: string) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: { analysis: true },
    });
    if (!resume) {
      throw new NotFoundError('Resume not found.');
    }
    if (resume.userId !== userId) {
      throw new ForbiddenError('You do not have access to this resume.');
    }
    return resume;
  },

  async deleteResume(resumeId: string, userId: string) {
    const resume = await this.getResumeById(resumeId, userId);
    await prisma.resume.delete({ where: { id: resume.id } });
    return { message: 'Resume deleted successfully.' };
  },
};
