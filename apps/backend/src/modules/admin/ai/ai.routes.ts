import { Router } from 'express';
import { AIController } from './ai.controller';
import { adminAuthMiddleware } from '../../../middleware/admin-auth.middleware';

const router = Router();

router.post('/query', adminAuthMiddleware, AIController.query);

export default router;
