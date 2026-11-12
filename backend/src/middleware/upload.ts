// src/middleware/upload.ts
import path from 'path';
import multer from 'multer';
import { BadRequestError } from '../utils/errors';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx']);

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(file.mimetype) && !ALLOWED_EXTENSIONS.has(ext)) {
      return cb(
        new BadRequestError('Only PDF and DOCX resume files are supported (max 5 MB).')
      );
    }
    cb(null, true);
  },
});
