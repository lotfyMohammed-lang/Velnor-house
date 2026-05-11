import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate';
import { createTaskSchema, updateTaskSchema, listTasksSchema, idParamSchema } from './tasks.schemas';
import { createTask, deleteTask, listTasks, updateTask } from './tasks.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(listTasksSchema), listTasks);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', validate(idParamSchema), deleteTask);

export default router;