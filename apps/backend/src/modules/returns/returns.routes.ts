import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware';
import { ReturnsController } from './returns.controller';

const router = Router();
const controller = new ReturnsController();

// User routes
router.post('/', authMiddleware, controller.createReturnRequest);
router.get('/', authMiddleware, controller.getUserReturnRequests);

// Admin routes
router.get('/admin/all', adminAuthMiddleware, controller.adminGetAll);
router.patch('/admin/:id/status', adminAuthMiddleware, controller.adminUpdateStatus);

export default router;
