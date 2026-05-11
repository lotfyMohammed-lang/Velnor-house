import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/project.service';

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

export async function getById(_req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getProjectById(res.locals.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.updateProject(res.locals.id, req.body);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function remove(_req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.deleteProject(res.locals.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
