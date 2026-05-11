import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from '../modules/tasks/tasks.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;