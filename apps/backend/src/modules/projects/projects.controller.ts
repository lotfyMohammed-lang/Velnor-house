import { Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Project } from '../../entities/Project';
import { AuthRequest } from '../../middleware/auth.middleware';

export const listProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const repo = AppDataSource.getRepository(Project);

    const projects = await repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, description, color } = req.body;

    const repo = AppDataSource.getRepository(Project);

    const project = repo.create({
      name,
      description: description ?? null,
      color: color ?? null,
      userId,
    });

    await repo.save(project);

    return res.status(201).json(project);
  } catch (error) {
    console.error('CREATE PROJECT ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const projectId = Number(req.params.id);
    const repo = AppDataSource.getRepository(Project);

    const project = await repo.findOne({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { name, description, color } = req.body;

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (color !== undefined) project.color = color;

    await repo.save(project);

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const projectId = Number(req.params.id);
    const repo = AppDataSource.getRepository(Project);

    const project = await repo.findOne({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await repo.remove(project);

    return res.status(200).json({ message: 'Project deleted ✅' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};