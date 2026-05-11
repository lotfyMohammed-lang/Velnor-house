import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from '../modules/projects/projects.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', listProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;