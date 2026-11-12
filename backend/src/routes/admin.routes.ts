// src/routes/admin.routes.ts
import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  adminResolveFlagSchema,
  adminUpdateRequestSchema,
  adminUpdateUserSchema,
} from '../validators/user.validators';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.listUsers);
router.patch('/users/:id', validate(adminUpdateUserSchema), adminController.updateUser);
router.get('/resource-requests', adminController.listResourceRequests);
router.patch(
  '/resource-requests/:id',
  validate(adminUpdateRequestSchema),
  adminController.updateResourceRequest
);
router.get('/ai-reviews', adminController.listAiReviews);
router.patch(
  '/ai-reviews/:id',
  validate(adminResolveFlagSchema),
  adminController.resolveAiReview
);
router.get('/analytics', adminController.getAnalytics);

export default router;
