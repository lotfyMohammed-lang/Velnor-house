import { AppDataSource } from '../data-source';
import { Project } from '../entities/Project';
import { AppError } from '../middleware/error-handler';

const repo = AppDataSource.getRepository(Project);

export async function getAllProjects() {
  return repo.find({ order: { createdAt: 'DESC' } });
}

export async function getProjectById(id: number) {
  const project = await repo.findOne({
    where: { id },
    relations: ['tasks'],
  });
  if (!project) throw new AppError(404, 'Project not found');
  return project;
}

export async function createProject(data: {
  name: string;
  description?: string;
  color?: string;
}) {
  const project = repo.create(data);
  return repo.save(project);
}

export async function updateProject(
  id: number,
  data: { name?: string; description?: string | null; color?: string | null },
) {
  const project = await getProjectById(id);
  if (data.name !== undefined) project.name = data.name;
  if (data.description !== undefined) project.description = data.description;
  if (data.color !== undefined) project.color = data.color;
  return repo.save(project);
}

export async function deleteProject(id: number) {
  const result = await repo.delete(id);
  if (result.affected === 0) throw new AppError(404, 'Project not found');
}
