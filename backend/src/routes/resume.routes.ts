// src/routes/resume.routes.ts
import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { resumeUpload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', resumeController.listResumes);
router.get('/latest', resumeController.getLatest);
router.get('/:id', resumeController.getById);
router.post(
  '/analyze',
  aiRateLimiter,
  resumeUpload.single('resume'),
  resumeController.uploadAndAnalyze
);
router.delete('/:id', resumeController.remove);

export default router;
