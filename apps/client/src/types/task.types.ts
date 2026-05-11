export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string | null;
  endDate: string | null;
  position: number;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  projectId: number;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
}

export interface ReorderTaskData {
  status: TaskStatus;
  position: number;
}
