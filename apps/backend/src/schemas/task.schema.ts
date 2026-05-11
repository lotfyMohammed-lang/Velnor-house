import { z } from 'zod';

const statusEnum = z.enum(['todo', 'in-progress', 'done']);
const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  projectId: z.number().int().positive(),
  description: z.string().trim().max(5000).optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  startDate: dateString.optional(),
  endDate: dateString.optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  startDate: dateString.nullable().optional(),
  endDate: dateString.nullable().optional(),
});

export const reorderTaskSchema = z.object({
  status: statusEnum,
  position: z.number().int().min(0),
});

export const taskQuerySchema = z.object({
  projectId: z
    .string()
    .regex(/^\d+$/, 'projectId must be a positive integer')
    .transform(Number)
    .optional(),
});
