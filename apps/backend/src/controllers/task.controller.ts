import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = res.locals.query as { projectId?: number };
    const tasks = projectId
      ? await taskService.getTasksByProject(projectId)
      : await taskService.getAllTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getById(_req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.getTaskById(res.locals.id);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.updateTask(res.locals.id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function reorder(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.reorderTask(res.locals.id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function remove(_req: Request, res: Response, next: NextFunction) {
  try {
    await taskService.deleteTask(res.locals.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
