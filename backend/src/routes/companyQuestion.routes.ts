// src/routes/companyQuestion.routes.ts
import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { companyQuestionController } from '../controllers/companyQuestion.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  companyQuestionCreateSchema,
  companyQuestionUpdateSchema,
} from '../validators/content.validators';

const router = Router();

router.get('/companies', companyQuestionController.listCompanies);
router.get('/', optionalAuthenticate, companyQuestionController.listQuestions);
router.get('/:id', optionalAuthenticate, companyQuestionController.getQuestion);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(companyQuestionCreateSchema),
  companyQuestionController.createQuestion
);
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(companyQuestionUpdateSchema),
  companyQuestionController.updateQuestion
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  companyQuestionController.deleteQuestion
);

export default router;
