// src/routes/bookmark.routes.ts
import { Router } from 'express';
import { bookmarkController } from '../controllers/bookmark.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { toggleBookmarkSchema } from '../validators/content.validators';

const router = Router();

router.use(authenticate);

router.get('/', bookmarkController.list);
router.post('/toggle', validate(toggleBookmarkSchema), bookmarkController.toggle);
router.delete('/:id', bookmarkController.remove);

export default router;
