import { Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Task } from '../../entities/Task';
import { Project } from '../../entities/Project';
import { AuthRequest } from '../../middleware/auth.middleware';

export const listTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const taskRepo = AppDataSource.getRepository(Task);

  const projectIdStr = req.query.projectId as string | undefined;

  const qb = taskRepo
    .createQueryBuilder('task')
    .innerJoin('task.project', 'project')
    .where('project.userId = :userId', { userId })
    .orderBy('task.position', 'ASC');

  if (projectIdStr) {
    qb.andWhere('task.projectId = :projectId', { projectId: Number(projectIdStr) });
  }

  const tasks = await qb.getMany();
  return res.json(tasks);
};

export const createTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const {
    projectId,
    title,
    description,
    status,
    priority,
    startDate,
    endDate,
    position,
  } = req.body;

  const projectRepo = AppDataSource.getRepository(Project);
  const taskRepo = AppDataSource.getRepository(Task);

  const project = await projectRepo.findOne({ where: { id: projectId, userId } });
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const task = taskRepo.create({
    projectId,
    title,
    description: description ?? null,
    status: status ?? undefined,
    priority: priority ?? undefined,
    startDate: startDate ?? null,
    endDate: endDate ?? null,
    position: position ?? 0,
  });

  await taskRepo.save(task);
  return res.status(201).json(task);
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const taskId = Number(req.params.id);

  const taskRepo = AppDataSource.getRepository(Task);

  const task = await taskRepo
    .createQueryBuilder('task')
    .innerJoinAndSelect('task.project', 'project')
    .where('task.id = :taskId', { taskId })
    .andWhere('project.userId = :userId', { userId })
    .getOne();

  if (!task) return res.status(404).json({ message: 'Task not found' });

  const { title, description, status, priority, startDate, endDate, position } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (startDate !== undefined) task.startDate = startDate;
  if (endDate !== undefined) task.endDate = endDate;
  if (position !== undefined) task.position = position;

  await taskRepo.save(task);
  return res.json(task);
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const taskId = Number(req.params.id);

  const taskRepo = AppDataSource.getRepository(Task);

  const task = await taskRepo
    .createQueryBuilder('task')
    .innerJoin('task.project', 'project')
    .where('task.id = :taskId', { taskId })
    .andWhere('project.userId = :userId', { userId })
    .getOne();

  if (!task) return res.status(404).json({ message: 'Task not found' });

  await taskRepo.remove(task);
  return res.json({ message: 'Task deleted ✅' });
};