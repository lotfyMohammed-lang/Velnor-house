import type { TaskStatus, TaskPriority } from '@/types/task.types';

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  'todo': { label: 'To Do', color: 'bg-slate-100 text-slate-700' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  'done': { label: 'Done', color: 'bg-green-100 text-green-700' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

export const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];
export const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export const PROJECT_COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
];
