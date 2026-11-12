// src/routes/dashboard.routes.ts
import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', dashboardController.getDashboard);
router.get('/analytics', dashboardController.getAnalytics);

export default router;
