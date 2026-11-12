// src/routes/profile.routes.ts
import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../validators/user.validators';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile);
router.patch('/', validate(updateProfileSchema), profileController.updateProfile);

export default router;
