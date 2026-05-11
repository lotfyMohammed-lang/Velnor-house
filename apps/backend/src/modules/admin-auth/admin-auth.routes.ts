import { Router } from 'express';
import { AdminAuthController } from './admin-auth.controller';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware';
import { validate } from '../../middleware/validate';
import { adminLoginSchema, adminRegisterSchema } from './admin-auth.schemas';

const router = Router();

router.post('/login', validate(adminLoginSchema), AdminAuthController.login);
router.post('/register', adminAuthMiddleware, validate(adminRegisterSchema), AdminAuthController.register);

export default router;
