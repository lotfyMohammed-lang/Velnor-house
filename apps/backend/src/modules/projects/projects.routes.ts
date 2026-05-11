import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate';
import { createProjectSchema, updateProjectSchema, idParamSchema } from './projects.schemas';
import { createProject, deleteProject, listProjects, updateProject } from './projects.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', listProjects);
router.post('/', validate(createProjectSchema), createProject);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', validate(idParamSchema), deleteProject);

export default router;