// src/routes/coding.routes.ts
import { Router } from 'express';
import { codingController } from '../controllers/coding.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { codeExecutionRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import {
  executeCodeSchema,
  listProblemsQuerySchema,
} from '../validators/coding.validators';

const router = Router();

router.get('/languages', codingController.getLanguages);
router.get(
  '/problems',
  optionalAuthenticate,
  validate(listProblemsQuerySchema, 'query'),
  codingController.listProblems
);
router.get('/problems/:id', optionalAuthenticate, codingController.getProblem);

router.post(
  '/problems/:id/run',
  authenticate,
  codeExecutionRateLimiter,
  validate(executeCodeSchema),
  codingController.runSample
);
router.post(
  '/problems/:id/submit',
  authenticate,
  codeExecutionRateLimiter,
  validate(executeCodeSchema),
  codingController.submitSolution
);
router.get('/submissions', authenticate, codingController.listSubmissions);

export default router;
