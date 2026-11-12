// src/routes/settings.routes.ts
import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateSettingsSchema,
} from '../validators/user.validators';

const router = Router();

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.patch('/', validate(updateSettingsSchema), settingsController.updateSettings);
router.post(
  '/change-password',
  validate(changePasswordSchema),
  settingsController.changePassword
);
router.get('/sessions', settingsController.listSessions);
router.post('/logout-all', settingsController.logoutAllDevices);
router.delete('/account', validate(deleteAccountSchema), settingsController.deleteAccount);

export default router;
