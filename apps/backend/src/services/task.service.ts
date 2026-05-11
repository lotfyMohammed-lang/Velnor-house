import { AppDataSource } from '../data-source';
import { Task, TaskStatus, TaskPriority } from '../entities/Task';
import { AppError } from '../middleware/error-handler';

const repo = AppDataSource.getRepository(Task);

export async function getAllTasks() {
  return repo.find({ order: { position: 'ASC' } });
}

export async function getTasksByProject(projectId: number) {
  return repo.find({
    where: { projectId },
    order: { position: 'ASC' },
  });
}

export async function getTaskById(id: number) {
  const task = await repo.findOne({ where: { id } });
  if (!task) throw new AppError(404, 'Task not found');
  return task;
}

export async function createTask(data: {
  title: string;
  projectId: number;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
}) {
  const maxPosition = await repo
    .createQueryBuilder('task')
    .select('COALESCE(MAX(task.position), -1)', 'max')
    .where('task.project_id = :projectId', { projectId: data.projectId })
    .andWhere('task.status = :status', { status: data.status || TaskStatus.TODO })
    .getRawOne();

  const task = repo.create({
    ...data,
    position: (maxPosition?.max ?? -1) + 1,
  });
  return repo.save(task);
}

export async function updateTask(
  id: number,
  data: {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    startDate?: string | null;
    endDate?: string | null;
  },
) {
  const task = await getTaskById(id);
  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.status !== undefined) task.status = data.status;
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.startDate !== undefined) task.startDate = data.startDate;
  if (data.endDate !== undefined) task.endDate = data.endDate;
  return repo.save(task);
}

export async function reorderTask(
  id: number,
  data: { status: TaskStatus; position: number },
) {
  return AppDataSource.transaction(async (manager) => {
    const taskRepo = manager.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id } });
    if (!task) throw new AppError(404, 'Task not found');

    const oldStatus = task.status;
    const oldPosition = task.position;
    const newStatus = data.status;
    const newPosition = data.position;

    task.status = newStatus;
    task.position = newPosition;
    await taskRepo.save(task);

    if (oldStatus === newStatus) {
      if (oldPosition < newPosition) {
        await taskRepo
          .createQueryBuilder()
          .update(Task)
          .set({ position: () => 'position - 1' })
          .where('project_id = :projectId', { projectId: task.projectId })
          .andWhere('status = :status', { status: newStatus })
          .andWhere('id != :id', { id })
          .andWhere('position > :oldPos', { oldPos: oldPosition })
          .andWhere('position <= :newPos', { newPos: newPosition })
          .execute();
      } else {
        await taskRepo
          .createQueryBuilder()
          .update(Task)
          .set({ position: () => 'position + 1' })
          .where('project_id = :projectId', { projectId: task.projectId })
          .andWhere('status = :status', { status: newStatus })
          .andWhere('id != :id', { id })
          .andWhere('position >= :newPos', { newPos: newPosition })
          .andWhere('position < :oldPos', { oldPos: oldPosition })
          .execute();
      }
    } else {
      await taskRepo
        .createQueryBuilder()
        .update(Task)
        .set({ position: () => 'position - 1' })
        .where('project_id = :projectId', { projectId: task.projectId })
        .andWhere('status = :status', { status: oldStatus })
        .andWhere('position > :oldPos', { oldPos: oldPosition })
        .execute();

      await taskRepo
        .createQueryBuilder()
        .update(Task)
        .set({ position: () => 'position + 1' })
        .where('project_id = :projectId', { projectId: task.projectId })
        .andWhere('status = :status', { status: newStatus })
        .andWhere('id != :id', { id })
        .andWhere('position >= :newPos', { newPos: newPosition })
        .execute();
    }

    return taskRepo.findOneOrFail({ where: { id } });
  });
}

export async function deleteTask(id: number) {
  return AppDataSource.transaction(async (manager) => {
    const taskRepo = manager.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id } });
    if (!task) throw new AppError(404, 'Task not found');

    await taskRepo.delete(id);

    await taskRepo
      .createQueryBuilder()
      .update(Task)
      .set({ position: () => 'position - 1' })
      .where('project_id = :projectId', { projectId: task.projectId })
      .andWhere('status = :status', { status: task.status })
      .andWhere('position > :pos', { pos: task.position })
      .execute();
  });
}
