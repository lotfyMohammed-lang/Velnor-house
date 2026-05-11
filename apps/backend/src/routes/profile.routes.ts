import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { updateProfile, getProfile } from '../controllers/profile.controller';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../schemas/profile.schema';

const router = Router();

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, validate(updateProfileSchema), updateProfile);

export default router;