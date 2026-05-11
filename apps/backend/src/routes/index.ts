import { Router } from 'express';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import financeRoutes from './finance.routes';

const router = Router();

router.use(projectRoutes);
router.use(taskRoutes);
router.use(financeRoutes);

export default router;