import { Router } from 'express';
import { PerfumesController } from './perfumes.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', PerfumesController.getAll);
router.get('/:id', PerfumesController.getById);

// Admin only routes (protected by authMiddleware for now)
router.post('/', authMiddleware, PerfumesController.create);
router.put('/:id', authMiddleware, PerfumesController.update);
router.delete('/:id', authMiddleware, PerfumesController.delete);

export default router;