import { Router } from 'express';
import { PerfumesController } from './perfumes.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', PerfumesController.getAll);
router.get('/:id', PerfumesController.getById);

// Protected routes
router.post('/', authMiddleware, PerfumesController.create);
router.put('/:id', authMiddleware, PerfumesController.update);
router.delete('/:id', authMiddleware, PerfumesController.delete);

export default router;