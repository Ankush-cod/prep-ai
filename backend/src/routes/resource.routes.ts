// src/routes/resource.routes.ts
import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { resourceController } from '../controllers/resource.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  resourceCreateSchema,
  resourceRequestCreateSchema,
  resourceUpdateSchema,
} from '../validators/content.validators';

const router = Router();

router.get('/', optionalAuthenticate, resourceController.listResources);
router.post('/:id/upvote', authenticate, resourceController.upvote);
router.post('/:id/download', authenticate, resourceController.trackDownload);
router.post(
  '/requests',
  authenticate,
  validate(resourceRequestCreateSchema),
  resourceController.requestResource
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(resourceCreateSchema),
  resourceController.createResource
);
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(resourceUpdateSchema),
  resourceController.updateResource
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  resourceController.deleteResource
);

export default router;
