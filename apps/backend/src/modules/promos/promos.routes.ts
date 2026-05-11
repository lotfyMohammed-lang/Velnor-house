import { Router } from 'express';
import { PromosController } from './promos.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware';

const router = Router();

// Admin routes
router.get('/admin', adminAuthMiddleware, PromosController.getAll);
router.post('/admin', adminAuthMiddleware, PromosController.create);
router.patch('/admin/:id/toggle', adminAuthMiddleware, PromosController.toggleStatus);
router.delete('/admin/:id', adminAuthMiddleware, PromosController.delete);

// Client routes
router.post('/validate', authMiddleware, PromosController.validate);

export default router;
