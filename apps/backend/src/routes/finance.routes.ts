import { Router } from 'express';
import { adminAuthMiddleware } from '../middleware/admin-auth.middleware';
import { financeController } from '../controllers/finance.controller';

const router = Router();

router.get('/admin/finance/summary', adminAuthMiddleware, financeController.getFinanceSummary);

export default router;
