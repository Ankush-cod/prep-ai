// src/routes/interview.routes.ts
import { Router } from 'express';
import { interviewController } from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import {
  createInterviewSessionSchema,
  flagSessionSchema,
  submitAnswerSchema,
} from '../validators/interview.validators';

const router = Router();

router.use(authenticate);

router.get('/sessions', interviewController.listSessions);
router.post(
  '/sessions',
  aiRateLimiter,
  validate(createInterviewSessionSchema),
  interviewController.createSession
);
router.get('/sessions/:id', interviewController.getSession);
router.post(
  '/sessions/:id/answers',
  aiRateLimiter,
  validate(submitAnswerSchema),
  interviewController.submitAnswer
);
router.post('/sessions/:id/complete', aiRateLimiter, interviewController.completeSession);
router.get('/sessions/:id/report/pdf', interviewController.downloadReportPdf);
router.post('/sessions/:id/flag', validate(flagSessionSchema), interviewController.flagSession);

export default router;
